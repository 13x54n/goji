// Blockchain utility functions

// Get blockchain explorer URL for a transaction hash
export const getExplorerUrl = (txHash: string, blockchain: string): string => {
  switch (blockchain) {
    case 'ETH-SEPOLIA':
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case 'ARB-SEPOLIA':
      return `https://sepolia.arbiscan.io/tx/${txHash}`;
    case 'SOL-DEVNET':
      return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    case 'APTOS-TESTNET':
      return `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`;
    case 'BASE-SEPOLIA':
      return `https://sepolia.basescan.org/tx/${txHash}`;
    case 'OP-SEPOLIA':
      return `https://sepolia-optimism.etherscan.io/tx/${txHash}`;
    case 'MATIC-AMOY':
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    case 'AVAX-FUJI':
      return `https://testnet.snowtrace.io/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
};

// Get blockchain display name
export const getBlockchainDisplayName = (blockchain: string): string => {
  const cleanBlockchain = blockchain.replace('-SEPOLIA', '').replace('-DEVNET', '').replace('-AMOY', '').replace('-FUJI', '');
  
  const displayNames: { [key: string]: string } = {
    'ETH': 'Ethereum',
    'ARB': 'Arbitrum',
    'BASE': 'Base',
    'OP': 'Optimism',
    'MATIC': 'Polygon',
    'AVAX': 'Avalanche',
    'SOL': 'Solana',
    'APTOS': 'Aptos',
    'UNI': 'Unichain',
  };

  return displayNames[cleanBlockchain] || cleanBlockchain;
};

// Check if blockchain is a testnet
export const isTestnet = (blockchain: string): boolean => {
  return blockchain.includes('-SEPOLIA') || 
         blockchain.includes('-DEVNET') || 
         blockchain.includes('-AMOY') || 
         blockchain.includes('-FUJI');
};

// Get blockchain network type
export const getNetworkType = (blockchain: string): 'mainnet' | 'testnet' => {
  return isTestnet(blockchain) ? 'testnet' : 'mainnet';
};
