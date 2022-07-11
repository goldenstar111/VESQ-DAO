import { Box, Link, Paper, Slide, TableCell, TableRow } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { BondKey, getBond } from 'src/constants';
import BondLogo from '../../components/BondLogo';
import { priceUnits, trim } from '../../helpers';
import { useWeb3Context } from '../../hooks';
import { IReduxState } from '../../store/slices/state.interface';
import './choose-bond.scss';

interface IBondProps {
  bondKey: BondKey;
}

export function BondDataCard({ bondKey }: IBondProps) {
  const { chainID } = useWeb3Context();
  const bond = getBond(bondKey, chainID);

  const isBondLoading = useSelector<IReduxState, boolean>(state => !state.bonding[bondKey]?.bondPrice ?? true);
  const bondPrice = useSelector<IReduxState, number | undefined>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondPrice;
  });

  console.log('choose bond price ', bondPrice);

  const bondDiscount = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondDiscount;
  });
  const bondPurchased = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].purchased;
  });

  return (
    <Slide direction="up" in={true} style={{ margin: '30px' }}>
      <Paper id={`${bond}--bond`} className="bond-data-card ohm-card">
        <div className="bond-pair">
          <BondLogo bond={bond} />
          <div className="bond-name">
            <p className="bond-name-title">{bond.name}</p>
            {bond.type === 'lp' && (
              <div>
                {!bond.deprecated ? (
                  <Link href={bond.lpUrl} target="_blank">
                    <Box component="p" color="#ABABAB" className="bond-lp-add-liquidity">
                      Add Liquidity
                    </Box>
                  </Link>
                ) : (
                  <Box component="p" color="#ABABAB" className="bond-lp-add-liquidity">
                    Disabled
                  </Box>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="data-row">
          <p className="bond-name-title">Price</p>
          <p className="bond-price bond-name-title">
            <>
              {priceUnits(bondKey)} {isBondLoading ? <Skeleton width="50px" /> : trim(bondPrice, 2)}
            </>
          </p>
        </div>

        <div className="data-row">
          <p className="bond-name-title">ROI</p>
          <p className="bond-price bond-name-title">
            {isBondLoading ? <Skeleton width="50px" /> : `${trim(bondDiscount * 100, 2)}%`}
          </p>
        </div>

        <div className="data-row">
          <p className="bond-name-title">Purchased</p>
          <p className="bond-price bond-name-title">
            {isBondLoading ? (
              <Skeleton width="80px" />
            ) : (
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(bondPurchased)
            )}
          </p>
        </div>
        <Link component={NavLink} to={`/bonds/${bondKey}`}>
          <Box
            bgcolor="otter.otterBlue"
            color="otter.white"
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="44px"
            className="bond-table-btn"
          >
            <p>
              {bond.deprecated ? 'Redeem' : 'Bond'} {bond.name}
            </p>
          </Box>
        </Link>
      </Paper>
    </Slide>
  );
}

export function BondTableData({ bondKey }: IBondProps) {
  const { chainID } = useWeb3Context();
  // Use BondPrice as indicator of loading.
  const isBondLoading = useSelector<IReduxState, boolean>(state => !state.bonding[bondKey]?.bondPrice ?? true);
  const bond = getBond(bondKey, chainID);

  const bondPrice = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondPrice;
  });
  const bondDiscount = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondDiscount;
  });
  const bondPurchased = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].purchased;
  });

  return (
    <TableRow id={`${bondKey}--bond`}>
      <TableCell align="left">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <p className="bond-name-title">{bond.name}</p>
          {!bond.deprecated ? (
            bond.type === 'lp' && (
              <Link color="primary" href={bond.lpUrl} target="_blank">
                <Box component="p" color="otter.otterBlue" className="bond-lp-add-liquidity">
                  <small style={{ color: '#31cb9e' }}>Add Liquidity</small>
                </Box>
              </Link>
            )
          ) : (
            <Box component="p" color="otter.otterBlue" className="bond-lp-add-liquidity">
              <small style={{ color: '#31cb9e' }}>Disabled</small>
            </Box>
          )}
        </div>
      </TableCell>
      <TableCell align="center">
        <p className="bond-name-title" style={{ color: '#27272E' }}>
          <>
            <span className="currency-icon">{priceUnits(bondKey)}</span>
            {isBondLoading ? <Skeleton width="50px" /> : bond.deprecated ? '-' : trim(bondPrice, 2)}
          </>
        </p>
      </TableCell>
      <TableCell align="right">
        <p className="bond-name-title" style={{ color: '#27272E' }}>
          {isBondLoading ? <Skeleton /> : bond.deprecated ? '-' : `${trim(bondDiscount * 100, 2)}%`}
        </p>
      </TableCell>
      <TableCell align="right">
        <p className="bond-name-title" style={{ color: '#27272E' }}>
          {isBondLoading ? (
            <Skeleton />
          ) : bond.deprecated ? (
            '-'
          ) : (
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
            }).format(bondPurchased)
          )}
        </p>
      </TableCell>
      <TableCell>
        <Link component={NavLink} to={`/bonds/${bondKey}`}>
          <Box
            // bgcolor="otter.otterBlue"
            color="otter.white"
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="44px"
            className="bond-table-btn"
          >
            <p style={{ color: '#31CB9E' }}>{bond.deprecated ? 'Redeem' : 'Bond'}</p>
          </Box>
        </Link>
      </TableCell>
    </TableRow>
  );
}
