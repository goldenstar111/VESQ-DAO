import { getTokenImage, getPairImage } from '../helpers';
import { Box } from '@material-ui/core';
import { Bond } from 'src/constants';

interface IBondHeaderProps {
  bond: Bond;
}

function BondHeader({ bond }: IBondHeaderProps) {
  const reserveAssetImg = () => {
    if (bond.key.indexOf('vsq') >= 0) {
      return getTokenImage('vsq');
    } else if (bond.key.indexOf('frax') >= 0) {
      return getTokenImage('frax');
    } else if (bond.key.indexOf('mai') >= 0) {
      return getTokenImage('mai');
    } else if (bond.key.indexOf('amDAI') >= 0) {
      return getTokenImage('amDAI');
    } else if (bond.key.indexOf('dai') >= 0) {
      return getTokenImage('dai');
    } else if (bond.key.indexOf('ust') >= 0) {
      return getTokenImage('ust');
    } else if (bond.key.indexOf('tusd') >= 0) {
      return getTokenImage('tusd');
    } else if (bond.key.indexOf('amWETH') >= 0) {
      return getTokenImage('amWETH');
    } else if (bond.key.indexOf('aave') >= 0) {
      return getTokenImage('aave');
    } else if (bond.key.indexOf('wbtc') >= 0) {
      return getTokenImage('wbtc');
    } else if (bond.key.indexOf('weth') >= 0) {
      return getTokenImage('weth');
    } else if (bond.key.indexOf('wmatic') >= 0) {
      return getTokenImage('wmatic');
    } else if (bond.key.indexOf('rai') >= 0) {
      return getTokenImage('rai');
    } else if (bond.key.indexOf('dpi') >= 0) {
      return getTokenImage('dpi');
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" width={'74px'}>
      {bond.type === 'lp' ? getPairImage(bond.key) : reserveAssetImg()}
    </Box>
  );
}

export default BondHeader;
