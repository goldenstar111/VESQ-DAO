import { /*BigNumber, */ ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { getAddresses, getBond, BondKey } from '../../constants';
import {
  StakingContract,
  StakedVSQContract,
  BondingCalcContract,
  VSQCirculatingSupply,
  VSQTokenContract,
  VSQTokenMigrator,
  VSQPresale,
  MAIContract,
} from '../../abi';
import { addressForReserve, contractForReserve, setAll } from '../../helpers';
import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  getMarketPrice,
  getTokenPrice,
  getTokenPriceByAddress,
  getTokenPriceByAddressETH,
  getTreasuryBalance,
} from '../../helpers';

const initialState = {
  loading: true,
};

export interface IApp {
  loading: boolean;
  stakingTVL: number;
  marketPrice: number;
  marketCap: number;
  totalSupply: number;
  circSupply: number;
  currentIndex: string;
  currentBlock: number;
  currentBlockTime: number;
  fiveDayRate: number;
  treasuryBalance: number;
  stakingAPY: number;
  stakingRebase: number;
  networkID: number;
  nextRebase: number;
  stakingRatio: number;
  backingPerVSQ: number;
  treasuryRunway: number;
  pol: number;
}

interface ILoadAppDetails {
  networkID: number;
  provider: JsonRpcProvider;
}

