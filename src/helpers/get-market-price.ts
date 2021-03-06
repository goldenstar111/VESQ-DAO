import { BigNumber, ethers } from 'ethers';
import { getAddresses } from '../constants';
import { VSQMaiReserveContract } from '../abi';

export async function getMarketPrice(
  networkID: number,
  provider: ethers.Signer | ethers.providers.Provider,
): Promise<BigNumber> {
  const address = getAddresses(networkID);
  const pairContract = new ethers.Contract(address.RESERVES.MAI_VSQ, VSQMaiReserveContract, provider);
  const reserves = await pairContract.getReserves();
  const [vsq, mai] = BigNumber.from(address.MAI_ADDRESS).gt(address.VSQ_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]];
  const marketPrice = mai.div(vsq);
  return marketPrice;
}
