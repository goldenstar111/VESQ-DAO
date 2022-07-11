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

import { PVSQRedeem, MAIContract } from 'src/abi';
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
  walletPVSQBalance?: string;
  walletVSQBalance?: string;
  walletPVSQAllowance?: string;
  allotment?: string;
  pVSQRedeemed?: string;
  pVSQAvailable?: string;
  blocknumber?: number;
  error?: Error;
}

export type Action =
  | {
      type: 'load-details-complete';
      walletPVSQBalance: string;
      walletVSQBalance: string;
      walletPVSQAllowance: string;
      allotment: string;
      pVSQRedeemed: string;
      pVSQAvailable: string;
      blocknumber: number;
      connected: boolean;
    }
  | {
      type: 'approve';
    }
  | {
      type: 'approved';
      walletPVSQAllowance: string;
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
        walletPVSQAllowance: action.walletPVSQAllowance,
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

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    txPending: false,
    connected: false,
  });

  const pvsq = new ethers.Contract(addresses.PVSQ_ADDRESS, MAIContract, provider);
  const presaleRedeem = new ethers.Contract(addresses.PVSQ_REDEEM, PVSQRedeem, provider);

  const loadDetails = useCallback(async () => {
    // pointless comment
    const pvsq = new ethers.Contract(addresses.PVSQ_ADDRESS, MAIContract, provider);
    const vsq = new ethers.Contract(addresses.VSQ_ADDRESS, MAIContract, provider);

    const walletPVSQBalance = ethers.utils.formatUnits(await pvsq.balanceOf(address), 0);
    const walletVSQBalance = ethers.utils.formatUnits(await vsq.balanceOf(address), 9);
    const walletPVSQAllowance = ethers.utils.formatEther(await pvsq.allowance(address, addresses.PVSQ_REDEEM));

    const pvsqRedeem = new ethers.Contract(addresses.PVSQ_REDEEM, PVSQRedeem, provider);

    const allotment = ethers.utils.formatUnits(await pvsqRedeem.allocationMap(address), 9);
    const pVSQRedeemed = ethers.utils.formatUnits(await pvsqRedeem.redeemedMap(address), 9);
    const pVSQAvailable = ethers.utils.formatUnits(await pvsqRedeem.vsqAvailableForUser(address), 9);

    const blocknumber = await provider.getBlockNumber();

    console.log('loading details for PVSQ Redeem Page');

    dispatch({
      type: 'load-details-complete',
      walletPVSQBalance,
      walletVSQBalance,
      walletPVSQAllowance,
      allotment,
      pVSQRedeemed,
      pVSQAvailable,
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
                  Redeem pVSQ
                </p>
                <p style={{ fontWeight: 200, color: '#F2F2F2' }}>
                  {!isNaN(Number(state.walletPVSQBalance)) && Number(state.walletPVSQBalance) > 0
                    ? 'Your account has pVSQ!'
                    : 'No pVSQ in wallet recognized!'}
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
                <Tab label="pVSQ" {...a11yProps(0)} className={styles.tabclass} />
              </Tabs>
              <Box className="stake-action-row">
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
                  {Number(state.walletPVSQAllowance) == 0 ? (
                    <Box
                      className="iso-tab-panel-btn"
                      bgcolor="otter.otterBlue"
                      onClick={async () => {
                        const pvsq = new ethers.Contract(addresses.PVSQ_ADDRESS, MAIContract, provider);

                        let approveTx;
                        try {
                          approveTx = await pvsq
                            .connect(provider.getSigner())
                            .approve(addresses.PVSQ_REDEEM, '1111111111111111111111111111111111', {
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
                        const pvsqRedeem = new ethers.Contract(addresses.PVSQ_REDEEM, PVSQRedeem, provider);
                        try {
                          await pvsqRedeem
                            .connect(provider.getSigner())
                            .redeemAvailableVSQ({ gasPrice: '130000000000' });
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
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>pVSQ Wallet Balance</p>
                    <p>
                      {(isNaN(Number(state.walletPVSQBalance)) ? 0 : Number(state.walletPVSQBalance) ?? 0).toFixed(2)}{' '}
                      PVSQ
                    </p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Allocation</p>
                    <p>{(isNaN(Number(state.allotment)) ? 0 : Number(state.allotment) ?? 0).toFixed(2)} VSQ</p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Redeemed</p>
                    <p>
                      {(isNaN(Number(state.pVSQRedeemed)) ? 0 : Number(state.pVSQRedeemed) ?? 0).toLocaleString()} VSQ
                    </p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Available To Redeem</p>
                    <p>
                      {(isNaN(Number(state.pVSQAvailable)) ? 0 : Number(state.pVSQAvailable) ?? 0).toLocaleString()} VSQ
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
