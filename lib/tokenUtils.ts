// Token utility functions used across the app

// Clean token symbol by removing testnet suffixes
export const cleanTokenSymbol = (symbol: string): string => {
  return symbol.replace('-SEPOLIA', '').replace('-DEVNET', '').replace('-AMOY', '').replace('-FUJI', '');
};

// Clean token name by removing testnet suffixes
export const cleanTokenName = (name: string): string => {
  return name.replace('-Sepolia', '').replace('-Devnet', '').replace('-Amony', '').replace('-Fuji', '');
};

// Generate reliable image URL for tokens
export const getTokenImageUrl = (symbol: string): string => {
  const cleanSymbol = cleanTokenSymbol(symbol);
  
  // Use CoinGecko CDN for reliable images
  const coinGeckoIds: { [key: string]: string } = {
    'ETH': '1027',
    'USDC': '3408', 
    'USDT': '825',
    'SOL': '5426',
    'MATIC': '3890',
    'AVAX': '5805',
    'ARB': '11841',
    'OP': '11840',
    'POL': '28321',
    'EURC': '20641',
    'BTC': '1',
    'BNB': '1839',
    'ADA': '2010',
    'DOT': '6636',
    'LINK': '1975',
    'UNI': '7083',
    'LTC': '2',
    'BCH': '1831',
    'XRP': '52',
    'DOGE': '74'
  };

  const coinId = coinGeckoIds[cleanSymbol];
  if (coinId) {
    return `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinId}.png`;
  }

  // Fallback to ui-avatars.com for unknown tokens
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanSymbol)}&background=10B981&color=fff&size=64`;
};

// Get blockchain icon and clean symbol
export const getBlockchainInfo = (blockchain: string) => {
  const cleanBlockchain = blockchain.replace('-SEPOLIA', '').replace('-DEVNET', '').replace('-AMOY', '').replace('-FUJI', '');
  
  const blockchainIcons: { [key: string]: string } = {
    'ETH': 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628', // Ethereum
    'ARB': 'https://assets.coingecko.com/coins/images/16547/standard/arb.jpg?1721358242', // Arbitrum
    'BASE': 'https://assets.coingecko.com/nft_contracts/images/2989/standard/base-introduced.png?1707289780', // Base
    'OP': 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png?1696524385', // Optimism
    'MATIC': 'https://assets.coingecko.com/coins/images/32440/standard/polygon.png?1698233684', // Polygon
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png?1696512369', // Avalanche
    'SOL': 'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756', // Solana
    'APTOS': 'https://assets.coingecko.com/coins/images/26455/standard/aptos_round.png?1696525528', // Aptos
    'UNI': 'https://assets.coingecko.com/coins/images/12504/standard/uniswap-logo.png?1720676669', // Unichain
  };

  return {
    icon: blockchainIcons[cleanBlockchain] || '⭕',
    name: cleanBlockchain
  };
};

// Get token symbol from tokenId (simplified mapping)
export const getTokenSymbolFromId = (tokenId: string, blockchain: string): string => {
  // This is a simplified mapping - you might want to fetch this from your token data
  const tokenMap: { [key: string]: string } = {
    '9ad91eb5-e152-5d81-b60e-151d5fd2b3d3': 'ETH',
    '4b8daacc-5f47-5909-a3ba-30d171ebad98': 'USDC',
    // Add more mappings as needed
  };
  
  return tokenMap[tokenId] || 'TOKEN';
};
