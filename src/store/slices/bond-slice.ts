import { ethers, constants } from 'ethers';
import BigNumber from 'bignumber.js';
import {
  getMarketPrice,
  contractForBond,
  contractForReserve,
  getTokenPrice,
  getTokenPriceByAddress,
} from '../../helpers';
import { calculateUserBondDetails, getBalances } from './account-slice';
import { BondKey, getAddresses, getBond } from '../../constants';
import { BondingCalcContract } from '../../abi';
import { fetchPendingTxns, clearPendingTxn } from './pending-txns-slice';
import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { JsonRpcProvider } from '@ethersproject/providers';
import { fetchAccountSuccess } from './account-slice';
import { formatUnits } from '@ethersproject/units';

interface IState {
  [key: string]: any;
}

const initialState: IState = {
  loading: true,
};

interface IChangeApproval {
  bondKey: BondKey;
  provider: JsonRpcProvider;
  networkID: number;
  address: string;
}

export type IBond = {
  [key in BondKey]: any;
} & { loading: boolean };

export const changeApproval = createAsyncThunk(
  'bonding/changeApproval',
  async ({ bondKey, provider, networkID, address }: IChangeApproval, { dispatch }) => {
    if (!provider) {
      alert('Please connect your wallet!');
      return;
    }

    const signer = provider.getSigner();
    const reserveContract = contractForReserve(bondKey, networkID, signer);
    const bond = getBond(bondKey, networkID);

    let approveTx;
    try {
      approveTx = await reserveContract.approve(bond.address, constants.MaxUint256);
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: 'Approving ' + bond.name, type: 'approve_' + bond }));
      await approveTx.wait();
    } catch (error: any) {
      alert(error.message);
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    const allowance = await reserveContract.allowance(address, bond.address);
    const balance = ethers.utils.formatUnits(await reserveContract.balanceOf(address), bond.decimals);

    return dispatch(
      fetchAccountSuccess({
        [bondKey]: {
          allowance: +allowance,
          balance: +balance,
        },
      }),
    );
  },
);

interface ICalcBondDetails {
  bondKey: BondKey;
  value?: string | null;
  provider: JsonRpcProvider;
  networkID: number;
}

export const calcBondDetails = createAsyncThunk(
  'bonding/calcBondDetails',
  async ({ bondKey, value, provider, networkID }: ICalcBondDetails) => {
    //console.log('bond slice entered');

    const bond = getBond(bondKey, networkID);

    let amountInWei;
    if (!value || value === '') {
      amountInWei = ethers.utils.parseEther('0.0001'); // Use a realistic SLP ownership
    } else {
      amountInWei = ethers.utils.parseUnits(value, 9);
    }
    //console.log('bond slice 1');
    let bondPrice = 0,
      bondDiscount = 0,
      valuation,
      bondQuote;

    const addresses = getAddresses(networkID);
    //console.log('bond slice 2');
    const bondContract = contractForBond(bondKey, networkID, provider);

    const bondCalcContract = new ethers.Contract(addresses.VSQ_BONDING_CALC_ADDRESS, BondingCalcContract, provider);
    //console.log('bond slice 3');
    const terms = await bondContract.terms();
    //console.log('bond slice 4');
    const maxBondPrice = await bondContract.maxPayout();
    //console.log('bond slice 5');
    const standardizedDebtRatio = await bondContract.standardizedDebtRatio();
    let debtRatio = standardizedDebtRatio / 1e9;
    //console.log('bond slice 6');
    const maiPrice = await getTokenPrice('MAI');
    const rawMarketPrice = (await getMarketPrice(networkID, provider)).mul(maiPrice);
    const marketPrice = formatUnits(rawMarketPrice, 9);
    //console.log('bond slice 7');

    console.log('marketPrice ', marketPrice);

    let bondReserveTokenPrice = await getTokenPriceByAddress(bond.reserve);
    bondReserveTokenPrice = bondReserveTokenPrice ? bondReserveTokenPrice : 1;

    console.log('bondKey ', bondKey);
    console.log('bondReserveTokenPrice ', bondReserveTokenPrice);

    try {
      const rawBondPriceUSD = await bondContract.bondPriceInUSD();
      console.log('rawBondPriceUSD ', rawBondPriceUSD.toString());
      bondPrice = bondReserveTokenPrice * rawBondPriceUSD;
      bondDiscount =
        (Number(marketPrice) * Math.pow(10, !(bond.type === 'lp') ? bond.decimals : 18) - bondPrice) / bondPrice;
    } catch (e) {
      console.log('error getting bondPriceInUSD', e);
    }

    if (bond.type === 'lp') {
      valuation = await bondCalcContract.valuation(bond.reserve, amountInWei);
      //console.log('bond slice 8');
      bondQuote = await bondContract.payoutFor(valuation);
      //console.log('bond slice 9');
      bondQuote = bondQuote / 1e9;
    } else {
      //console.log('bond slice 10');
      bondQuote = await bondContract.payoutFor(amountInWei);
      //console.log('bond slice 11');
      bondQuote = bondQuote / Math.pow(10, 9);
      // @dev: fix for non-lp bond
      debtRatio = standardizedDebtRatio.toNumber();
    }
    //console.log('bond slice 12');
    // Display error if user tries to exceed maximum.
    if (!!value && bondQuote > maxBondPrice / 1e9) {
      alert(
        "You're trying to bond more than the maximum payout available! The maximum bond payout is " +
          (maxBondPrice / 1e9).toFixed(2).toString() +
          ' VSQ.',
      );
    }

    //console.log('bond slice 13');
    // Calculate bonds purchased
    const token = contractForReserve(bondKey, networkID, provider);
    let purchased = await token.balanceOf(addresses.TREASURY_ADDRESS);
    //console.log('bond slice 14');
    if (bond.type === 'lp') {
      const markdown = await bondCalcContract.markdown(bond.reserve);
      purchased = await bondCalcContract.valuation(bond.reserve, purchased);
      purchased = (markdown / 1e18) * (purchased / 1e9);
    } else {
      purchased = bondReserveTokenPrice * purchased;
      purchased = new BigNumber(purchased).div(new BigNumber(10).pow(bond.decimals)).toNumber();
    }

    const bondAns = {
      bond: bondKey,
      bondDiscount,
      debtRatio,
      bondQuote,
      purchased,
      vestingTerm: Number(terms.vestingTerm),
      maxBondPrice: maxBondPrice / 1e9,
      bondPrice: new BigNumber(bondPrice.toString()).div(new BigNumber(10).pow(bond.decimals)).toNumber(),
      marketPrice,
    };

    console.log('main bond logic loaded ', bondAns);

    return bondAns;
  },
);

