import { ethers } from 'ethers'

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI?: string
}

export interface Pool {
  address: string
  token0: Token
  token1: Token
  reserve0: string
  reserve1: string
  totalSupply: string
}

// Factory Contract ABI (matching user's Factory.sol)
export const FACTORY_ABI = [
  'function tokenToExchange(address) external view returns (address)',
  'function exchangeToToken(address) external view returns (address)',
  'function idToToken(uint256) external view returns (address)',
  'function exchangeArray(uint256) external view returns (address)',
  'function createNewExchange(address _tokenAddress) external returns (address)',
  'function getExchange(address _tokenAddress) external view returns (address)',
  'function getToken(address _exchange) external view returns (address)',
  'function getTokenWithId(uint256 _tokenId) external view returns (address)',
  'event ExchangeCreated(address indexed tokenAddress, address indexed exchangeAddress)'
]

// Exchange Contract ABI (matching user's Exchange.sol)
export const EXCHANGE_ABI = [
  'function tokenaddress() external view returns (address)',
  'function factorycontract() external view returns (address)',
  'function gettokenreserve() external view returns (uint256)',
  'function getamount(uint256 inputamount, uint256 inputreserve, uint256 outputreserve) external pure returns (uint256)',
  'function getEthfortokens(uint256 tokensSold) external view returns (uint256)',
  'function gettokenforEth(uint256 Ethsold) external view returns (uint256)',
  'function addliquidity(uint256 tokenadded) external payable returns (uint256)',
  'function removeliquidity(uint256 tokenamount) external returns (uint256, uint256)',
  'function swapEthForTokens(uint256 minTokens, address recipient) external payable returns (uint256)',
  'function tokenForEthSwap(uint256 tokensSold, uint256 minEth) external returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function transfer(address to, uint256 value) external returns (bool)',
  'function transferFrom(address from, address to, uint256 value) external returns (bool)',
  'function approve(address spender, uint256 value) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'event AddedLiquidity(address indexed sender, uint256 ethamount, uint256 tokenamount)',
  'event RemovedLiquidity(address indexed reciever, uint256 ethamount, uint256 tokenamount)',
  'event tokenpurchaged(address indexed buyer, uint256 ethamount, uint256 tokenamount)',
  'event tokensold(address indexed seller, uint256 tokensold, uint256 ethrecieved)'
]

// ERC20 Token ABI
export const ERC20_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function transfer(address to, uint256 value) external returns (bool)',
  'function transferFrom(address from, address to, uint256 value) external returns (bool)',
  'function approve(address spender, uint256 value) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)'
]

// Common tokens on Sepolia
export const COMMON_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    decimals: 6,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // Sepolia USDT
    decimals: 6,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', // Sepolia DAI
    decimals: 18,
  },
]

// Contract addresses - UPDATE THESE WITH YOUR DEPLOYED CONTRACTS
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000'

export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  return null
}

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      return accounts[0]
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }
  throw new Error('No wallet found')
}

export async function getBalance(address: string, tokenAddress?: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')

  if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
    // Get ETH balance
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } else {
    // Get token balance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const balance = await tokenContract.balanceOf(address)
    const decimals = await tokenContract.decimals()
    return ethers.formatUnits(balance, decimals)
  }
}

export function parseUnits(value: string, decimals: number) {
  return ethers.parseUnits(value, decimals)
}

export function formatUnits(value: bigint, decimals: number) {
  return ethers.formatUnits(value, decimals)
}

// Factory contract functions (matching user's Factory.sol)
export async function getFactoryContract() {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
}

export async function createExchange(tokenAddress: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  
  const signer = await provider.getSigner()
  const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer)
  
  const tx = await factoryContract.createNewExchange(tokenAddress)
  return await tx.wait()
}

export async function getExchange(tokenAddress: string) {
  const factoryContract = await getFactoryContract()
  return await factoryContract.getExchange(tokenAddress)
}

// Exchange contract functions (matching user's Exchange.sol)
export async function getExchangeContract(exchangeAddress: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  
  return new ethers.Contract(exchangeAddress, EXCHANGE_ABI, provider)
}

export async function getExchangeContractWithSigner(exchangeAddress: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  
  const signer = await provider.getSigner()
  return new ethers.Contract(exchangeAddress, EXCHANGE_ABI, signer)
}

export async function getTokenReserve(exchangeAddress: string) {
  const exchangeContract = await getExchangeContract(exchangeAddress)
  return await exchangeContract.gettokenreserve()
}

