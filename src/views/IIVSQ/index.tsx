import { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Box,
  Paper,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Tab,
  Tabs,
  TabsActions,
  Zoom,
  makeStyles,
} from '@material-ui/core';
import RebaseTimer from '../../components/RebaseTimer/RebaseTimer';
import TabPanel from '../../components/TabPanel';
import { trim } from '../../helpers';
import { changeStake, changeApproval, claimWarmup } from '../../store/slices/stake-thunk';
// import './iso.scss';
import { useWeb3Context } from '../../hooks';
import { fetchPendingTxns, clearPendingTxn } from '../../store/slices/pending-txns-slice';
import { IPendingTxn, isPendingTxn, txnButtonText } from '../../store/slices/pending-txns-slice';
import { Skeleton } from '@material-ui/lab';
import { IReduxState } from '../../store/slices/state.interface';

import { PresaleRedeem, MAIContract } from 'src/abi';
import { getAddresses } from 'src/constants';

const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiOutlinedInput-root': {
      borderColor: 'transparent',
      backgroundColor: '#212121',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode.lightGray300,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode.lightGray300,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode.lightGray300,
    },
  },
  stakeApy: {
    border: 'solid 3px',
    borderRadius: '50% 50%',
    width: '220px',
    height: '220px',
    justifyContent: 'center',
  },
  tabclass: {
    fontWeight: 'lighter',
    fontSize: '24px',
  },
}));

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface State {
  loading: boolean;
  txPending: boolean;
  connected: boolean;
  walletIIVSQBalance?: string;
  walletVSQBalance?: string;
  walletIIVSQAllowance?: string;
  blocknumber?: number;
  error?: Error;
}

export type Action =
  | {
      type: 'load-details-complete';
      walletIIVSQBalance: string;
      walletVSQBalance: string;
      walletIIVSQAllowance: string;
      blocknumber: number;
      connected: boolean;
    }
  | {
      type: 'approve';
    }
  | {
      type: 'approved';
      walletIIVSQAllowance: string;
    }
  | {
      type: 'purchasing';
    }
  | {
      type: 'purchased';
    }
  | {
      type: 'error';
      error: Error;
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load-details-complete':
      let { type, connected, ...rest } = action;
      if (state.connected && !connected) {
        return state;
      }
      return {
        ...state,
        ...rest,
        loading: false,
        error: undefined,
      };
    case 'approve': {
      return { ...state, txPending: true, error: undefined };
    }
    case 'approved': {
      return {
        ...state,
        txPending: false,
        walletIIVSQAllowance: action.walletIIVSQAllowance,
      };
    }
    case 'purchasing': {
      return { ...state, txPending: true, error: undefined };
    }
    case 'purchased': {
      return { ...state, txPending: false };
    }
    case 'error': {
      return { ...state, error: action.error, loading: false, txPending: false };
    }
  }
}

