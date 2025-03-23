import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// Simple in-memory store for rate limiting
// NOTE: This resets when the serverless function is redeployed
// For production, use a persistent database
const requestLog: Record<string, { timestamp: number, address: string }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.body;
    
    // Validate Ethereum address
    if (!address || !ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    
    // Get client IP for rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    // Check rate limit (by IP)
    const limitHours = Number(process.env.REQUEST_LIMIT_HOURS || 24);
    const now = Date.now();
    const lastRequest = requestLog[clientIp as string];
    
    if (lastRequest && (now - lastRequest.timestamp) < limitHours * 60 * 60 * 1000) {
      const hoursRemaining = limitHours - ((now - lastRequest.timestamp) / (60 * 60 * 1000));
      return res.status(429).json({
        error: `Rate limit exceeded. Try again in ${hoursRemaining.toFixed(1)} hours`,
        lastAddress: lastRequest.address
      });
    }
    
    // Connect to Ethereum
    const provider = new ethers.providers.JsonRpcProvider(
      `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
    );
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY as string, provider);
    
    // Send transaction
    const dripAmount = process.env.DRIP_AMOUNT || '0.01';
    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(dripAmount)
    });
    
    // Log request
    requestLog[clientIp as string] = {
      timestamp: now,
      address
    };
    
    // Return success
    return res.status(200).json({
      txHash: tx.hash,
      amount: dripAmount
    });
    
  } catch (error) {
    console.error('Faucet error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