export async function getEthReserve(exchangeAddress: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  return await provider.getBalance(exchangeAddress)
}

export async function getReserves(exchangeAddress: string) {
  const [ethReserve, tokenReserve] = await Promise.all([
    getEthReserve(exchangeAddress),
    getTokenReserve(exchangeAddress)
  ])
  return { ethReserve, tokenReserve }
}

export async function addLiquidity(exchangeAddress: string, tokenAmount: string, ethAmount: string) {
  const exchangeContract = await getExchangeContractWithSigner(exchangeAddress)
  const tokenAmountWei = parseUnits(tokenAmount, 18) // Assuming 18 decimals for most tokens
  
  const tx = await exchangeContract.addliquidity(tokenAmountWei, { value: parseUnits(ethAmount, 18) })
  return await tx.wait()
}

export async function removeLiquidity(exchangeAddress: string, lpAmount: string) {
  const exchangeContract = await getExchangeContractWithSigner(exchangeAddress)
  const lpAmountWei = parseUnits(lpAmount, 18)
  
  const tx = await exchangeContract.removeliquidity(lpAmountWei)
  return await tx.wait()
}

export async function swapEthForTokens(exchangeAddress: string, minTokens: string, ethAmount: string, recipient: string) {
  const exchangeContract = await getExchangeContractWithSigner(exchangeAddress)
  const minTokensWei = parseUnits(minTokens, 18)
  const ethAmountWei = parseUnits(ethAmount, 18)
  
  const tx = await exchangeContract.swapEthForTokens(minTokensWei, recipient, { value: ethAmountWei })
  return await tx.wait()
}

export async function swapTokensForEth(exchangeAddress: string, tokensSold: string, minEth: string) {
  const exchangeContract = await getExchangeContractWithSigner(exchangeAddress)
  const tokensSoldWei = parseUnits(tokensSold, 18)
  const minEthWei = parseUnits(minEth, 18)
  
  const tx = await exchangeContract.tokenForEthSwap(tokensSoldWei, minEthWei)
  return await tx.wait()
}

// Price calculation functions (matching user's Exchange.sol)
export async function getTokenForEthPrice(exchangeAddress: string, ethAmount: string) {
  const exchangeContract = await getExchangeContract(exchangeAddress)
  const ethAmountWei = parseUnits(ethAmount, 18)
  const tokenAmount = await exchangeContract.gettokenforEth(ethAmountWei)
  return formatUnits(tokenAmount, 18)
}

export async function getEthForTokenPrice(exchangeAddress: string, tokenAmount: string) {
  const exchangeContract = await getExchangeContract(exchangeAddress)
  const tokenAmountWei = parseUnits(tokenAmount, 18)
  const ethAmount = await exchangeContract.getEthfortokens(tokenAmountWei)
  return formatUnits(ethAmount, 18)
}

// Token contract functions
export async function getTokenContract(tokenAddress: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider)
}

export async function getTokenContractWithSigner(tokenAddress: string) {
  const provider = getProvider()
  if (!provider) throw new Error('No provider found')
  
  const signer = await provider.getSigner()
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer)
}

export async function approveToken(tokenAddress: string, spenderAddress: string, amount: string) {
  const tokenContract = await getTokenContractWithSigner(tokenAddress)
  const amountWei = parseUnits(amount, 18)
  const tx = await tokenContract.approve(spenderAddress, amountWei)
  return await tx.wait()
}

// Utility functions
export function calculateDeadline(minutes: number = 20): number {
  return Math.floor(Date.now() / 1000) + (minutes * 60)
}

export function calculatePriceImpact(inputAmount: string, outputAmount: string, reserves: { ethReserve: bigint, tokenReserve: bigint }): number {
  // Simple price impact calculation
  const input = parseFloat(inputAmount)
  const output = parseFloat(outputAmount)
  const ethReserve = parseFloat(ethers.formatEther(reserves.ethReserve))
  const tokenReserve = parseFloat(ethers.formatEther(reserves.tokenReserve))
  
  if (input === 0 || ethReserve === 0) return 0
  
  const priceBefore = tokenReserve / ethReserve
  const priceAfter = (tokenReserve - output) / (ethReserve + input)
  const priceImpact = ((priceBefore - priceAfter) / priceBefore) * 100
  
  return Math.abs(priceImpact)
} 