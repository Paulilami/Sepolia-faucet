import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import React from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Processing...');
    
    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('Success! ETH has been sent.');
        setTxHash(data.txHash);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Server error, please try again');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Sepolia ETH Faucet</title>
        <meta name="description" content="Request Sepolia testnet ETH" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Sepolia ETH Faucet</h1>
        
        <p className={styles.description}>
          Request 0.01 Sepolia ETH for testing
        </p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your Ethereum address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={styles.input}
            required
          />
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading || !address}
          >
            {loading ? 'Processing...' : 'Request ETH'}
          </button>
        </form>
        
        {status && <p className={styles.status}>{status}</p>}
        
        {txHash && (
          <p className={styles.txHash}>
            Transaction: <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash}
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
