'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  COMMON_TOKENS, 
  Token, 
  getExchange, 
  getReserves,
  addLiquidity,
  removeLiquidity,
  getBalance
} from '@/lib/web3'
import { ethers } from 'ethers'

interface LiquidityCardProps {
  className?: string
}

export default function LiquidityCard({ className }: LiquidityCardProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add')
  const [ethToken] = useState<Token>(COMMON_TOKENS[0]) // ETH is always fixed
  const [token1, setToken1] = useState<Token>(COMMON_TOKENS[1])
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handleAddLiquidity = async () => {
    if (!ethAmount || !tokenAmount || !exchangeAddress || !userAddress) return
    
    setIsProcessing(true)
    try {
      // For user's contract, we need to send ETH and tokens
      await addLiquidity(exchangeAddress, tokenAmount, ethAmount)
      
      setEthAmount('')
      setTokenAmount('')
      
      // Reload exchange data and balances
      await loadExchangeData()
      await updateBalances(userAddress)
      
      alert('Liquidity added successfully!')
      
    } catch (error) {
      console.error('Add liquidity failed:', error)
      alert('Failed to add liquidity. Please check your balance and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!ethAmount || !exchangeAddress || !userAddress) return
    
    setIsProcessing(true)
    try {
      // For user's contract, ethAmount represents LP tokens to burn
      await removeLiquidity(exchangeAddress, ethAmount)
      
      setEthAmount('')
      setTokenAmount('')
      
      // Reload exchange data and balances
      await loadExchangeData()
      await updateBalances(userAddress)
      
      alert('Liquidity removed successfully!')
      
    } catch (error) {
      console.error('Remove liquidity failed:', error)
      alert('Failed to remove liquidity. Please check your LP tokens and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculatePoolShare = () => {
    if (!reserves.ethReserve || !reserves.tokenReserve) return 0
    
    const ethReserve = parseFloat(ethers.formatEther(reserves.ethReserve))
    const tokenReserve = parseFloat(ethers.formatEther(reserves.tokenReserve))
    
    if (ethReserve === 0 || tokenReserve === 0) return 0
    
    // Simple calculation - in reality this would be based on LP tokens
    return 0.01 // Mock value
  }

  const poolShare = calculatePoolShare()

  return (
    <div className={cn("card max-w-md mx-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Liquidity</h2>
        <button className="p-2 text-secondary-400 hover:text-white transition-colors cursor:pointer">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-secondary-800 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('add')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'add'
              ? "bg-primary-600 text-white"
              : "text-secondary-400 hover:text-white"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'remove'
              ? "bg-primary-600 text-white"
              : "text-secondary-400 hover:text-white"
          )}
        >
          <Minus className="h-4 w-4" />
          <span>Remove</span>
        </button>
      </div>

      {/* Token Selection */}
      <div className="space-y-3 mb-4">
        {activeTab === 'add' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm text-secondary-400">ETH Amount</label>
              <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
                />
                <span className="text-white font-medium">{ethToken.symbol}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary-400">{token1.symbol} Amount</label>
              <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
                />
                <button className="flex items-center space-x-2 bg-secondary-700 hover:bg-secondary-600 px-3 py-1 rounded-lg transition-colors">
                  <span className="text-white font-medium">{token1.symbol}</span>
                  <span className="text-secondary-400">▼</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-sm text-secondary-400">LP Tokens to Remove</label>
            <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
              />
              <span className="text-secondary-400 font-medium">LP</span>
            </div>
          </div>
        )}
      </div>

      {/* Pool Information - Compact */}
      <div className="space-y-2 mb-4 p-3 bg-secondary-800 rounded-lg text-sm">
        <div className="flex justify-between">
          <span className="text-secondary-400">Pool Share</span>
          <span className="text-white font-medium">{poolShare}%</span>
        </div>
        {exchangeAddress && (
          <div className="flex justify-between">
            <span className="text-secondary-400">Exchange</span>
            <span className="text-white font-medium text-xs">{exchangeAddress.slice(0, 6)}...{exchangeAddress.slice(-4)}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={activeTab === 'add' ? handleAddLiquidity : handleRemoveLiquidity}
        disabled={!ethAmount || (activeTab === 'add' && !tokenAmount) || isProcessing || !exchangeAddress || !userAddress}
        className={cn(
          "w-full btn-primary flex items-center justify-center space-x-2 py-3 text-lg font-semibold",
          (!ethAmount || (activeTab === 'add' && !tokenAmount) || isProcessing || !exchangeAddress || !userAddress) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{activeTab === 'add' ? 'Adding...' : 'Removing...'}</span>
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
            {activeTab === 'add' ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
            <span>{activeTab === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}</span>
          </>
        )}
      </button>

      {/* Your Positions - Compact */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Your Positions</span>
        </h3>
        <div className="space-y-2">
          <div className="p-3 bg-secondary-800 rounded-lg border border-secondary-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-medium">{ethToken.symbol}/{token1.symbol}</span>
              <span className="text-green-400 text-sm">+$125.50</span>
            </div>
            <div className="flex justify-between text-sm text-secondary-400">
              <span>0.5 LP tokens</span>
              <span>0.01% of pool</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 