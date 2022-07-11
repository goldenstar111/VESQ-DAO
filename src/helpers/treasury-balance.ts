import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://openapi.debank.com/v1/',
});

export async function getTreasuryValueUSD() {
  const treasuryBanace = await axiosInstance.get(
    '/user/chain_balance?id=0x8c7290399cECbBBf31E471951Cc4C2ce91F5073c&chain_id=matic',
  );
  return treasuryBanace.data;
}

export const getTreasuryBalance = async (): Promise<number> => {
  const balance = await getTreasuryValueUSD();

  return balance ? balance.usd_value : 0;
};
