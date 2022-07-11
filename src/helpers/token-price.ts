import axios from 'axios';

const eth_cache: { [key: string]: number } = {};
const poly_cache: { [key: string]: number } = {};

const axiosInstance = axios.create({
  baseURL: 'https://pro-api.coingecko.com/api/v3/',
});

export async function getPolygonTokenUSDPrice(tokenAddress: string[]) {
  if (tokenAddress.length > 0) {
    try {
      const polygonPrices = await axiosInstance.get(
        '/simple/token_price/polygon-pos?x_cg_pro_api_key=CG-9RZ2dab7K2SQJ1dKmj8KmW8p',
        {
          params: {
            contract_addresses: tokenAddress.join(','),
            vs_currencies: 'usd',
          },
        },
      );
      return polygonPrices.data[tokenAddress[0]];
    } catch (err) {}

    return { usd: 1, error: true };
  }
}

export async function getETHTokenUSDPrice(tokenAddress: string[]) {
  if (tokenAddress.length > 0) {
    try {
      const ethPrices = await axiosInstance.get(
        '/simple/token_price/ethereum?x_cg_pro_api_key=CG-9RZ2dab7K2SQJ1dKmj8KmW8p',
        {
          params: {
            contract_addresses: tokenAddress.join(','),
            vs_currencies: 'usd',
          },
        },
      );
      return ethPrices.data[tokenAddress[0]];
    } catch (err) {}

    return { usd: 1, error: true };
  }
}

export const getTokenPrice = async (symbol: string): Promise<number> => {
  if (symbol == 'MAI') return 1;

  if (symbol == 'gOHM') {
    const data = await getPolygonTokenUSDPrice(['0xd8ca34fd379d9ca3c6ee3b3905678320f5b45195'.toLocaleLowerCase()]);

    return data ? data.usd : 0;
  }

  return 1;
};

export const getTokenPriceByAddress = async (address: string): Promise<number> => {
  if (poly_cache[address]) {
    return poly_cache[address];
  }

  const data = await getPolygonTokenUSDPrice([address.toLocaleLowerCase()]);

  const ans = data ? data?.usd : 0;

  if (data && !data.error) poly_cache[address] = ans;

  return ans;
};

export const getTokenPriceByAddressETH = async (address: string): Promise<number> => {
  if (eth_cache[address]) {
    return eth_cache[address];
  }

  const data = await getETHTokenUSDPrice([address.toLocaleLowerCase()]);

  const ans = data ? data?.usd : 0;

  if (data && !data.error) eth_cache[address] = ans;

  return ans;
};
