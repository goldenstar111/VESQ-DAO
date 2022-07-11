import { SvgIcon } from '@material-ui/core';
import { ReactComponent as VSQ } from '../assets/tokens/VSQ.svg';
import { ReactComponent as FRAX } from '../assets/tokens/FRAX.svg';
import { ReactComponent as MAI } from '../assets/tokens/MAI.svg';
import { ReactComponent as DAI } from '../assets/tokens/DAI.svg';
import { ReactComponent as ADAI } from '../assets/tokens/ADAI.svg';
import { ReactComponent as UST } from '../assets/tokens/UST.svg';
import { ReactComponent as TUSD } from '../assets/tokens/TUSD.svg';
import VSQ_FRAX_PAIR from '../assets/tokens/VSQ_FRAX.svg';
import VSQ_MAI_PAIR from '../assets/tokens/VSQ_MAI.svg';
import VSQ_DAI_PAIR from '../assets/tokens/VSQ_DAI.svg';
import VSQ_UST_PAIR from '../assets/tokens/VSQ_UST.svg';
import VSQ_TUSD_PAIR from '../assets/tokens/VSQ_TUSD.svg';

export function getPairImage(name: string) {
  if (name.indexOf('frax') >= 0)
    return (
      <img src={VSQ_FRAX_PAIR}></img>
      // <>
      //   <SvgIcon component={VSQ} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      //   <div style={{ width: '10px' }} />
      //   <SvgIcon component={MAI} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      // </>
    );

  if (name.indexOf('mai') >= 0)
    return (
      <img src={VSQ_MAI_PAIR}></img>
      // <>
      //   <SvgIcon component={VSQ} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      //   <div style={{ width: '10px' }} />
      //   <SvgIcon component={MAI} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      // </>
    );

  if (name.indexOf('dai') >= 0)
    return (
      <img src={VSQ_DAI_PAIR}></img>
      // <>
      //   <SvgIcon component={VSQ} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      //   <div style={{ width: '10px' }} />
      //   <SvgIcon component={MAI} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      // </>
    );

  if (name.indexOf('ust') >= 0)
    return (
      <img src={VSQ_UST_PAIR}></img>
      // <>
      //   <SvgIcon component={VSQ} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      //   <div style={{ width: '10px' }} />
      //   <SvgIcon component={MAI} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      // </>
    );

  if (name.indexOf('tusd') >= 0)
    return (
      <img src={VSQ_TUSD_PAIR}></img>
      // <>
      //   <SvgIcon component={VSQ} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      //   <div style={{ width: '10px' }} />
      //   <SvgIcon component={MAI} viewBox="0 0 32 32" style={{ height: '32px', width: '32px' }} />
      // </>
    );

  throw Error(`Pair image doesn't support: ${name}`);
}
