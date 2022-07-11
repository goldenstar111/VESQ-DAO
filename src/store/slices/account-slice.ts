import { ethers } from 'ethers';
import { Bond, BondKey, getAddresses, getBond } from '../../constants';
import { VSQTokenContract, StakedVSQContract, MAIContract, StakingContract } from '../../abi/';
import { contractForBond, contractForReserve, setAll } from '../../helpers';

import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { JsonRpcProvider } from '@ethersproject/providers';
import _ from 'lodash';

interface IState {
  [key: string]: any;
}

const initialState: IState = {
  loading: true,
};

interface IAccountProps {
  address: string;
  networkID: number;
  provider: JsonRpcProvider;
}

interface IUserBindDetails {
  bond?: string;
  allowance?: number;
  balance?: number;
  interestDue?: number;
  bondMaturationTime?: number;
  pendingPayout?: number;
}

export interface IAccount {
  balances: {
    frax: string;
    mai: string;
    dai: string;
    sVSQ: string;
    vsq: string;
  };
  staking: {
    vsqStake: number;
    sVSQUnstake: number;
    warmup: string;
    canClaimWarmup: boolean;
  };
}

export const getBalances = createAsyncThunk(
  'account/getBalances',
  async ({ address, networkID, provider }: IAccountProps) => {
    const addresses = getAddresses(networkID);
    const sVSQContract = new ethers.Contract(addresses.sVSQ_ADDRESS, StakedVSQContract, provider);
    const sVSQBalance = await sVSQContract.balanceOf(address);
    const vsqContract = new ethers.Contract(addresses.VSQ_ADDRESS, VSQTokenContract, provider);
    const vsqBalance = await vsqContract.balanceOf(address);
    return {
      balances: {
        sVSQ: ethers.utils.formatUnits(sVSQBalance, 9),
        vsq: ethers.utils.formatUnits(vsqBalance, 9),
      },
    };
  },
);

export const loadAccountDetails = createAsyncThunk(
  'account/loadAccountDetails',
  async ({ networkID, provider, address }: IAccountProps): Promise<IAccount> => {
    const addresses = getAddresses(networkID);

    const fraxContract = new ethers.Contract(addresses.MAI_ADDRESS, MAIContract, provider);
    const maiContract = new ethers.Contract(addresses.MAI_ADDRESS, MAIContract, provider);
    const daiContract = new ethers.Contract(addresses.MAI_ADDRESS, MAIContract, provider);
    const vsqContract = new ethers.Contract(addresses.VSQ_ADDRESS, VSQTokenContract, provider);
    const sVSQContract = new ethers.Contract(addresses.sVSQ_ADDRESS, StakedVSQContract, provider);
    const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);

    const [
      fraxBalance,
      maiBalance,
      daiBalance,
      vsqBalance,
      stakeAllowance,
      sVSQBalance,
      unstakeAllowance,
      warmup,
      epoch,
    ] = await Promise.all([
      fraxContract.balanceOf(address),
      maiContract.balanceOf(address),
      daiContract.balanceOf(address),
      vsqContract.balanceOf(address),
      vsqContract.allowance(address, addresses.STAKING_HELPER_ADDRESS),
      sVSQContract.balanceOf(address),
      sVSQContract.allowance(address, addresses.STAKING_ADDRESS),
      stakingContract.warmupInfo(address),
      stakingContract.epoch(),
    ]);

    const gons = warmup[1];
    const warmupBalance = await sVSQContract.balanceForGons(gons);

    return {
      balances: {
        sVSQ: ethers.utils.formatUnits(sVSQBalance, 9),
        vsq: ethers.utils.formatUnits(vsqBalance, 9),
        frax: ethers.utils.formatEther(fraxBalance),
        mai: ethers.utils.formatEther(maiBalance),
        dai: ethers.utils.formatEther(daiBalance),
      },
      staking: {
        vsqStake: +stakeAllowance,
        sVSQUnstake: +unstakeAllowance,
        warmup: ethers.utils.formatUnits(warmupBalance, 9),
        canClaimWarmup: warmup[0].gt(0) && epoch[1].gte(warmup[2]),
      },
    };
  },
);

interface ICalculateUserBondDetails {
  address: string;
  bondKey: BondKey;
  networkID: number;
  provider: JsonRpcProvider;
}

export const calculateUserBondDetails = createAsyncThunk(
  'bonding/calculateUserBondDetails',
  async ({ address, bondKey, networkID, provider }: ICalculateUserBondDetails): Promise<IUserBindDetails> => {
    if (!address) return {};

    const bondContract = contractForBond(bondKey, networkID, provider);
    const reserveContract = contractForReserve(bondKey, networkID, provider);

    let interestDue, pendingPayout, bondMaturationTime;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationTime = +bondDetails.vesting + +bondDetails.lastTime;
    pendingPayout = await bondContract.pendingPayoutFor(address);

    const bond = getBond(bondKey, networkID);
    const allowance = await reserveContract.allowance(address, bond.address);

    const bondWeiBalance = await reserveContract.balanceOf(address);

    console.log('bondKey ', bondKey);

    console.log('bondWeiBalance ', bondWeiBalance.toString());

    const balance = ethers.utils.formatUnits(bondWeiBalance, bond.decimals);

    console.log('balance ', balance);

    return {
      bond: bondKey,
      allowance: Number(allowance),
      balance: Number(balance),
      interestDue,
      bondMaturationTime,
      pendingPayout: Number(ethers.utils.formatUnits(pendingPayout, 'gwei')),
    };
  },
);

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      _.merge(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.status = 'loading';
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.status = 'idle';
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.status = 'idle';
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.status = 'loading';
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.status = 'idle';
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.status = 'idle';
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        //@ts-ignore
        const bond = action.payload.bond!;
        state[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: { account: IAccount }) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
