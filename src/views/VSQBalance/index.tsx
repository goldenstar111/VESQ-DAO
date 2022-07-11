import { Backdrop, Box, Fade, Grid, Paper, Tab, Tabs } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BondKey, getBond } from 'src/constants';
import TabPanel from '../../components/TabPanel';
import { trim } from '../../helpers';
import { useWeb3Context } from '../../hooks';
import { IReduxState } from '../../store/slices/state.interface';
import './bond.scss';
import VSQBalanceHeader from './VSQBalanceHeader';
import MainSetting from './MainSetting';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface IBondProps {
  bondKey: BondKey;
}

function VSQBalance({ bondKey }: IBondProps) {
  const { provider, address, chainID } = useWeb3Context();

  const [slippage, setSlippage] = useState(0.5);
  const [recipientAddress, setRecipientAddress] = useState(address);

  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState();

  const bond = useMemo(() => getBond(bondKey, chainID), [bondKey, chainID]);
  const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);
  const marketPrice = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].marketPrice;
  });
  const bondPrice = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondPrice;
  });
  const onRecipientAddressChange = (e: any) => {
    return setRecipientAddress(e.target.value);
  };
  const onSlippageChange = (e: any) => {
    return setSlippage(e.target.value);
  };

  useEffect(() => {
    if (address) setRecipientAddress(address);
  }, [provider, quantity, address]);

  const changeView = (event: any, newView: number) => {
    setView(newView);
  };

  let bondToken = 'MAI';

  return (
    <Fade in={true} mountOnEnter unmountOnExit>
      <Grid container id="bond-view">
        <Backdrop open={true}>
          <Fade in={true}>
            <Paper className="ohm-card1 ohm-modal1 bond-modal1">
              <VSQBalanceHeader
                bond={bond}
                slippage={slippage}
                recipientAddress={recipientAddress}
                onSlippageChange={onSlippageChange}
                onRecipientAddressChange={onRecipientAddressChange}
              />

              {/* @ts-ignore */}
              <Box>
                <div style={{ textAlign: 'center' }}>
                  <p className="vsq_amount">0.000000</p>
                  <p className="vsq_price">$ 0.00</p>
                </div>
              </Box>
              <MainSetting bondKey={bondKey} />
            </Paper>
          </Fade>
        </Backdrop>
      </Grid>
    </Fade>
  );
}

export default VSQBalance;
