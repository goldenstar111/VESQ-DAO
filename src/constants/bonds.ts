import { getAddresses } from '.';

export type BondKey =
  | 'amWETH'
  | 'aave'
  | 'wbtc'
  | 'weth'
  | 'wmatic'
  | 'rai'
  | 'dpi'
  | 'frax'
  | 'mai'
  | 'dai'
  | 'amDAI'
  | 'ust'
  | 'tusd'
  | 'frax_vsq'
  | 'mai_vsq'
  | 'dai_vsq'
  | 'ust_vsq'
  | 'tusd_vsq';

export const BondKeys: BondKey[] = [
  'amWETH',
  'aave',
  'wbtc',
  'weth',
  'wmatic',
  'rai',
  'dpi',
  'frax',
  'mai',
  'dai',
  'ust',
  'tusd',
  'amDAI',
  'frax_vsq',
  'mai_vsq',
  'dai_vsq',
  'ust_vsq',
  'tusd_vsq',
];
// export const BondKeys: BondKey[] = ['mai-v1', 'mai_vsq-v1', 'mai_vsq_v2-v1'];

export interface Bond {
  key: BondKey;
  name: string;
  address: string;
  reserve: string;
  type: 'token' | 'lp';
  lpUrl: string;
  deprecated: boolean;
  decimals: number;
}

type BondMap = {
  [key in BondKey]: Bond;
};

export function listBonds(chainId: number): BondMap {
  const { BONDS, RESERVES, MAI_ADDRESS, VSQ_ADDRESS } = getAddresses(chainId);
  return {
    amWETH: {
      key: 'amWETH',
      name: 'amWETH',
      address: BONDS.amWETH,
      reserve: RESERVES.amWETH,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    aave: {
      key: 'aave',
      name: 'AAVE',
      address: BONDS.AAVE,
      reserve: RESERVES.AAVE,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    wbtc: {
      key: 'wbtc',
      name: 'WBTC',
      address: BONDS.WBTC,
      reserve: RESERVES.WBTC,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 8,
    },
    weth: {
      key: 'weth',
      name: 'WETH',
      address: BONDS.WETH,
      reserve: RESERVES.WETH,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    wmatic: {
      key: 'wmatic',
      name: 'WMATIC',
      address: BONDS.WMATIC,
      reserve: RESERVES.WMATIC,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    rai: {
      key: 'rai',
      name: 'RAI',
      address: BONDS.RAI,
      reserve: RESERVES.RAI,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    dpi: {
      key: 'dpi',
      name: 'DPI',
      address: BONDS.DPI,
      reserve: RESERVES.DPI,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    frax: {
      key: 'frax',
      name: 'FRAX',
      address: BONDS.FRAX,
      reserve: RESERVES.FRAX,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    mai: {
      key: 'mai',
      name: 'MAI',
      address: BONDS.MAI,
      reserve: RESERVES.MAI,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    dai: {
      key: 'dai',
      name: 'DAI',
      address: BONDS.DAI,
      reserve: RESERVES.DAI,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    amDAI: {
      key: 'amDAI',
      name: 'amDAI',
      address: BONDS.amDAI,
      reserve: RESERVES.amDAI,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    ust: {
      key: 'ust',
      name: 'UST',
      address: BONDS.UST,
      reserve: RESERVES.UST,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    tusd: {
      key: 'tusd',
      name: 'TUSD',
      address: BONDS.TUSD,
      reserve: RESERVES.TUSD,
      type: 'token',
      lpUrl: '',
      deprecated: true,
      decimals: 18,
    },
    frax_vsq: {
      key: 'frax_vsq',
      name: 'VSQ-FRAX LP',
      address: BONDS.FRAX_VSQ,
      reserve: RESERVES.FRAX_VSQ,
      type: 'lp',
      lpUrl: `https://app.sushi.com/#/add/${RESERVES.FRAX}/${VSQ_ADDRESS}`,
      deprecated: true,
      decimals: 18,
    },
    mai_vsq: {
      key: 'mai_vsq',
      name: 'VSQ-MAI LP',
      address: BONDS.MAI_VSQ,
      reserve: RESERVES.MAI_VSQ,
      type: 'lp',
      lpUrl: `https://app.sushi.com/#/add/${RESERVES.MAI}/${VSQ_ADDRESS}`,
      deprecated: true,
      decimals: 18,
    },
    dai_vsq: {
      key: 'dai_vsq',
      name: 'VSQ-DAI LP',
      address: BONDS.DAI_VSQ,
      reserve: RESERVES.DAI_VSQ,
      type: 'lp',
      lpUrl: `https://app.sushi.com/#/add/${RESERVES.DAI}/${VSQ_ADDRESS}`,
      deprecated: true,
      decimals: 18,
    },
    ust_vsq: {
      key: 'ust_vsq',
      name: 'VSQ-UST LP',
      address: BONDS.UST_VSQ,
      reserve: RESERVES.UST_VSQ,
      type: 'lp',
      lpUrl: `https://app.sushi.com/#/add/${RESERVES.UST}/${VSQ_ADDRESS}`,
      deprecated: true,
      decimals: 18,
    },
    tusd_vsq: {
      key: 'tusd_vsq',
      name: 'VSQ-TUSD LP',
      address: BONDS.TUSD_VSQ,
      reserve: RESERVES.TUSD_VSQ,
      type: 'lp',
      lpUrl: `https://app.sushi.com/#/add/${RESERVES.TUSD}/${VSQ_ADDRESS}`,
      deprecated: true,
      decimals: 18,
    },
  };
}

export function getBond(bondKey: BondKey, chainId: number): Bond {
  return listBonds(chainId)[bondKey];
}
