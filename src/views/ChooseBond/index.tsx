import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Zoom,
} from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Skeleton } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import { getTokenImage, trim } from '../../helpers';
import { useBonds } from '../../hooks';
import { IReduxState } from '../../store/slices/state.interface';
import { BondDataCard, BondTableData } from './BondRow';
import './choose-bond.scss';

function ChooseBond() {
  const bonds = useBonds();
  const isSmallScreen = useMediaQuery('(max-width: 733px)'); // change to breakpoint query
  const isVerySmallScreen = useMediaQuery('(max-width: 420px)');

  const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
  const marketPrice = useSelector<IReduxState, number>(state => {
    return state.app.marketPrice;
  });

  const treasuryBalance = useSelector<IReduxState, number>(state => {
    return state.app.treasuryBalance;
  });

  return (
    <div id="choose-bond-view">
      <Zoom in={true} style={{ backgroundColor: '#212121' }}>
        <Paper className="ohm-card">
          <Grid container item xs={12} spacing={2} style={{ margin: '10px 0px 20px' }} className="bond-hero">
            <Grid item xs={12} sm={4} className={`ohm-price`}>
              <Box textAlign={`${isVerySmallScreen ? 'center' : 'center'}`}>
                <p className="bond-hero-title">VSQ Price</p>
                <Box component="p" color="text.secondary" className="bond-hero-value">
                  {isAppLoading ? <Skeleton width="100px" /> : `$${trim(marketPrice, 2)}`}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="circle-treasury">
                <Box textAlign={`${isVerySmallScreen ? 'center' : 'center'}`}>
                  <p className="bond-hero-title">Treasury</p>
                  <Box component="p" color="text.secondary" className="bond-hero-value">
                    {isAppLoading ? (
                      <Skeleton width="180px" />
                    ) : (
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(treasuryBalance)
                    )}
                  </Box>
                </Box>
              </div>
            </Grid>
            <Grid item xs={12} sm={4} className={`ohm-price`}>
              <Box textAlign={`${isVerySmallScreen ? 'center' : 'center'}`}>
                <p className="bond-hero-title">Vesting Term</p>
                <Box component="p" color="text.secondary" className="bond-hero-value">
                  5 Days
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box className="card-header">
            <p className="bond-title">Bond (1,1)</p>
            <p className="bond-content">Purchase VSQ at a discount</p>
          </Box>
        </Paper>
      </Zoom>

      {isSmallScreen && (
        <Box className="ohm-card-container">
          <Grid container spacing={2}>
            {bonds.map(bond => (
              <Grid item xs={12} key={bond.value}>
                <BondDataCard key={bond.value} bondKey={bond.value} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {!isSmallScreen && (
        <div className="gentle-background">
          <Grid container item className="mainbox">
            <TableContainer>
              <Table aria-label="Available bonds">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <p className="bond-table-title">Asset</p>
                    </TableCell>
                    <TableCell align="center">
                      <p className="bond-table-title">Price</p>
                    </TableCell>
                    <TableCell align="center">
                      <p className="bond-table-title">ROI</p>
                    </TableCell>
                    <TableCell align="right">
                      <p className="bond-table-title">Total Supplied</p>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bonds.map(bond => (
                    <BondTableData key={bond.value} bondKey={bond.value} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </div>
      )}
    </div>
  );
}

export default ChooseBond;
