import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, InputLabel, OutlinedInput, InputAdornment, Slide, FormControl, makeStyles } from '@material-ui/core';
import { shorten, trim, prettifySeconds } from '../../helpers';
import { changeApproval, bondAsset, calcBondDetails } from '../../store/slices/bond-slice';
import { useWeb3Context } from '../../hooks';
import { IPendingTxn, isPendingTxn, txnButtonText } from '../../store/slices/pending-txns-slice';
import { Skeleton } from '@material-ui/lab';
import { IReduxState } from '../../store/slices/state.interface';
import { BondKey, getBond } from 'src/constants';

const useStyles = makeStyles(theme => ({
  input: {
    '& .MuiOutlinedInput-root': {
      borderColor: 'transparent',
      backgroundColor: theme.palette.background.paper,
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

interface IBondPurchaseProps {
  bondKey: BondKey;
  slippage: number;
}

function BondPurchase({ bondKey, slippage }: IBondPurchaseProps) {
  const styles = useStyles();
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();
  const bond = getBond(bondKey, chainID);
  const [recipientAddress, setRecipientAddress] = useState(address);
  const [quantity, setQuantity] = useState('');

  const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);
  const vestingTerm = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].vestingTerm;
  });

  const bondDiscount = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondDiscount;
  });
  const maxBondPrice = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].maxBondPrice;
  });
  const interestDue = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].interestDue;
  });
  const pendingPayout = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].pendingPayout;
  });
  const debtRatio = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].debtRatio;
  });
  const bondQuote = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondQuote;
  });
  const balance = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].balance;
  });
  const allowance = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].allowance;
  });

  const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
    return state.pendingTransactions;
  });

  const vestingPeriod = () => {
    return prettifySeconds(vestingTerm, 'day');
  };

  async function onBond() {
    if (quantity === '') {
      alert('Please enter a value!');
      //@ts-ignore
    } else if (isNaN(quantity)) {
      alert('Please enter a valid value!');
    } else if (interestDue > 0 || pendingPayout > 0) {
      const shouldProceed = window.confirm(
        'You have an existing bond. Bonding will reset your vesting period and forfeit rewards. We recommend claiming rewards first or using a fresh wallet. Do you still want to proceed?',
      );
      if (shouldProceed) {
        await dispatch(
          bondAsset({
            value: quantity,
            slippage,
            bondKey,
            networkID: chainID,
            provider,
            address: recipientAddress || address,
          }),
        );
      }
    } else {
      await dispatch(
        //@ts-ignore
        bondAsset({
          value: quantity,
          slippage,
          bondKey,
          networkID: chainID,
          provider,
          address: recipientAddress || address,
        }),
      );
    }
  }

  const hasAllowance = useCallback(() => {
    return allowance > 0;
  }, [allowance]);

  const setMax = () => {
    console.log('set bond balance to max: ', balance);
    setQuantity((balance || '').toString());
  };

  const balanceUnits = () => {
    if (bond.type === 'lp') return 'LP';
    else return bond.name;
  };

  async function loadBondDetails() {
    if (provider) await dispatch(calcBondDetails({ bondKey, value: quantity, provider, networkID: chainID }));
  }

  useEffect(() => {
    loadBondDetails();
    if (address) setRecipientAddress(address);
  }, [provider, quantity, address]);

  const onSeekApproval = async () => {
    await dispatch(changeApproval({ bondKey, provider, networkID: chainID, address }));
  };

  return (
    <Box display="flex" flexDirection="column">
      <div className={`${styles.input} input-container`}>
        <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
          <InputLabel htmlFor="outlined-adornment-amount"></InputLabel>
          <OutlinedInput
            placeholder="Amount"
            id="outlined-adornment-amount"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            labelWidth={0}
            className="bond-input"
            endAdornment={
              <InputAdornment position="end">
                <div className="stake-input-btn" onClick={setMax}>
                  <p>Max</p>
                </div>
              </InputAdornment>
            }
          />
        </FormControl>
        {hasAllowance() ? (
          <Box
            className="transaction-button app-otter-button"
            bgcolor="otter.otterBlue"
            color="otter.white"
            onClick={async () => {
              if (isPendingTxn(pendingTransactions, 'bond_' + bond)) return;
              await onBond();
            }}
          >
            <p>{txnButtonText(pendingTransactions, 'bond_' + bond, 'Bond')}</p>
          </Box>
        ) : (
          <Box
            className="transaction-button app-otter-button"
            bgcolor="otter.otterBlue"
            color="otter.white"
            onClick={async () => {
              if (isPendingTxn(pendingTransactions, 'approve_' + bond)) return;
              await onSeekApproval();
            }}
          >
            <p>{txnButtonText(pendingTransactions, 'approve_' + bond, 'Approve')}</p>
          </Box>
        )}
      </div>
      {!hasAllowance() && (
        <div className="help-text">
          {/* <p className="help-text-desc">
            Note: The "Approve" transaction is only needed when bonding for the first time; subsequent bonding only
            requires you to perform the "Bond" transaction.
          </p> */}
        </div>
      )}

      <Slide direction="left" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
        <Box className="bond-data">
          <div className="data-row">
            <p className="bond-balance-title">Your Balance</p>
            <p className="bond-balance-value">
              {isBondLoading ? (
                <Skeleton width="100px" />
              ) : (
                <>
                  {trim(balance, 4)} {balanceUnits()}
                </>
              )}
            </p>
          </div>

          <div className={`data-row`}>
            <p className="bond-balance-title">You Will Get</p>
            <p className="price-data bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bondQuote, 4) || '0'} VSQ`}
            </p>
          </div>

          <div className={`data-row`}>
            <p className="bond-balance-title">Max You Can Buy</p>
            <p className="price-data bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(maxBondPrice, 4) || '0'} VSQ`}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">ROI</p>
            <p className="bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bondDiscount * 100, 2)}%`}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">Debt Ratio</p>
            <p className="bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(debtRatio / 10000000, 2)}%`}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">Vesting Term</p>
            <p className="bond-balance-value">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
          </div>

          {recipientAddress !== address && (
            <div className="data-row">
              <p className="bond-balance-title">Recipient</p>
              <p className="bond-balance-value">
                {isBondLoading ? <Skeleton width="100px" /> : shorten(recipientAddress)}
              </p>
            </div>
          )}
        </Box>
      </Slide>
    </Box>
  );
}

export default BondPurchase;
