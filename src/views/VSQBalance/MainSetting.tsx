import { Box, Slide } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { BondKey, getBond } from 'src/constants';
import { prettifySeconds, prettyVestingPeriod, trim } from '../../helpers';
import { useWeb3Context } from '../../hooks';
import { redeemBond } from '../../store/slices/bond-slice';
import { IPendingTxn, isPendingTxn, txnButtonText } from '../../store/slices/pending-txns-slice';
import { IReduxState } from '../../store/slices/state.interface';

interface IBondRedeem {
  bondKey: BondKey;
}

function MainSetting({ bondKey }: IBondRedeem) {
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();
  const bond = getBond(bondKey, chainID);

  const currentBlockTime = useSelector<IReduxState, number>(state => state.app.currentBlockTime);
  const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);
  const bondMaturationTime = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].bondMaturationTime;
  });
  const vestingTerm = useSelector<IReduxState, number>(state => state.bonding[bondKey]?.vestingTerm);
  const interestDue = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].interestDue;
  });
  const pendingPayout = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].pendingPayout;
  });
  const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => state.pendingTransactions);

  async function onRedeem(autostake: boolean) {
    await dispatch(redeemBond({ address, bondKey, networkID: chainID, provider, autostake }));
  }

  const vestingTime = () => {
    return prettyVestingPeriod(currentBlockTime, bondMaturationTime);
  };

  const vestingPeriod = () => {
    return prettifySeconds(vestingTerm, 'day');
  };

  const bondDiscount = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondDiscount;
  });

  const debtRatio = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].debtRatio;
  });

  return (
    <Box display="flex" flexDirection="column">
      <Slide direction="right" in={true} mountOnEnter unmountOnExit {...{ timeout: 1 }}>
        <Box className="bond-data1">
          <div className="data-row">
            <p className="bond-balance-title1">Market Cap</p>
            <p className="price-data bond-balance-value1">$ 0.00</p>
          </div>
          <div className="data-row">
            <p className="bond-balance-title1">Price</p>
            <p className="price-data bond-balance-value1">$ 0.00</p>
          </div>
          <div className="data-row">
            <p className="bond-balance-title1">APY</p>
            <p className="price-data bond-balance-value1">0%</p>
          </div>
          <div className="data-row">
            <p className="bond-balance-title1">TVL</p>
            <p className="bond-balance-value1">$ 0.00</p>
          </div>
        </Box>
      </Slide>
      <Box display="flex" justifyContent="space-around" flexWrap="wrap" style={{ padding: '0px 15px 0px 15px' }}>
        <button className="btn vsq_modal_button">Buy on Sushi</button>
        <button className="vsq_modal_button btn">Add VSQ</button>
        <button className="vsq_modal_button btn">Add sVSQ</button>
      </Box>
    </Box>
  );
}

export default MainSetting;
