import { useState, useCallback, useEffect, useRef } from 'react';
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
import clsx from 'clsx';
import RebaseTimer from '../../components/RebaseTimer/RebaseTimer';
import TabPanel from '../../components/TabPanel';
import { trim } from '../../helpers';
import { changeStake, changeApproval, claimWarmup } from '../../store/slices/stake-thunk';
import './stake.scss';
import { useWeb3Context } from '../../hooks';
import { IPendingTxn, isPendingTxn, txnButtonText } from '../../store/slices/pending-txns-slice';
import { Skeleton } from '@material-ui/lab';
import { IReduxState } from '../../store/slices/state.interface';

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
  balanceclass: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 200,
    color: '#27272E',
  },
  fixedBackground: {
    position: 'absolute',
    top: 362,
    left: -1000,
    right: 0,
    width: window.outerWidth + 600,
    height: 1000,
    backgroundColor: '#F2F2F2',
    zIndex: -100,
  },
}));

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function Stake() {
  const styles = useStyles();
  const dispatch = useDispatch();
  const { provider, address, connect, chainID } = useWeb3Context();
  const tabsActions = useRef<TabsActions>(null);

  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState<string>();

  const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
  const currentIndex = useSelector<IReduxState, string>(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useSelector<IReduxState, number>(state => {
    return state.app.fiveDayRate;
  });
  const vsqBalance = useSelector<IReduxState, string>(state => {
    return state.account.balances && state.account.balances.vsq;
  });
  const sVSQBalance = useSelector<IReduxState, string>(state => {
    return state.account.balances && state.account.balances.sVSQ;
  });
  const stakeAllowance = useSelector<IReduxState, number>(state => {
    return state.account.staking && state.account.staking.vsqStake;
  });
  const unstakeAllowance = useSelector<IReduxState, number>(state => {
    return state.account.staking && state.account.staking.sVSQUnstake;
  });
  const warmupBalance = useSelector<IReduxState, string>(state => {
    return state.account.staking && state.account.staking.warmup;
  });
  const canClaimWarmup = useSelector<IReduxState, boolean>(state => {
    return state.account.staking && state.account.staking.canClaimWarmup;
  });
  const stakingRebase = useSelector<IReduxState, number>(state => {
    return state.app.stakingRebase;
  });
  const stakingAPY = useSelector<IReduxState, number>(state => {
    return state.app.stakingAPY;
  });
  const stakingTVL = useSelector<IReduxState, number>(state => {
    return state.app.stakingTVL;
  });
  const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(vsqBalance);
    } else {
      setQuantity(sVSQBalance);
    }
  };

  const onSeekApproval = async (token: string) => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeStake = async (action: string) => {
    // eslint-disable-next-line no-restricted-globals
    //@ts-ignore
    if (isNaN(quantity) || quantity === 0 || quantity === '') {
      // eslint-disable-next-line no-alert
      alert('Please enter a value!');
    } else {
      await dispatch(changeStake({ address, action, value: String(quantity), provider, networkID: chainID }));
    }
  };

  const onClaimWarmup = async () => {
    await dispatch(claimWarmup({ address, provider, networkID: chainID }));
  };

  const hasAllowance = useCallback(
    token => {
      if (token === 'VSQ') return stakeAllowance > 0;
      if (token === 'sVSQ') return unstakeAllowance > 0;
      return 0;
    },
    [stakeAllowance],
  );

  const changeView = (event: any, newView: number) => {
    setView(newView);
  };

  const trimmedSVSQBalance = trim(Number(sVSQBalance), 4);
  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const nextRewardValue = trim(
    (Number(stakingRebasePercentage) / 100) * (Number(trimmedSVSQBalance) + Number(warmupBalance)),
    4,
  );

  useEffect(() => {
    if (tabsActions.current) {
      setTimeout(() => tabsActions?.current?.updateIndicator(), 300);
    }
  }, [tabsActions]);

  return (
    <div id="stake-view" className={styles.root}>
      <Zoom in={true} style={{ backgroundColor: '#212121' }}>
        <Paper className="ohm-card">
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <div className="stake-top-metrics">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="stake-tvl !items-center">
                      <p className="single-stake-subtitle">Total Value Deposited</p>
                      <Box component="p" className="single-stake-subtitle-value">
                        {stakingTVL ? (
                          new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                            minimumFractionDigits: 0,
                          }).format(stakingTVL)
                        ) : (
                          <Skeleton width="150px" />
                        )}
                      </Box>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={4} md={4} lg={4} className="flex justify-center">
                    <div className={clsx(styles.stakeApy, 'items-center')}>
                      <p className="single-stake-subtitle">APY</p>
                      <Box component="p" className="single-stake-subtitle-value">
                        {stakingAPY ? (
                          new Intl.NumberFormat('en-US', {
                            style: 'percent',
                          }).format(stakingAPY)
                        ) : (
                          <Skeleton width="150px" />
                        )}
                      </Box>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="stake-index !items-center">
                      <p className="single-stake-subtitle">Current Index</p>
                      <Box component="p" className="single-stake-subtitle-value">
                        {currentIndex ? <>{trim(Number(currentIndex), 3)} VSQ</> : <Skeleton width="150px" />}
                      </Box>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item>
              <div className="card-header">
                <p className="single-stake-title text-2xl font-light">Stake VSQ (3,3)</p>
                <RebaseTimer />
              </div>
            </Grid>

            {/* Just Background */}
          </Grid>
        </Paper>
      </Zoom>
      <div className="gentle-background">
        <div className="staking-area">
          {/* {!address ? (
            <div className="stake-wallet-notification">
              <div className="wallet-menu" id="wallet-menu">
                <Box bgcolor="otter.otterBlue" className="app-otter-button" onClick={connect}>
                  <p>Connect Wallet</p>
                </Box>
              </div>
              <p className="desc-text">Connect your wallet to stake VSQ tokens!</p>
            </div>
          ) : ( */}
          <>
            <Paper square className="stake-action-area">
              <Tabs
                action={tabsActions}
                centered
                value={view}
                indicatorColor="primary"
                className="stake-tab-buttons"
                onChange={changeView}
                aria-label="stake tabs"
                variant="fullWidth"
              >
                <Tab label="Stake" {...a11yProps(0)} className={styles.tabclass} />
                <Tab label="Unstake" {...a11yProps(0)} />
              </Tabs>

              <Box className="stake-action-row">
                <FormControl className="ohm-input" variant="outlined" color="primary">
                  <InputLabel htmlFor="amount-input"></InputLabel>
                  <OutlinedInput
                    id="amount-input"
                    type="number"
                    placeholder="Enter an amount"
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

                <TabPanel value={view} index={0} className="stake-tab-panel">
                  <div className="stake-tab-buttons-group">
                    {address && hasAllowance('VSQ') ? (
                      <Box
                        className="stake-tab-panel-btn"
                        bgcolor="otter.otterBlue"
                        onClick={() => {
                          if (isPendingTxn(pendingTransactions, 'staking')) return;
                          onChangeStake('stake');
                        }}
                      >
                        <p>{txnButtonText(pendingTransactions, 'staking', 'Stake')}</p>
                      </Box>
                    ) : (
                      <Box
                        className="stake-tab-panel-btn"
                        bgcolor="otter.otterBlue"
                        onClick={() => {
                          if (isPendingTxn(pendingTransactions, 'approve_staking')) return;
                          onSeekApproval('VSQ');
                        }}
                      >
                        <p>{txnButtonText(pendingTransactions, 'approve_staking', 'Approve')}</p>
                      </Box>
                    )}
                    {canClaimWarmup && (
                      <Box
                        className="stake-tab-panel-btn"
                        bgcolor="otter.otterBlue"
                        onClick={() => {
                          if (isPendingTxn(pendingTransactions, 'claimWarmup')) return;
                          onClaimWarmup();
                        }}
                      >
                        <p>{txnButtonText(pendingTransactions, 'claimWarmup', 'Claim Warmup')}</p>
                      </Box>
                    )}
                  </div>
                </TabPanel>

                <TabPanel value={view} index={1} className="stake-tab-panel">
                  {address && hasAllowance('sVSQ') ? (
                    <Box
                      className="stake-tab-panel-btn"
                      bgcolor="otter.otterBlue"
                      onClick={() => {
                        if (isPendingTxn(pendingTransactions, 'unstaking')) return;
                        onChangeStake('unstake');
                      }}
                    >
                      <p>{txnButtonText(pendingTransactions, 'unstaking', 'Unstake VSQ')}</p>
                    </Box>
                  ) : (
                    <Box
                      className="stake-tab-panel-btn"
                      bgcolor="otter.otterBlue"
                      onClick={() => {
                        if (isPendingTxn(pendingTransactions, 'approve_unstaking')) return;
                        onSeekApproval('sVSQ');
                      }}
                    >
                      <p>{txnButtonText(pendingTransactions, 'approve_unstaking', 'Approve')}</p>
                    </Box>
                  )}
                </TabPanel>
              </Box>
            </Paper>

            <div className={`stake-user-data`}>
              {Number(warmupBalance) > 0 && (
                <div className="data-row">
                  <p className="data-row-name-warmup">Your Staked Balance in warmup</p>
                  <p className="data-row-value">
                    {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(warmupBalance), 4)} VSQ</>}
                  </p>
                </div>
              )}
              <Grid container spacing={0} className="gap-y-4">
                <Grid
                  container
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  spacing={0}
                  className={clsx(
                    styles.balanceclass,
                    'sm:border-r border-b sm:border-b-0 border-solid border-black-800 pb-2.5 sm:pb-0',
                  )}
                >
                  <div>
                    <p className="pb-2.5">Balance</p>
                    <p>
                      {isAppLoading ? (
                        <Skeleton width="80px" />
                      ) : (
                        <>{isNaN(Number(vsqBalance)) ? 0 : trim(Number(vsqBalance), 4)} VSQ</>
                      )}
                    </p>
                  </div>
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  spacing={0}
                  className={clsx(
                    styles.balanceclass,
                    'md:border-r border-b sm:border-b-0 border-solid border-black-800 pb-2.5 sm:pb-0',
                  )}
                >
                  <div>
                    <p className="pb-2.5">Staked Balance</p>
                    <p>
                      {isAppLoading ? (
                        <Skeleton width="80px" />
                      ) : (
                        <>
                          {new Intl.NumberFormat('en-US').format(
                            isNaN(Number(trimmedSVSQBalance)) ? 0 : Number(trimmedSVSQBalance),
                          )}{' '}
                          VSQ
                        </>
                      )}
                    </p>
                  </div>
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  className={clsx(
                    styles.balanceclass,
                    'sm:border-r border-b sm:border-b-0 border-solid border-black-800 pb-2.5 sm:pb-0',
                  )}
                >
                  <div>
                    <p className="pb-2.5">Next Reward</p>
                    <p>
                      {isAppLoading ? (
                        <Skeleton width="80px" />
                      ) : (
                        <>{isNaN(Number(nextRewardValue)) ? 0 : nextRewardValue} VSQ</>
                      )}
                    </p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={6} md={3} className={styles.balanceclass}>
                  <div>
                    <p className="pb-2.5">Next Yield</p>
                    <p>{isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}</p>
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

export default Stake;
