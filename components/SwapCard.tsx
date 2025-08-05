'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, Settings, Zap } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { 
  COMMON_TOKENS, 
  Token, 
  getExchange, 
  getReserves, 
  swapEthForTokens, 
  swapTokensForEth,
  approveToken,
  getTokenForEthPrice,
  getEthForTokenPrice,
  getBalance
} from '@/lib/web3'
import { ethers } from 'ethers'

interface SwapCardProps {
  className?: string
}

export default function SwapCard({ className }: SwapCardProps) {
  const [ethToken] = useState<Token>(COMMON_TOKENS[0]) // ETH is always fixed
  const [token1, setToken1] = useState<Token>(COMMON_TOKENS[1])
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [isSwapping, setIsSwapping] = useState(false)
  const [exchangeAddress, setExchangeAddress] = useState('')
  const [reserves, setReserves] = useState({ ethReserve: 0n, tokenReserve: 0n })
  const [userBalance0, setUserBalance0] = useState('0')
  const [userBalance1, setUserBalance1] = useState('0')
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    if (token1.address !== '0x0000000000000000000000000000000000000000') {
      loadExchangeData()
    }
  }, [token1])

  useEffect(() => {
    // Get user address when component mounts
    const getUserAddress = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setUserAddress(accounts[0])
            updateBalances(accounts[0])
          }
        } catch (error) {
          console.error('Error getting user address:', error)
        }
      }
    }
    getUserAddress()
  }, [])

  const loadExchangeData = async () => {
    try {
      // Get exchange address for the token
      const exchangeAddr = await getExchange(token1.address)
      setExchangeAddress(exchangeAddr)
      
      if (exchangeAddr !== '0x0000000000000000000000000000000000000000') {
        // Get reserves
        const reserveData = await getReserves(exchangeAddr)
        setReserves(reserveData)
      }
    } catch (error) {
      console.error('Error loading exchange data:', error)
    }
  }

  const updateBalances = async (address: string) => {
    try {
      const balance0 = await getBalance(address, ethToken.address)
      const balance1 = await getBalance(address, token1.address)
      setUserBalance0(balance0)
      setUserBalance1(balance1)
    } catch (error) {
      console.error('Error updating balances:', error)
    }
  }

  const handleSwap = async () => {
    if (!amount0 || !amount1 || !exchangeAddress || !userAddress) return
    
    setIsSwapping(true)
    try {
      if (ethToken.symbol === 'ETH') {
        // ETH to Token swap using user's contract function
        const minTokens = parseFloat(amount1) * (1 - slippage / 100)
        await swapEthForTokens(exchangeAddress, minTokens.toString(), amount0, userAddress)
      } else {
        // Token to ETH swap using user's contract function
        const minEth = parseFloat(amount1) * (1 - slippage / 100)
        
        // First approve the exchange to spend tokens
        await approveToken(token1.address, exchangeAddress, amount0)
        
        // Then perform the swap
        await swapTokensForEth(exchangeAddress, amount0, minEth.toString())
      }
      
      // Reset amounts after successful swap
      setAmount0('')
      setAmount1('')
      
      // Reload exchange data and balances
      await loadExchangeData()
      await updateBalances(userAddress)
      
      alert('Swap completed successfully!')
      
    } catch (error) {
      console.error('Swap failed:', error)
      alert('Swap failed. Please check your balance and try again.')
    } finally {
      setIsSwapping(false)
    }
  }

  const handleTokenSwitch = () => {
    setAmount0(amount1)
    setAmount1(amount0)
  }

  const calculateOutputAmount = async (inputAmount: string) => {
    if (!inputAmount || !exchangeAddress) return ''
    
    try {
      if (ethToken.symbol === 'ETH') {
        // ETH to Token: use user's gettokenforEth function
        const output = await getTokenForEthPrice(exchangeAddress, inputAmount)
        return output
      } else {
        // Token to ETH: use user's getEthfortokens function
        const output = await getEthForTokenPrice(exchangeAddress, inputAmount)
        return output
      }
    } catch (error) {
      console.error('Error calculating output amount:', error)
      return ''
    }
  }

  const handleInputChange = async (value: string, isToken0: boolean) => {
    if (isToken0) {
      setAmount0(value)
      if (value && exchangeAddress) {
        const output = await calculateOutputAmount(value)
        setAmount1(output)
      } else {
        setAmount1('')
      }
    } else {
      setAmount1(value)
    }
  }

  return (
    <div className={cn("card max-w-md mx-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Swap</h2>
        <button className="p-2 text-secondary-400 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Token 0 Input (ETH) */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-secondary-400">From</label>
          <span className="text-xs text-secondary-400">Balance: {formatNumber(parseFloat(userBalance0))}</span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
          <input
            type="number"
            value={amount0}
            onChange={(e) => handleInputChange(e.target.value, true)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
          />
          <span className="text-white font-medium">{ethToken.symbol}</span>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center my-3">
        <button
          onClick={handleTokenSwitch}
          className="p-2 bg-secondary-800 hover:bg-secondary-700 rounded-full transition-colors"
        >
          <ArrowDown className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Token 1 Input (ERC20) */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-secondary-400">To</label>
          <span className="text-xs text-secondary-400">Balance: {formatNumber(parseFloat(userBalance1))}</span>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
          <input
            type="number"
            value={amount1}
            onChange={(e) => handleInputChange(e.target.value, false)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
          />
          <button className="flex items-center space-x-2 bg-secondary-700 hover:bg-secondary-600 px-3 py-1 rounded-lg transition-colors">
            <span className="text-white font-medium">{token1.symbol}</span>
            <span className="text-secondary-400">▼</span>
          </button>
        </div>
      </div>

      {/* Swap Details - Compact */}
      <div className="space-y-2 mb-4 p-3 bg-secondary-800 rounded-lg text-sm">
        <div className="flex justify-between">
          <span className="text-secondary-400">Slippage</span>
          <span className="text-white font-medium">{slippage}%</span>
        </div>
        {exchangeAddress && (
          <div className="flex justify-between">
            <span className="text-secondary-400">Exchange</span>
            <span className="text-white font-medium text-xs">{exchangeAddress.slice(0, 6)}...{exchangeAddress.slice(-4)}</span>
          </div>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!amount0 || !amount1 || isSwapping || !exchangeAddress || !userAddress}
        className={cn(
          "w-full btn-primary flex items-center justify-center space-x-2 py-3 text-lg font-semibold",
          (!amount0 || !amount1 || isSwapping || !exchangeAddress || !userAddress) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isSwapping ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Swapping...</span>
          </>
        ) : !exchangeAddress ? (
          <>
            <span>Exchange Not Found</span>
          </>
        ) : !userAddress ? (
          <>
            <span>Connect Wallet</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Swap</span>
          </>
        )}
      </button>
    </div>
  )
} 