import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY as string);
    return res.status(200).json({
      address: wallet.address,
      note: "Fund this address with Sepolia ETH"
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get wallet info' });
  }
}