/**
 * Quai Network Configuration for TraceLock
 * Official documentation specifications:
 * - Network: Quai Orchard Testnet (Zone Cyprus-1)
 * - Chain ID: 15000 (0x3a98)
 * - RPC URL: https://orchard.rpc.quai.network/cyprus1
 * - Explorer: https://orchard.quaiscan.io or https://explorer.qu.ai
 */

export interface QuaiNetworkConfig {
  networkName: string;
  zone: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
  currencySymbol: string;
}

export const QUAI_CONFIG: QuaiNetworkConfig = {
  networkName: 'Quai Orchard Testnet',
  zone: 'cyprus-1',
  chainId: 15000,
  chainIdHex: '0x3a98',
  rpcUrl: ((import.meta as any).env && (import.meta as any).env.VITE_QUAI_RPC_URL) || 'https://orchard.rpc.quai.network/cyprus1',
  explorerUrl: ((import.meta as any).env && (import.meta as any).env.VITE_QUAI_EXPLORER_URL) || 'https://orchard.quaiscan.io',
  contractAddress: ((import.meta as any).env && (import.meta as any).env.VITE_QUAI_CONTRACT_ADDRESS) || '0x71b268B1a1c93a08c02F9335fFDC81D5E7989396',
  currencySymbol: 'QUAI'
};
