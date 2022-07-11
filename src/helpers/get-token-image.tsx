import { SvgIcon } from '@material-ui/core';
import { ReactComponent as MAI } from '../assets/tokens/MAI.svg';
import { ReactComponent as VSQ } from '../assets/tokens/VSQ.svg';
import { ReactComponent as StakedVSQ } from '../assets/tokens/sVSQ.svg';
import { ReactComponent as amDAI } from '../assets/tokens/ADAI.svg';
import { ReactComponent as UST } from '../assets/tokens/UST.svg';
import { ReactComponent as TUSD } from '../assets/tokens/TUSD.svg';

import VSQ_ from '../assets/tokens/VSQ.svg';
import sVSQ_ from '../assets/tokens/sVSQ.svg';

import amWETH_ from '../assets/tokens/AMWETH.svg';
import AAVE_ from '../assets/tokens/AAVE.svg';
import WBTC_ from '../assets/tokens/WBTC.svg';
import WETH_ from '../assets/tokens/WETH.svg';
import RAI_ from '../assets/tokens/RAI.svg';
import WMATIC_ from '../assets/tokens/MATIC.svg';
import DPI_ from '../assets/tokens/DPI.svg';

import UST_ from '../assets/tokens/UST.svg';
import amDAI_ from '../assets/tokens/ADAI.svg';
import TUSD_ from '../assets/tokens/TUSD.svg';

import FRAX_ from '../assets/tokens/FRAX.svg';
import MAI_ from '../assets/tokens/MAI.svg';
import DAI_ from '../assets/tokens/DAI.svg';
import VSQ_UST_PAIR from '../assets/tokens/VSQ_UST.svg';
import VSQ_TUSD_PAIR from '../assets/tokens/VSQ_TUSD.svg';

function getVSQTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={VSQ} viewBox="0 0 32 32" style={style} />;
  return <img src={VSQ_}></img>;
}

function getStakedVSQTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={StakedVSQ} viewBox="0 0 100 100" style={style} />;
  return <img src={sVSQ_}></img>;
}

function getFRAXTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={FRAX_}></img>;
}

function getMAITokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={MAI_}></img>;
}

function getDAITokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={DAI_}></img>;
}

function getamDAITokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={amDAI_}></img>;
}

function getUSTTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={UST_}></img>;
}

function getTUSDTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={TUSD_}></img>;
}

function getamWETHTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={amWETH_}></img>;
}

function getAAVETokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={AAVE_}></img>;
}

function getWBTCTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={WBTC_}></img>;
}

function getWETHTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={WETH_}></img>;
}

function getWMATICTokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={WMATIC_}></img>;
}

function getRAITokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={RAI_}></img>;
}

function getDPITokenImage(size: number = 32) {
  const style = { height: size, width: size };
  // return <SvgIcon component={MAI} viewBox="0 0 32 32" style={style} />;
  return <img src={DPI_}></img>;
}

export type Token =
  | 'vsq'
  | 'svsq'
  | 'frax'
  | 'mai'
  | 'dai'
  | 'amDAI'
  | 'ust'
  | 'tusd'
  | 'amWETH'
  | 'aave'
  | 'wbtc'
  | 'weth'
  | 'wmatic'
  | 'rai'
  | 'dpi';

export function getTokenImage(name: Token, size?: number): JSX.Element {
  if (name === 'vsq') return getVSQTokenImage(size);
  if (name === 'svsq') return getStakedVSQTokenImage(size);
  if (name === 'frax') return getFRAXTokenImage(size);
  if (name === 'mai') return getMAITokenImage(size);
  if (name === 'dai') return getDAITokenImage(size);
  if (name === 'amDAI') return getamDAITokenImage(size);
  if (name === 'ust') return getUSTTokenImage(size);
  if (name === 'tusd') return getTUSDTokenImage(size);
  if (name === 'amWETH') return getamWETHTokenImage(size);
  if (name === 'aave') return getAAVETokenImage(size);
  if (name === 'wbtc') return getWBTCTokenImage(size);
  if (name === 'weth') return getWETHTokenImage(size);
  if (name === 'wmatic') return getWMATICTokenImage(size);
  if (name === 'rai') return getRAITokenImage(size);
  if (name === 'dpi') return getDPITokenImage(size);

  throw Error(`Token image doesn't support: ${name}`);
}

function toUrl(base: string): string {
  const url = window.location.origin;
  return url + '/' + base;
}

export function getTokenUrl(name: Token) {
  if (name === 'vsq') {
    const path = require('../assets/tokens/VSQ.svg').default;
    return toUrl(path);
  }

  if (name === 'svsq') {
    const path = require('../assets/tokens/sVSQ.svg').default;
    return toUrl(path);
  }

  throw Error(`Token url doesn't support: ${name}`);
}
