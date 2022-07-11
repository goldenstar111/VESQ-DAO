import { useEffect, useState } from 'react';
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import Chart from '../../components/Chart/Chart.jsx';
import { trim, formatCurrency } from '../../helpers';
import {
  treasuryDataQuery,
  rebasesDataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from './treasuryData.js';
import { useTheme } from '@material-ui/core/styles';
import './treasury-dashboard.scss';
import apollo from '../../lib/apolloClient';
import InfoTooltip from 'src/components/InfoTooltip/InfoTooltip.jsx';
import OtterKing from './otterking.png';
import { IReduxState } from 'src/store/slices/state.interface';

const percentFormatter = Intl.NumberFormat('en', { style: 'percent', minimumFractionDigits: 2 });

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState(null);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery('(max-width: 650px)');
  const verySmallScreen = useMediaQuery('(max-width: 379px)');

  const marketPrice = useSelector<IReduxState, number>(state => state.app.marketPrice);
  const circSupply = useSelector<IReduxState, number>(state => state.app.circSupply);
  const totalSupply = useSelector<IReduxState, number>(state => state.app.totalSupply);
  const marketCap = useSelector<IReduxState, number>(state => state.app.marketCap);
  const currentIndex = useSelector<IReduxState, string>(state => state.app.currentIndex);
  const backingPerVSQ = useSelector<IReduxState, number>(state => state.app.backingPerVSQ);
  const stakingAPY = useSelector<IReduxState, number>(state => state.app.stakingAPY);
  const stakingTVL = useSelector<IReduxState, number>(state => state.app.stakingTVL);
  const treasuryRunway = useSelector<IReduxState, number>(state => state.app.treasuryRunway);
  const stakingRatio = useSelector<IReduxState, number>(state => state.app.stakingRatio);
  const treasuryBalance = useSelector<IReduxState, number>(state => state.app.treasuryBalance);

  const displayData = [
    {
      title: 'Market Cap',
      value: marketCap ? formatCurrency(marketCap, 0) : null,
    },
    {
      title: 'VSQ Price',
      value: marketPrice ? formatCurrency(marketPrice, 2) : null,
    },
    {
      title: 'Treasury Balance',
      value: treasuryBalance ? formatCurrency(treasuryBalance, 0) : null,
    },
    {
      title: 'Staking TVL',
      value: stakingTVL ? formatCurrency(stakingTVL, 0) : null,
      info: tooltipInfoMessages.tvl,
    },
    {
      title: 'Staking APY',
      value: stakingAPY ? percentFormatter.format(stakingAPY) : null,
      info: tooltipInfoMessages.apy,
    },
    {
      title: 'Staking Ratio',
      value: stakingRatio ? percentFormatter.format(stakingRatio) : null,
      info: tooltipInfoMessages.staked,
    },
    {
      title: 'Backing per VSQ',
      value: backingPerVSQ ? formatCurrency(backingPerVSQ, 2) : null,
    },
    {
      title: 'Runway',
      value: treasuryRunway
        ? Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(treasuryRunway) + ' Days'
        : null,
      info: tooltipInfoMessages.runway,
    },
    {
      title: 'Current Index',
      value: currentIndex ? trim(currentIndex, 2) + ' sVSQ' : null,
      // value: currentIndex ? trim(currentIndex, 2) + ' VSQ' : null,
      info: tooltipInfoMessages.currentIndex,
    },
  ];

  useEffect(() => {
    // apollo(treasuryDataQuery).then(r => {
    //   let metrics = r.data.protocolMetrics.map(entry =>
    //     Object.entries(entry).reduce((obj, [key, value]) => ((obj[key] = parseFloat(value)), obj), {}),
    //   );
    //   metrics = metrics.filter(pm => pm.treasuryMarketValue > 0);
    //   setData(metrics);
    //   let staked = r.data.protocolMetrics.map(entry => ({
    //     staked: (parseFloat(entry.sVSQCirculatingSupply) / parseFloat(entry.ohmCirculatingSupply)) * 100,
    //     timestamp: entry.timestamp,
    //   }));
    //   staked = staked.filter(pm => pm.staked < 100);
    //   setStaked(staked);
    //   let runway = metrics.filter(pm => pm.runway10k > 5);
    //   setRunway(runway);
    // });
    // apollo(rebasesDataQuery).then(r => {
    //   let apy = r.data.rebases.map(entry => ({
    //     apy: Math.pow(parseFloat(entry.percentage) + 1, 365 * 3) * 100,
    //     timestamp: entry.timestamp,
    //   }));
    //   apy = apy.filter(pm => pm.apy < 300000);
    //   setApy(apy);
    // });
    // let targetElement = document.getElementById('treasury-dashboard-view');
    // let targetHeader = document.getElementById('specificHeader');
    // let gap_widget = document.getElementById('gap-widget');
    // let exact_height, header_height, window_height, requireHeight;
    // if (targetElement && targetHeader) {
    //   exact_height = targetElement.scrollHeight;
    //   header_height = targetHeader.scrollHeight;
    //   window_height = window.innerHeight;
    //   requireHeight = window_height - header_height - exact_height;
    // }
  }, []);
  // const identify = () => {
  //   let targetElement = document.getElementById('treasury-dashboard-view');
  //   let exact_height, window_height;
  //   if (targetElement) {
  //     exact_height = targetElement.scrollHeight;
  //     window_height = window.outerHeight;
  //     console.log('ddd');
  //   }

  //   // exact_height = document.getElementsByClassName('hdfd')[0].scrollHeight;
  //   return -1;
  // };

  return (
    <>
      {/* <div id="treasury-dashboard-view" className={`${smallerScreen && 'smaller'} ${verySmallScreen && 'very-small'}`}>
        <div className="hero">
          <Box component="div" color="text.primary">
            <p>World becomes VSQ</p>
            <h1>Welcome to VSQ Kingdom</h1>
            <h3>The Decentralized Reserve Memecoin</h3>
          </Box>
          <img src={OtterKing} />
        </div>
        <div className="wave" />
        <Container
          style={{
            paddingLeft: smallerScreen || verySmallScreen ? '0' : '3.3rem',
            paddingRight: smallerScreen || verySmallScreen ? '0' : '3.3rem',
          }}
        >
          <Box className={`hero-metrics`}>
            <Paper className="ohm-card">
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
                {displayData.map(({ title, value, info }, i) => (
                  <Box key={i} bgcolor="mode.white" className="metric">
                    <Typography variant="h6" color="secondary">
                      {title}
                      {info && <InfoTooltip message={info} />}
                    </Typography>
                    <Typography variant="h4" color="textPrimary">
                      {value ? value : <Skeleton width="100px" />}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box> */}
      <div id="treasury-dashboard-view" className={`${smallerScreen && 'smaller'} ${verySmallScreen && 'very-small'}`}>
        <Container
          style={{
            paddingLeft: smallerScreen || verySmallScreen ? '0' : '3.3rem',
            paddingRight: smallerScreen || verySmallScreen ? '0' : '3.3rem',
          }}
        >
          <Box className={`hero-metrics`}>
            <Paper className="ohm-card">
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
                {displayData.map(({ title, value, info }, i) => (
                  <Box key={i} bgcolor="mode.white" className="metric">
                    <Typography variant="h6" color="secondary">
                      {title}
                      {info && <InfoTooltip message={info} />}
                    </Typography>
                    <Typography variant="h4" color="textPrimary">
                      {value ? value : <Skeleton width="100px" />}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
          {/* <Zoom in={true}>
            <Grid container spacing={2} className="data-grid">
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card ohm-chart-card">
                  <Chart
                    type="area"
                    data={data}
                    dataKey={['totalValueLocked']}
                    stopColor={[['#768299', '#98B3E9']]}
                    headerText="Total Value Deposited"
                    headerSubText={`${data && formatCurrency(data[0].totalValueLocked)}`}
                    bulletpointColors={bulletpoints.tvl}
                    itemNames={tooltipItems.tvl}
                    itemType={itemType.dollar}
                    infoTooltipMessage={tooltipInfoMessages.tvl}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card ohm-chart-card">
                  <Chart
                    type="stack"
                    data={data}
                    dataKey={[
                      'treasuryDaiMarketValue',
                      'treasuryFraxMarketValue',
                      'treasuryWETHMarketValue',
                      'treasuryXsushiMarketValue',
                      'treasuryLusdRiskFreeValue',
                    ]}
                    stopColor={[
                      ['#F5AC37', '#EA9276'],
                      ['#768299', '#98B3E9'],
                      ['#DC30EB', '#EA98F1'],
                      ['#8BFF4D', '#4C8C2A'],
                      ['#ff758f', '#c9184a'],
                    ]}
                    headerText="Market Value of Treasury Assets"
                    headerSubText={`${data && formatCurrency(data[0].treasuryMarketValue)}`}
                    bulletpointColors={bulletpoints.coin}
                    itemNames={tooltipItems.coin}
                    itemType={itemType.dollar}
                    infoTooltipMessage={tooltipInfoMessages.mvt}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card ohm-chart-card">
                  <Chart
                    type="stack"
                    data={data}
                    format="currency"
                    dataKey={['treasuryDaiRiskFreeValue', 'treasuryFraxRiskFreeValue', 'treasuryLusdRiskFreeValue']}
                    stopColor={[
                      ['#F5AC37', '#EA9276'],
                      ['#768299', '#98B3E9'],
                      ['#DC30EB', '#EA98F1'],
                      ['#000', '#fff'],
                      ['#000', '#fff'],
                    ]}
                    headerText="Risk Free Value of Treasury Assets"
                    headerSubText={`${data && formatCurrency(data[0].treasuryRiskFreeValue)}`}
                    bulletpointColors={bulletpoints.rfv}
                    itemNames={tooltipItems.rfv}
                    itemType={itemType.dollar}
                    infoTooltipMessage={tooltipInfoMessages.rfv}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card">
                  <Chart
                    type="area"
                    data={data}
                    dataKey={['treasuryOhmDaiPOL']}
                    stopColor={[['rgba(128, 204, 131, 1)', 'rgba(128, 204, 131, 0)']]}
                    headerText="Protocol Owned Liquidity VSQ-DAI"
                    headerSubText={`${data && trim(data[0].treasuryOhmDaiPOL, 2)}% `}
                    dataFormat="percent"
                    bulletpointColors={bulletpoints.pol}
                    itemNames={tooltipItems.pol}
                    itemType={itemType.percentage}
                    infoTooltipMessage={tooltipInfoMessages.pol}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                    isPOL={true}
                  />
                </Paper>
              </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
                <Paper className="ohm-card">
                  <Chart
                    type="bar"
                    data={data}
                    dataKey={["holders"]}
                    headerText="Holders"
                    stroke={[theme.palette.text.secondary]}
                    headerSubText={`${data && data[0].holders}`}
                    bulletpointColors={bulletpoints.holder}
                    itemNames={tooltipItems.holder}
                    itemType={""}
                    infoTooltipMessage={tooltipInfoMessages.holder}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card">
                  <Chart
                    type="area"
                    data={staked}
                    dataKey={['staked']}
                    stopColor={[['#55EBC7', '#47ACEB']]}
                    headerText="VSQ Staked"
                    dataFormat="percent"
                    headerSubText={`${staked && trim(staked[0].staked, 2)}% `}
                    isStaked={true}
                    bulletpointColors={bulletpoints.staked}
                    infoTooltipMessage={tooltipInfoMessages.staked}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card">
                  <Chart
                    type="line"
                    scale="log"
                    data={apy}
                    dataKey={['apy']}
                    color={theme.palette.text.primary}
                    stroke={[theme.palette.text.primary]}
                    headerText="APY over time"
                    dataFormat="percent"
                    headerSubText={`${apy && trim(apy[0].apy, 2)}%`}
                    bulletpointColors={bulletpoints.apy}
                    itemNames={tooltipItems.apy}
                    itemType={itemType.percentage}
                    infoTooltipMessage={tooltipInfoMessages.apy}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Paper className="ohm-card">
                  <Chart
                    type="multi"
                    data={runway}
                    dataKey={['runwayCurrent', 'runway7dot5k', 'runway5k', 'runway2dot5k']}
                    color={theme.palette.text.primary}
                    stroke={[theme.palette.text.primary, '#2EC608', '#49A1F2', '#ff758f']}
                    headerText="Runway Available"
                    headerSubText={`${data && trim(data[0].runwayCurrent, 1)} Days`}
                    dataFormat="days"
                    bulletpointColors={bulletpoints.runway}
                    itemNames={tooltipItems.runway}
                    itemType={''}
                    infoTooltipMessage={tooltipInfoMessages.runway}
                    expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Zoom>*/}
        </Container>
      </div>
    </>
  );
}

export default TreasuryDashboard;
