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
import './iso.scss';
import { useWeb3Context } from '../../hooks';
import { fetchPendingTxns, clearPendingTxn } from '../../store/slices/pending-txns-slice';
import { IPendingTxn, isPendingTxn, txnButtonText } from '../../store/slices/pending-txns-slice';
import { Skeleton } from '@material-ui/lab';
import { IReduxState } from '../../store/slices/state.interface';

import { VSQPresale, MAIContract } from 'src/abi';
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
  walletFraxBalance?: string;
  walletFraxAllowance?: string;
  iVSQLeft?: string;
  allotment?: string;
  isWhitelisted?: boolean;
  blocknumber?: number;
  error?: Error;
}

export type Action =
  | {
      type: 'load-details-complete';
      walletFraxBalance: string;
      walletFraxAllowance: string;
      iVSQLeft: string;
      allotment: string;
      isWhitelisted: boolean;
      blocknumber: number;
      connected: boolean;
    }
  | {
      type: 'approve';
    }
  | {
      type: 'approved';
      walletFraxAllowance: string;
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
        walletFraxAllowance: action.walletFraxAllowance,
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
    setQuantity((Number(state.walletFraxBalance) / 26).toFixed(10).slice(0, -1));
  };

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    txPending: false,
    connected: false,
  });

  const frax = new ethers.Contract(addresses.FRAX_ADDRESS, MAIContract, provider);
  const presale = new ethers.Contract(addresses.IDO, VSQPresale, provider);

  const loadDetails = useCallback(async () => {
    // pointless comment
    const ivsq = new ethers.Contract(addresses.IVSQ_ADDRESS, MAIContract, provider);
    const frax = new ethers.Contract(addresses.FRAX_ADDRESS, MAIContract, provider);
    const presale = new ethers.Contract(addresses.IDO, VSQPresale, provider);

    const walletFraxBalance = ethers.utils.formatEther(await frax.balanceOf(address));
    const walletFraxAllowance = ethers.utils.formatEther(await frax.allowance(address, presale.address));

    const iVSQinPresaleContract = await ivsq.balanceOf(presale.address);
    const presaleBuyersRemaining = await presale.remainingBuyers();

    const iVSQLeft = ethers.utils.formatUnits(Math.floor(iVSQinPresaleContract), 9);

    const isWhitelisted = await presale.whitelist(address);

    const allotment = ethers.utils.formatUnits(
      Math.floor(presaleBuyersRemaining == 0 ? 0 : iVSQinPresaleContract / presaleBuyersRemaining),
      9,
    );

    const blocknumber = await provider.getBlockNumber();

    console.log('loading details for ISO');

    dispatch({
      type: 'load-details-complete',
      walletFraxBalance,
      walletFraxAllowance,
      iVSQLeft,
      allotment,
      blocknumber,
      isWhitelisted,
      connected: Boolean(connected),
    });
  }, [address, provider, connected]);

  useEffect(() => {
    //loadDetails();
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
              <div className="stake-top-metrics">
                <Grid container spacing={0}>
                  <Grid item xs={12} sm={4} md={4} lg={4} style={{ marginBottom: 40 }}>
                    <div className="stake-tvl" style={{ alignItems: 'center' }}>
                      <p className="single-stake-subtitle">Total Available</p>
                      <Box component="p" className="single-stake-subtitle-value">
                        50,000 VSQ
                      </Box>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={4} md={4} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className={styles.stakeApy} style={{ alignItems: 'center' }}>
                      <p className="single-stake-subtitle">Total Raise</p>
                      <Box component="p" className="single-stake-subtitle-value">
                        1,300,000
                      </Box>
                      <p style={{ fontSize: '20px', fontWeight: 200 }}>Frax</p>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="stake-index" style={{ alignItems: 'center' }}>
                      <p className="single-stake-subtitle">Price</p>
                      <Box component="p" className="single-stake-subtitle-value">
                        26 Frax
                      </Box>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item>
              <div className="card-header">
                <p className="single-stake-title" style={{ fontSize: '24px', fontWeight: 'lighter' }}>
                  ISO
                </p>
                <p style={{ fontWeight: 200, color: '#F2F2F2' }}>
                  {state.isWhitelisted ? 'Your account is whitelisted!' : 'No whitelisted account recognized!'}
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
                <Tab label="ISO" {...a11yProps(0)} className={styles.tabclass} />
              </Tabs>
              <Box className="stake-action-row">
                <FormControl className="ohm-input" variant="outlined" color="primary">
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
                </FormControl>
                <div className="iso-tab-buttons-group">
                  {Number(state.walletFraxAllowance) == 0 ? (
                    <Box
                      className="iso-tab-panel-btn"
                      bgcolor="otter.otterBlue"
                      onClick={async () => {
                        const frax = new ethers.Contract(addresses.FRAX_ADDRESS, MAIContract, provider);

                        let approveTx;
                        try {
                          approveTx = await frax
                            .connect(provider.getSigner())
                            .approve(addresses.IDO, '1111111111111111111111111111111111');

                          setApproving(true);

                          await approveTx.wait(1);
                          console.log('approve waited!!');
                          setApproveFlipper((flip: boolean) => !flip);
                        } catch (err) {
                          alert(err.message);
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
                        alert('This ISO is over! Please see ISO2!');
                        /*
                        const presaleAmountVSQ = Number(quantity);
                        console.log(' presaleAmountVSQ ', presaleAmountVSQ);
                        if (isNaN(presaleAmountVSQ)) {
                          alert('Please enter an amount of VSQ to buy!');
                          return;
                        }

                        const presale = new ethers.Contract(addresses.IDO, VSQPresale, provider);
                        try {
                          const fraxWei = BigNumber.from(Math.floor(presaleAmountVSQ * 1000000000 * 26))
                            .mul(BigNumber.from(10).pow(9).toString())
                            .toString();

                          console.log('fraxWei ', fraxWei);

                          await presale.connect(provider.getSigner()).buyVSQ(fraxWei);
                        } catch (err) {
                          if (err.data && err.data.message) alert('This ISO is over! Please see ISO2!');
                          else alert(err.message);
                          return;
                        }*/
                      }}
                    >
                      <p>Buy</p>
                    </Box>
                  )}
                </div>
              </Box>
            </Paper>

            <div className={`stake-user-data`}>
              <Grid container spacing={3}>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Available</p>
                    <p>{(isNaN(Number(state.allotment)) ? 25 : Number(state.allotment) ?? 0).toFixed(2)} VSQ</p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Price</p>
                    <p>26 Frax</p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass xbalanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Amount Left</p>
                    <p>
                      {/*(isNaN(Number(state.iVSQLeft)) ? 50000 : Number(state.iVSQLeft) ?? 0).toLocaleString()*/}0 VSQ
                    </p>
                  </div>
                </Grid>
                <Grid container item xs={12} sm={3} spacing={0} className={'balanceclass'}>
                  <div>
                    <p style={{ paddingBottom: '10px' }}>Total Raised</p>
                    <p>
                      {/*isNaN(Number(state.iVSQLeft)) ? '0' : ((50000 - Number(state.iVSQLeft)) * 26).toLocaleString()*/}
                      {/*' '*/}
                      {'863,338 Frax'}
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