export const loadAppDetails = createAsyncThunk(
  'app/loadAppDetails',
  //@ts-ignore
  async ({ networkID, provider }: ILoadAppDetails) => {
    //console.log('app slice entered');
    //console.log('app slice line 0');
    const maiPrice = await getTokenPrice('MAI');
    //console.log('app slice line 0.5');
    const addresses = getAddresses(networkID);
    //console.log('app slice line 0.6');
    const currentBlock = await provider.getBlockNumber();
    //console.log('app slice line 0.7');
    const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;
    //console.log('app slice line 1');
    const vsqContract = new ethers.Contract(addresses.VSQ_ADDRESS, VSQTokenContract, provider);
    const sVSQContract = new ethers.Contract(addresses.sVSQ_ADDRESS, StakedVSQContract, provider);
    const bondCalculator = new ethers.Contract(addresses.VSQ_BONDING_CALC_ADDRESS, BondingCalcContract, provider);
    const vsqCirculatingSupply = new ethers.Contract(addresses.VSQ_CIRCULATING_SUPPLY, VSQCirculatingSupply, provider);
    const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);

    /*

    //console.log('app slice line 2');
    const frax = contractForReserve('frax', networkID, provider);
    const fraxAmount = (await frax.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18;
    //console.log('app slice line 3');
    const mai = contractForReserve('mai', networkID, provider);
    const maiAmount = (await mai.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18;
    //console.log('app slice line 4');
    const dai = contractForReserve('dai', networkID, provider);
    const daiAmount = (await dai.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18;
    //console.log('app slice line 5');
    const amDAI = contractForReserve('amDAI', networkID, provider);
    const amDAIAmount = (await amDAI.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18;
    //console.log('app slice line 6');
    const ust = contractForReserve('ust', networkID, provider);
    const ustAmount = (await ust.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18;
    //console.log('app slice line 7');
    const tusd = contractForReserve('tusd', networkID, provider);
    const tusdAmount = (await tusd.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18;
    //console.log('app slice line 8');
    const fraxlp = contractForReserve('frax_vsq', networkID, provider);
    const fraxVSQAmount = await fraxlp.balanceOf(addresses.TREASURY_ADDRESS);
    const fraxValuation = await bondCalculator.valuation(addressForReserve('frax_vsq', networkID), fraxVSQAmount);
    const fraxMarkdown = await bondCalculator.markdown(addressForReserve('frax_vsq', networkID));
    const fraxVSQUSD = (fraxValuation / 1e9) * (fraxMarkdown / 1e18);
    const [fraxRfvLPValue, fraxPol] = await getFraxDiscountedPairUSD(fraxVSQAmount, networkID, provider);
    //console.log('app slice line 9');
    const mailp = contractForReserve('mai_vsq', networkID, provider);
    const maiVSQAmount = await mailp.balanceOf(addresses.TREASURY_ADDRESS);
    const maiValuation = await bondCalculator.valuation(addressForReserve('mai_vsq', networkID), maiVSQAmount);
    const maiMarkdown = await bondCalculator.markdown(addressForReserve('mai_vsq', networkID));
    const maiVSQUSD = (maiValuation / 1e9) * (maiMarkdown / 1e18);
    const [maiRfvLPValue, maiPol] = await getMaiDiscountedPairUSD(maiVSQAmount, networkID, provider);
    //console.log('app slice line 10');
    const dailp = contractForReserve('dai_vsq', networkID, provider);
    const daiVSQAmount = await dailp.balanceOf(addresses.TREASURY_ADDRESS);
    const daiValuation = await bondCalculator.valuation(addressForReserve('dai_vsq', networkID), daiVSQAmount);
    const daiMarkdown = await bondCalculator.markdown(addressForReserve('dai_vsq', networkID));
    const daiVSQUSD = (daiValuation / 1e9) * (daiMarkdown / 1e18);
    const [daiRfvLPValue, daiPol] = await getDaiDiscountedPairUSD(daiVSQAmount, networkID, provider);
    //console.log('app slice line 11');
    //console.log('app slice line 12');
    const ustlp = contractForReserve('ust_vsq', networkID, provider);
    const ustVSQAmount = await ustlp.balanceOf(addresses.TREASURY_ADDRESS);
    const ustValuation = await bondCalculator.valuation(addressForReserve('ust_vsq', networkID), ustVSQAmount);
    const ustMarkdown = await bondCalculator.markdown(addressForReserve('ust_vsq', networkID));
    const ustVSQUSD = (ustValuation / 1e9) * (ustMarkdown / 1e18);
    const [ustRfvLPValue, ustPol] = await getUstDiscountedPairUSD(ustVSQAmount, networkID, provider);
    //console.log('app slice line 13');
    const tusdlp = contractForReserve('tusd_vsq', networkID, provider);
    const tusdVSQAmount = await tusdlp.balanceOf(addresses.TREASURY_ADDRESS);
    const tusdValuation = await bondCalculator.valuation(addressForReserve('tusd_vsq', networkID), tusdVSQAmount);
    const tusdMarkdown = await bondCalculator.markdown(addressForReserve('tusd_vsq', networkID));
    const tusdVSQUSD = (tusdValuation / 1e9) * (tusdMarkdown / 1e18);
    const [tusdRfvLPValue, tusdPol] = await getTusdDiscountedPairUSD(tusdVSQAmount, networkID, provider);
    //console.log('app slice line 14');
    //gOHM
    const gOhm = new ethers.Contract('0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195', MAIContract, provider);
    const gOhmPrice = await getTokenPrice('gOHM');
    const gOhmValue = (gOhmPrice ?? 1) * ((await gOhm.balanceOf(addresses.TREASURY_ADDRESS)) / 1e18);
    console.log('gOhmValue', gOhmValue);

    const treasuryBalance =
      (gOhmValue ?? 0) +
      fraxAmount +
      maiAmount +
      daiAmount +
      fraxVSQUSD +
      maiVSQUSD +
      daiVSQUSD +
      ustAmount +
      amDAIAmount +
      tusdAmount +
      ustVSQUSD +
      tusdVSQUSD;

*/

    let treasuryBalance = await getTreasuryBalance();

    console.log('treasuryBalance 1 ', treasuryBalance);
    treasuryBalance =
      treasuryBalance +
      (await getTreasuryTokenValue(
        '0x47110d43175f7f2c2425e7d15792acc5817eb44f',
        '0x7fb27ee135db455de5ab1ccec66a24cbc82e712d',
        addresses.TREASURY_ADDRESS,
        provider,
        true,
        18,
      ));

    console.log('treasuryBalance 2 ', treasuryBalance);

    treasuryBalance =
      treasuryBalance +
      (await getTreasuryTokenValue(
        '0x9d3ee6b64e69ebe12a4bf0b01d031cb80f556ee4',
        '0xa9536b9c75a9e0fae3b56a96ac8edf76abc91978',
        addresses.TREASURY_ADDRESS,
        provider,
        true,
        18,
      ));

    console.log('treasuryBalance 3 ', treasuryBalance);

    treasuryBalance =
      treasuryBalance +
      (await getTreasuryTokenValue(
        '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
        '0x1a3acf6d19267e2d3e7f898f42803e90c9219062',
        addresses.TREASURY_ADDRESS,
        provider,
        true,
        18,
      ));

    console.log('treasuryBalance 4 ', treasuryBalance);

    treasuryBalance =
      treasuryBalance +
      (await getTreasuryTokenValue(
        '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
        '0xc9c1c1c20b3658f8787cc2fd702267791f224ce1',
        addresses.TREASURY_ADDRESS,
        provider,
        true,
        18,
      ));

    console.log('treasuryBalance 5 ', treasuryBalance);
    const treasuryRiskFreeValue = treasuryBalance; //NOTE: we are using the real treasury balance, this code to the right is risk free calcs: fraxAmount + maiAmount + daiAmount + fraxRfvLPValue + maiRfvLPValue + daiRfvLPValue;
    console.log('treasuryRiskFreeValue ', treasuryRiskFreeValue);
    const pol = 0; // fraxPol + maiPol + daiPol + ustPol + tusdPol;

    const stakingBalance = await stakingContract.contractBalance();
    // dummy comment
    const totalSupply = (await vsqContract.totalSupply()) / 1e9;
    const circSupply = totalSupply; // - (await vsqContract.balanceOf(stakingContract.address)) / 1e9;
    console.log('circSupply ', circSupply);
    const epoch = await stakingContract.epoch();
    const stakingReward = epoch.distribute / 1e9;
    console.log('stakingReward ', stakingReward);
    const sVSQCirc = (await sVSQContract.circulatingSupply()) / 1e9;
    console.log('sVSQCirc ', sVSQCirc);
    const stakingRebase = stakingReward / sVSQCirc;
    const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
    console.log('stakingRebase ', stakingRebase);
    const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;
    console.log('stakingAPY ', stakingAPY);
    const stakingRatio = sVSQCirc / circSupply;
    const backingPerVSQ = treasuryRiskFreeValue / circSupply;

    const currentIndex = await stakingContract.index();
    const nextRebase = epoch.endTime.toNumber();
    console.log('nextRebase ', nextRebase);

    const rawMarketPrice = await getMarketPrice(networkID, provider);
    const marketPrice = Number(((rawMarketPrice.toNumber() / 1e9) * maiPrice).toFixed(2));

    const stakingTVL = (stakingBalance * marketPrice) / 1e9;
    const marketCap = circSupply * marketPrice;

    const treasuryRunway = Math.log(treasuryRiskFreeValue / sVSQCirc) / Math.log(1 + stakingRebase) / 3;

    return {
      currentIndex: ethers.utils.formatUnits(currentIndex, 'gwei'),
      totalSupply,
      circSupply,
      marketCap,
      currentBlock,
      fiveDayRate,
      treasuryBalance,
      stakingAPY,
      stakingTVL,
      stakingRebase,
      marketPrice,
      currentBlockTime,
      nextRebase,
      stakingRatio,
      backingPerVSQ,
      treasuryRunway,
      pol,
    };
  },
);
/*
//(slp_treasury/slp_supply)*(2*sqrt(lp_dai * lp_vsq))
async function getFraxDiscountedPairUSD(
  lpAmount: BigNumber,
  networkID: number,
  provider: JsonRpcProvider,
): Promise<[number, number]> {
  const pair = contractForReserve('frax_vsq', networkID, provider);
  const total_lp = await pair.totalSupply();
  const reserves = await pair.getReserves();
  const address = getAddresses(networkID);
  const [vsq, frax] = BigNumber.from(address.FRAX_ADDRESS).gt(address.VSQ_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]];
  const lp_token_1 = vsq / 1e9;
  const lp_token_2 = frax / 1e18;
  const kLast = lp_token_1 * lp_token_2;

  const pol = lpAmount.mul(100).div(total_lp).toNumber() / 100;
  const part2 = Math.sqrt(kLast) * 2;
  // return [pol * lp_token_2, pol];
  return [pol * part2, pol];
}

async function getMaiDiscountedPairUSD(
  lpAmount: BigNumber,
  networkID: number,
  provider: JsonRpcProvider,
): Promise<[number, number]> {
  const pair = contractForReserve('mai_vsq', networkID, provider);
  const total_lp = await pair.totalSupply();
  const reserves = await pair.getReserves();
  const address = getAddresses(networkID);
  const [vsq, mai] = BigNumber.from(address.MAI_ADDRESS).gt(address.VSQ_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]];
  const lp_token_1 = vsq / 1e9;
  const lp_token_2 = mai / 1e18;
  const kLast = lp_token_1 * lp_token_2;

  const pol = lpAmount.mul(100).div(total_lp).toNumber() / 100;
  const part2 = Math.sqrt(kLast) * 2;
  // return [pol * lp_token_2, pol];
  return [pol * part2, pol];
}

async function getDaiDiscountedPairUSD(
  lpAmount: BigNumber,
  networkID: number,
  provider: JsonRpcProvider,
): Promise<[number, number]> {
  const pair = contractForReserve('dai_vsq', networkID, provider);
  const total_lp = await pair.totalSupply();
  const reserves = await pair.getReserves();
  const address = getAddresses(networkID);
  const [vsq, dai] = BigNumber.from(address.DAI_ADDRESS).gt(address.VSQ_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]];
  const lp_token_1 = vsq / 1e9;
  const lp_token_2 = dai / 1e18;
  const kLast = lp_token_1 * lp_token_2;

  const pol = lpAmount.mul(100).div(total_lp).toNumber() / 100;
  const part2 = Math.sqrt(kLast) * 2;
  // return [pol * lp_token_2, pol];
  return [pol * part2, pol];
}

async function getUstDiscountedPairUSD(
  lpAmount: BigNumber,
  networkID: number,
  provider: JsonRpcProvider,
): Promise<[number, number]> {
  const pair = contractForReserve('ust_vsq', networkID, provider);
  const total_lp = await pair.totalSupply();
  const reserves = await pair.getReserves();
  const address = getAddresses(networkID);
  const [vsq, ust] = BigNumber.from(address.UST_ADDRESS).gt(address.VSQ_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]];
  const lp_token_1 = vsq / 1e9;
  const lp_token_2 = ust / 1e18;
  const kLast = lp_token_1 * lp_token_2;

  const pol = lpAmount.mul(100).div(total_lp).toNumber() / 100;
  const part2 = Math.sqrt(kLast) * 2;
  // return [pol * lp_token_2, pol];
  return [pol * part2, pol];
}

async function getTusdDiscountedPairUSD(
  lpAmount: BigNumber,
  networkID: number,
  provider: JsonRpcProvider,
): Promise<[number, number]> {
  const pair = contractForReserve('tusd_vsq', networkID, provider);
  const total_lp = await pair.totalSupply();
  const reserves = await pair.getReserves();
  const address = getAddresses(networkID);
  const [vsq, tusd] = BigNumber.from(address.TUSD_ADDRESS).gt(address.VSQ_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]];
  const lp_token_1 = vsq / 1e9;
  const lp_token_2 = tusd / 1e18;
  const kLast = lp_token_1 * lp_token_2;

  const pol = lpAmount.mul(100).div(total_lp).toNumber() / 100;
  const part2 = Math.sqrt(kLast) * 2;
  // return [pol * lp_token_2, pol];
  return [pol * part2, pol];
}
*/

async function getTreasuryTokenValue(
  ethTokenAddress: string,
  polygonTokenAddress: string,
  treasuryAddress: string,
  provider: JsonRpcProvider,
  eth: boolean,
  decimals: number,
) {
  const token = new ethers.Contract(polygonTokenAddress, MAIContract, provider);

  console.log('tokenAddress ', polygonTokenAddress.toString());

  console.log('treasuryAddress ', treasuryAddress);

  const tokenBalance = await token.balanceOf(treasuryAddress);

  console.log('tokenBalance ', tokenBalance.toString());

  const tokenPrice = eth
    ? await getTokenPriceByAddressETH(ethTokenAddress)
    : await getTokenPriceByAddress(polygonTokenAddress);

  console.log('tokenPrice treasury ', tokenPrice.toString());

  const tokenValue = new BigNumber(tokenBalance.toString()).div(new BigNumber(10).pow(decimals)).times(tokenPrice);

  console.log('tokenValue ', tokenValue.toString());

  return tokenValue ? tokenValue.toNumber() : 0;
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

const baseInfo = (state: { app: IApp }) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
