// In a real app, you would get these addresses from your deployment script's output
// For now, we'll use placeholder addresses for the UI.
export const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', icon: '/eth.svg' },
  { symbol: 'SHROUD', name: 'Shroud Token', address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', icon: '/shroud-icon.svg' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', icon: '/usdc.svg' },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', icon: '/usdt.svg' },
  { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', icon: '/dai.svg' },
];

export type Token = typeof TOKENS[0];