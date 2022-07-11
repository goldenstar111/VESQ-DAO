import { useSelector, useDispatch } from 'react-redux';
import { BigNumber, ethers } from 'ethers';
import {
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  makeStyles,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  TabsActions,
  Zoom,
} from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Skeleton } from '@material-ui/lab';
import { useCallback, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { IReduxState } from 'src/store/slices/state.interface';
import TabPanel from 'src/components/TabPanel';
import { trim } from 'src/helpers';
import { useWeb3Context } from 'src/hooks';
import { IPendingTxn, txnButtonText } from 'src/store/slices/pending-txns-slice';
// import { approveWrapping, changeWrap } from 'src/store/slices/wrap-thunk';
import './wrap.scss';
import WrapDialog from './WrapDialog';

import { getAddresses } from '../../constants';

import { MaiReserveContract, WSVSQContract } from '../../abi';

import styled from 'styled-components';

const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`;

const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiOutlinedInput-root': {
      borderColor: 'transparent',
      backgroundColor: theme.palette.background.default,
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
  walletSVSQAllowance?: string;
  wsVSQBalance?: string;
  blocknumber?: number;
  error?: Error;
}

export type Action =
  | {
      type: 'load-details-complete';
      walletSVSQAllowance: string;
      wsVSQBalance: string;
      blocknumber: number;
      connected: boolean;
    }
  | {
      type: 'approve';
    }
  | {
      type: 'approved';
      walletSVSQAllowance: string;
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
        walletSVSQAllowance: action.walletSVSQAllowance,
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

const Wrap = () => {
  const { provider, address, connect, connected, chainID } = useWeb3Context();

  const [refresh, setRefresh] = useState<boolean>(false);

  const addresses = getAddresses(chainID);

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    txPending: false,
    connected: false,
  });

  const wsVSQAddress = '0x05B33f816d2C0C2D20F0777a75ad549df05bF24D';

  const sVSQ = new ethers.Contract(addresses.sVSQ_ADDRESS, MaiReserveContract, provider);
  const wsVSQ = new ethers.Contract(wsVSQAddress, WSVSQContract, provider);

  const loadDetails = useCallback(async () => {
    const sVSQ = new ethers.Contract(addresses.sVSQ_ADDRESS, MaiReserveContract, provider);
    const walletSVSQAllowance = ethers.utils.formatUnits(await sVSQ.allowance(address, wsVSQAddress), 9);

    const wsVSQ = new ethers.Contract(wsVSQAddress, WSVSQContract, provider);
    const wsVSQBalance = ethers.utils.formatUnits(await wsVSQ.balanceOf(address), 18);

    const blocknumber = await provider.getBlockNumber();

    console.log('loading details for WSVSQ Page');

    dispatch({
      type: 'load-details-complete',
      walletSVSQAllowance,
      wsVSQBalance,
      blocknumber,
      connected: Boolean(connected),
    });
  }, [address, provider, connected]);

  useEffect(() => {
    loadDetails();
  }, [connected, refresh]);

  useEffect(() => {
    setInterval(() => {
      setRefresh((flip: boolean) => !flip);
    }, 30 * 1000);
  }, []);

  const styles = useStyles();

  const tabsActions = useRef<TabsActions>(null);

  const isSmallScreen = useMediaQuery('(max-width: 600px)');

  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState<string>('');

  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<string>('');

  const [indexAdjustedsVSQ, setIndexAdjustedsVSQ] = useState(0);
  const [predictedWSVSQ, setPredictedWSVSQ] = useState(0);
  const [predictedsVSQ, setPredictedsVSQ] = useState(0);

  const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
  const currentIndex = useSelector<IReduxState, string>(state => state.app.currentIndex);

  const sVSQBalance = useSelector<IReduxState, string>(state => {
    return state.account.balances && state.account.balances.sVSQ;
  });

  const wrapAllowance = 0;
  // const wrapAllowance = useSelector<IReduxState, number>(state => state.account.wrapping?.sVSQWrap);
  const [pendingTransactions, setPendingTransactions] = useState(false);

  const isWrapTab = () => view === 0;

  const setMax = () => {
    if (isWrapTab()) {
      setQuantity(sVSQBalance);
    } else {
      setQuantity(state.wsVSQBalance ?? '0');
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setQuantity('');
  };

  const onApproval = async () => {
    try {
      const approveTx = await sVSQ
        .connect(provider.getSigner())
        .approve(wsVSQAddress, '1111111111111111111111111111111111');
      setPendingTransactions(true);
      await approveTx.wait(2);
      setPendingTransactions(false);
    } catch (error) {
      setPendingTransactions(false);
      alert((error as any).message);
      return;
    }
  };

  const onChangeWrap = async (action: string) => {
    if (isNaN(Number(quantity)) || Number(quantity) === 0 || quantity === '0') {
      alert('Please enter a value!');
    } else {
      setAction(action);

      if (action === 'wrap') {
        const vsqWei = BigNumber.from(Math.floor(Number(quantity) * 1000000000)).toString();
        console.log('vsqWei ', vsqWei);

        try {
          const approveTx = await wsVSQ.connect(provider.getSigner()).wrap(vsqWei);
          setPendingTransactions(true);
          await approveTx.wait(2);
          setPendingTransactions(false);
          handleOpenDialog();
        } catch (error) {
          setPendingTransactions(false);
          if ((error as any).data && (error as any).data.message) alert((error as any).data.message);
          else alert((error as any).message);
          return;
        }
      } else {
        const vsqWei = BigNumber.from(Math.floor(Number(quantity) * 1000000000))
          .mul(Math.pow(10, 9))
          .toString();
        console.log('wsVSQWei ', vsqWei);

        try {
          const approveTx = await wsVSQ.connect(provider.getSigner()).unwrap(vsqWei);
          setPendingTransactions(true);
          await approveTx.wait(2);
          setPendingTransactions(false);
          handleOpenDialog();
        } catch (error) {
          setPendingTransactions(false);
          if ((error as any).data && (error as any).data.message) alert((error as any).data.message);
          else alert((error as any).message);
          return;
        }
      }
    }
  };

  const hasAllowance = useCallback(
    token => {
      if (token === 'sVSQ') return wrapAllowance > 0;
      return 0;
    },
    [wrapAllowance],
  );

  const changeView = (event: any, newView: number) => {
    setView(newView);
  };

  useEffect(() => {
    if (tabsActions.current) {
      setTimeout(() => tabsActions?.current?.updateIndicator(), 300);
    }
  }, [tabsActions]);

  useEffect(() => {
    if (isWrapTab()) {
      setPredictedWSVSQ(Number(quantity) / Number(currentIndex));
    } else {
      setPredictedsVSQ(Number(quantity) * Number(currentIndex));
    }
  }, [quantity, view]);

  useEffect(() => {
    setIndexAdjustedsVSQ(() => Number(state.wsVSQBalance) * Number(currentIndex));
  }, [state.wsVSQBalance, currentIndex]);

  return (
    <div id="wrap-view" className={styles.root}>
      <Zoom in={true}>
        <Paper className="ohm-card">
          <Grid container direction="column">
            <Grid
              container
              wrap="nowrap"
              direction={`${isSmallScreen ? 'column' : 'row'}`}
              alignItems={`${isSmallScreen ? 'center' : 'flex-start'}`}
            >
              <Grid item>
                <div className="card-header">
                  <p className="wrap-title">Wrap sVSQ</p>
                  <p className="wrap-description">
                    wsVSQ is an index-adjusted wrapper for sVSQ. Some people may find this useful for cross-blockchain
                    purposes. Unlike your sVSQ balance, your wsVSQ balance will not increase over time. When wsVSQ is
                    unwrapped, you receive sVSQ based on the latest (ever-increasing) index, so the total yield is the
                    same.
                  </p>
                </div>
              </Grid>
            </Grid>

            <div className="wrap-area">
              {!address ? (
                <div className="wrap-wallet-notification">
                  <div id="wallet-menu" className="p-5 mb-2.5">
                    <Box bgcolor="otter.otterBlue" className="app-otter-button" onClick={() => connect()}>
                      <p>Connect Wallet</p>
                    </Box>
                  </div>
                  <p className="desc-text">Connect your wallet to wrap your sVSQ!</p>
                </div>
              ) : (
                <>
                  <Box className="wrap-action-area">
                    <Tabs
                      action={tabsActions}
                      centered
                      value={view}
                      indicatorColor="primary"
                      className="wrap-tab-buttons"
                      onChange={changeView}
                      aria-label="wrap tabs"
                      variant="fullWidth"
                    >
                      <Tab className="!mx-2.5" label="Wrap" {...a11yProps(0)} />
                      <Tab className="!mx-2.5" label="Unwrap" {...a11yProps(0)} />
                    </Tabs>

                    <Box className="wrap-action-row" display="flex" alignItems="center">
                      <FormControl className="ohm-input" variant="outlined" color="primary">
                        <InputLabel htmlFor="amount-input"></InputLabel>
                        <OutlinedInput
                          id="amount-input"
                          type="number"
                          placeholder="Amount"
                          className="wrap-input"
                          value={quantity}
                          onChange={e => setQuantity(e.target.value)}
                          labelWidth={0}
                          endAdornment={
                            <InputAdornment position="end">
                              <div onClick={setMax} className="wrap-input-btn">
                                <p>Max</p>
                              </div>
                            </InputAdornment>
                          }
                        />
                      </FormControl>

                      <TabPanel value={view} index={0} className="wrap-tab-panel">
                        {address && Number(state.walletSVSQAllowance) != 0 ? (
                          <Box
                            bgcolor="otter.otterBlue"
                            className="app-otter-button"
                            onClick={() => !pendingTransactions && onChangeWrap('wrap')}
                          >
                            <p>{!pendingTransactions ? 'Wrap' : <Dots>Wrapping</Dots>}</p>
                          </Box>
                        ) : (
                          <Box
                            bgcolor="otter.otterBlue"
                            className="app-otter-button"
                            onClick={() => !pendingTransactions && onApproval()}
                          >
                            <p>{!pendingTransactions ? 'Approve' : <Dots>Approving</Dots>}</p>
                          </Box>
                        )}
                      </TabPanel>

                      <TabPanel value={view} index={1} className="wrap-tab-panel">
                        <Box
                          bgcolor="otter.otterBlue"
                          className="app-otter-button"
                          onClick={() => !pendingTransactions && onChangeWrap('unwrap')}
                        >
                          <p>{!pendingTransactions ? 'Unwrap' : <Dots>Unwrapping</Dots>}</p>
                        </Box>
                      </TabPanel>
                    </Box>
                    <WrapDialog
                      open={open}
                      handleClose={handleCloseDialog}
                      received={`${isWrapTab() ? trim(Number(predictedWSVSQ), 4) : trim(Number(predictedsVSQ), 4)}`}
                      stakeBalance={trim(Number(sVSQBalance), 4)}
                      WSVSQBalance={trim(Number(state.wsVSQBalance), 4)}
                      action={action}
                    />
                    <div className="help-text">
                      {address && Number(state.walletSVSQAllowance) == 0 && isWrapTab() && (
                        <p className="text-desc">
                          Note: The "Approve" transaction is only needed when wrapping for the first time; subsequent
                          minting only requires you to perform the "Wrap" transaction.
                        </p>
                      )}
                    </div>
                  </Box>

                  <div className={`wrap-user-data`}>
                    <div className="data-row">
                      <p className="data-row-name">Your Balance (Staked)</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(sVSQBalance), 4)} Staked VSQ</>}
                      </p>
                    </div>
                    <div className="data-row">
                      <p className="data-row-name">Your Balance (Wrapped)</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(state.wsVSQBalance), 4)} wsVSQ</>}
                      </p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">Current Index</p>
                      <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{currentIndex}</>}</p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">Index-adjusted Balance</p>
                      <p className="data-row-value">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(indexAdjustedsVSQ), 4)} sVSQ</>}
                      </p>
                    </div>

                    <div className="data-row">
                      <p className="data-row-name">You Will Get</p>
                      <p className="data-row-value">
                        {isAppLoading ? (
                          <Skeleton width="80px" />
                        ) : (
                          <>
                            {isWrapTab()
                              ? `${trim(Number(predictedWSVSQ), 4)} wsVSQ`
                              : `${trim(Number(predictedsVSQ), 4)} sVSQ`}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
    </div>
  );
};

export default Wrap;