function ISO() {
  const styles = useStyles();
  const { provider, address, connected, chainID } = useWeb3Context();
  const tabsActions = useRef<TabsActions>(null);

  const [quantity, setQuantity] = useState<string>();

  const [approveFlipper, setApproveFlipper] = useState<boolean>(false);

  const [refresh, setRefresh] = useState<boolean>(false);

  const [approving, setApproving] = useState<boolean>(false);

  const addresses = getAddresses(chainID);

  const setMax = () => {
    setQuantity(Number(state.walletIIVSQBalance).toFixed(10).slice(0, -1));
  };

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    txPending: false,
    connected: false,
  });

  const iivsq = new ethers.Contract(addresses.IIVSQ_ADDRESS, MAIContract, provider);
  const presaleRedeem = new ethers.Contract(addresses.IVSQ_REDEEM, PresaleRedeem, provider);

  const loadDetails = useCallback(async () => {
    // pointless comment
    const iivsq = new ethers.Contract(addresses.IIVSQ_ADDRESS, MAIContract, provider);
    const vsq = new ethers.Contract(addresses.VSQ_ADDRESS, MAIContract, provider);

    const walletIIVSQBalance = ethers.utils.formatUnits(await iivsq.balanceOf(address), 9);
    const walletVSQBalance = ethers.utils.formatUnits(await vsq.balanceOf(address), 9);
    const walletIIVSQAllowance = ethers.utils.formatEther(await iivsq.allowance(address, addresses.IIVSQ_REDEEM));

    const blocknumber = await provider.getBlockNumber();

    console.log('loading details for IIVSQ Redeem Page');

    dispatch({
      type: 'load-details-complete',
      walletIIVSQBalance,
      walletVSQBalance,
      walletIIVSQAllowance,
      blocknumber,
      connected: Boolean(connected),
    });
  }, [address, provider, connected]);

  useEffect(() => {
    loadDetails();
  }, [connected, approveFlipper, refresh]);

  useEffect(() => {
    setInterval(() => {
      setRefresh((flip: boolean) => !flip);
    }, 30 * 1000);
  }, []);

  return (
    <div id="stake-view" className={styles.root}>
      <Zoom in={true} style={{ backgroundColor: '#212121' }}>
        <Paper className="ohm-card">
          <Grid container direction="column" spacing={0}>
            <Grid item>
              <div className="card-header">
                <p className="single-stake-title" style={{ fontSize: '24px', fontWeight: 'lighter' }}>
                  Redeem IIVSQ
                </p>
                <p style={{ fontWeight: 200, color: '#F2F2F2' }}>
                  {!isNaN(Number(state.walletIIVSQBalance)) && Number(state.walletIIVSQBalance) > 0
                    ? 'Your account has IIVSQ!'
                    : 'No IIVSQ in wallet recognized!'}
                </p>
              </div>
            </Grid>

            {/* Just Background */}
          </Grid>
        </Paper>
      </Zoom>
      <div className="gentle-background">
        <div className="staking-area">
          <>
            <Paper square className="stake-action-area">
              <Tabs
                action={tabsActions}
                centered
                value={0}
                indicatorColor="primary"
                className="stake-tab-buttons"
                aria-label="stake tabs"
                variant="fullWidth"
              >
                <Tab label="IIVSQ" {...a11yProps(0)} className={styles.tabclass} />
              </Tabs>
              <Box className="stake-action-row">
                <FormControl className="ohm-input" variant="outlined" color="primary">
                  <InputLabel htmlFor="amount-input"></InputLabel>
                  <OutlinedInput
                    id="amount-input"
                    type="number"
                    placeholder="Enter an amount in IIVSQ"
                    className="stake-input"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    labelWidth={0}
                    endAdornment={
                      <InputAdornment position="end">
                        <div onClick={setMax} className="stake-input-btn">
                          <p>Max</p>
                        </div>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                {/* <FormControl className="ohm-input" variant="outlined" color="primary">
                  <InputLabel htmlFor="amount-input"></InputLabel>
                  <OutlinedInput
                    id="amount-input"
                    type="number"
                    placeholder="Enter an amount in VSQ"
                    className="stake-input"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    labelWidth={0}
                    endAdornment={
                      <InputAdornment position="end">
                        <div onClick={setMax} className="stake-input-btn">
                          <p>Max</p>
                        </div>
                      </InputAdornment>
                    }
                  />
                </FormControl> */}
                <div className="iso-tab-buttons-group">
                  {Number(state.walletIIVSQAllowance) == 0 ? (
                    <Box
                      className="iso-tab-panel-btn"
                      bgcolor="otter.otterBlue"
                      onClick={async () => {
                        const iivsq = new ethers.Contract(addresses.IIVSQ_ADDRESS, MAIContract, provider);

                        let approveTx;
                        try {
                          approveTx = await iivsq
                            .connect(provider.getSigner())
                            .approve(addresses.IIVSQ_REDEEM, '1111111111111111111111111111111111', {
                              gasPrice: '130000000000',
                            });

                          setApproving(true);

                          await approveTx.wait(2);
                          console.log('approve waited!!');
                          setApproveFlipper((flip: boolean) => !flip);
                        } catch (err) {
                          // alert(err.message);
                          return;
                        }
                      }}
                    >
                      <p>{!approving ? 'Approve' : 'Approving...'}</p>
                    </Box>
                  ) : (
                    <Box
                      className="iso-tab-panel-btn"
                      bgcolor="otter.otterBlue"
                      onClick={async () => {
                        const presaleRedeemAmountVSQ = Number(quantity);
                        console.log(' presaleRedeemAmountVSQ ', presaleRedeemAmountVSQ);
                        if (isNaN(presaleRedeemAmountVSQ)) {
                          alert('Please enter an amount of VSQ to redeem!');
                          return;
                        }

                        const presaleRedeem = new ethers.Contract(addresses.IIVSQ_REDEEM, PresaleRedeem, provider);
                        try {
                          const vsqWei = BigNumber.from(Math.floor(presaleRedeemAmountVSQ * 1000000000)).toString();

                          console.log('vsqWei ', vsqWei);

                          await presaleRedeem
                            .connect(provider.getSigner())
                            .swapPreVSQForVSQ(vsqWei, { gasPrice: '130000000000' });
                        } catch (err) {
                          // if (err.data && err.data.message) alert(err.data.message);
                          // else alert(err.message);
                          return;
                        }
                      }}
                    >
                      <p>Redeem</p>
                    </Box>
                  )}
                </div>
              </Box>
            </Paper>

            <div className={`stake-user-data`}>
              <Grid container spacing={3}>
                <Grid container item xs={12} sm={5} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>IIVSQ Wallet Balance</p>
                    <p>
                      {(isNaN(Number(state.walletIIVSQBalance)) ? 0 : Number(state.walletIIVSQBalance) ?? 0).toFixed(2)}{' '}
                      IIVSQ
                    </p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={7} spacing={0} className={'balanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>VSQ Wallet Balance</p>
                    <p>
                      {(isNaN(Number(state.walletVSQBalance)) ? 0 : Number(state.walletVSQBalance) ?? 0).toFixed(2)} VSQ
                    </p>
                  </div>
                </Grid>
              </Grid>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}

export default ISO;
