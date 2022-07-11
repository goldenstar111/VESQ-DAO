import { ethers } from 'ethers';
import { getAddresses } from '../../constants';
import { VSQPresale, MAIContract } from '../../abi';
import { setAll } from '../../helpers';
import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { JsonRpcProvider } from '@ethersproject/providers';

const initialState = {
  loading: true,
};

export interface IDOState {
  loading: boolean;
  walletFraxBalance: string;
  allowance: string;
  allotment: string;
}

interface loadIDODetailsPayload {
  wallet: string;
  networkID: number;
  provider: JsonRpcProvider;
}

export const loadIDODetails = createAsyncThunk(
  'ido/load-ido-details',
  //@ts-ignore
  async ({ wallet, networkID, provider }: loadIDODetailsPayload) => {
    const addresses = getAddresses(networkID);
    const ivsq = new ethers.Contract(addresses.IVSQ_ADDRESS, MAIContract, provider);
    const frax = new ethers.Contract(addresses.FRAX_ADDRESS, MAIContract, provider);
    const presale = new ethers.Contract(addresses.IDO, VSQPresale, provider);

    const walletFraxBalance = ethers.utils.formatEther(await frax.balanceOf(wallet));
    const allowance = ethers.utils.formatEther(await frax.allowance(wallet, presale.address));

    const iVSQinPresaleContract = await ivsq.balanceOf(presale.address);
    const presaleBuyersRemaining = await presale.remainingBuyers(presale.address);

    const allotment = ethers.utils.formatUnits(iVSQinPresaleContract / presaleBuyersRemaining, 9);

    return {
      walletFraxBalance,
      allowance,
      allotment,
    };
  },
);

export interface ChangeApprovalActionPayload {
  wallet: string;
  networkID: number;
  provider: JsonRpcProvider;
}

const idoSlice = createSlice({
  name: 'ido',
  initialState,
  reducers: {
    fetchIDOSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadIDODetails.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(loadIDODetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadIDODetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

const baseInfo = (state: { ido: IDOState }) => state.ido;

export default idoSlice.reducer;

export const { fetchIDOSuccess } = idoSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