interface IBondAsset {
  value: string;
  address: string;
  bondKey: BondKey;
  networkID: number;
  provider: JsonRpcProvider;
  slippage: number;
}
export const bondAsset = createAsyncThunk(
  'bonding/bondAsset',
  async ({ value, address, bondKey, networkID, provider, slippage }: IBondAsset, { dispatch }) => {
    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005;

    const bond = getBond(bondKey, networkID);

    const valueInWei = ethers.utils.parseUnits(value.toString(), bond.decimals);

    const signer = provider.getSigner();
    const bondContract = contractForBond(bondKey, networkID, signer);

    const calculatePremium = await bondContract.bondPrice();
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    let bondTx;
    try {
      console.log('bond deposit value in wei ', valueInWei.toString());
      bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress);

      dispatch(fetchPendingTxns({ txnHash: bondTx.hash, text: 'Bonding ' + bond.name, type: 'bond_' + bondKey }));
      await bondTx.wait();
      dispatch(calculateUserBondDetails({ address, bondKey, networkID, provider }));
      return;
    } catch (error: any) {
      if (error.code === -32603 && error.message.indexOf('ds-math-sub-underflow') >= 0) {
        alert('You may be trying to bond more than your balance! Error code: 32603. Message: ds-math-sub-underflow');
      } else alert(error.message);
      return;
    } finally {
      if (bondTx) {
        dispatch(clearPendingTxn(bondTx.hash));
      }
    }
  },
);

interface IRedeemBond {
  address: string;
  bondKey: BondKey;
  networkID: number;
  provider: JsonRpcProvider;
  autostake: boolean;
}

export const redeemBond = createAsyncThunk(
  'bonding/redeemBond',
  async ({ address, bondKey, networkID, provider, autostake }: IRedeemBond, { dispatch }) => {
    if (!provider) {
      alert('Please connect your wallet!');
      return;
    }

    const signer = provider.getSigner();
    const bondContract = contractForBond(bondKey, networkID, signer);
    const bond = getBond(bondKey, networkID);

    let redeemTx;
    try {
      redeemTx = await bondContract.redeem(address, autostake === true);
      const pendingTxnType = 'redeem_bond_' + bond + (autostake === true ? '_autostake' : '');
      dispatch(fetchPendingTxns({ txnHash: redeemTx.hash, text: 'Redeeming ' + bond.name, type: pendingTxnType }));
      await redeemTx.wait();
      await dispatch(calculateUserBondDetails({ address, bondKey, networkID, provider }));
      dispatch(getBalances({ address, networkID, provider }));
      return;
    } catch (error: any) {
      alert(error.message);
    } finally {
      if (redeemTx) {
        dispatch(clearPendingTxn(redeemTx.hash));
      }
    }
  },
);

const bondingSlice = createSlice({
  name: 'bonding',
  initialState,
  reducers: {
    fetchBondSuccess(state, action) {
      state[action.payload.bond] = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(calcBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calcBondDetails.fulfilled, (state, action) => {
        state[action.payload.bond] = action.payload;
        state.loading = false;
      })
      .addCase(calcBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: { bonding: IBond }) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
