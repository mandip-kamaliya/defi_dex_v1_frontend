'use client'

import { useState } from 'react'
import { Plus, Settings, Factory, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  COMMON_TOKENS, 
  Token, 
  createExchange, 
  getExchange
} from '@/lib/web3'

interface CreateExchangeCardProps {
  className?: string
}

export default function CreateExchangeCard({ className }: CreateExchangeCardProps) {
  const [ethToken] = useState<Token>(COMMON_TOKENS[0]) // ETH is always fixed
  const [token1, setToken1] = useState<Token>(COMMON_TOKENS[1])
  const [initialEthAmount, setInitialEthAmount] = useState('')
  const [initialTokenAmount, setInitialTokenAmount] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [exchangeAddress, setExchangeAddress] = useState('')
  const [showTokenSelector, setShowTokenSelector] = useState(false)

  const handleCreateExchange = async () => {
    if (!initialEthAmount || !initialTokenAmount) return
    
    setIsCreating(true)
    try {
      // Create exchange for the ERC20 token (not ETH) using user's createNewExchange function
      console.log('Creating exchange for token:', token1.symbol)
      const tx = await createExchange(token1.address)
      
      console.log('Exchange created! Transaction:', tx)
      
      // Get the exchange address
      const exchangeAddr = await getExchange(token1.address)
      setExchangeAddress(exchangeAddr)
      
      setInitialEthAmount('')
      setInitialTokenAmount('')
      
      alert(`Exchange created successfully! Address: ${exchangeAddr}`)
      
    } catch (error) {
      console.error('Create exchange failed:', error)
      alert('Failed to create exchange. Please check your wallet and try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const checkExistingExchange = async (tokenAddress: string) => {
    try {
      const exchangeAddr = await getExchange(tokenAddress)
      if (exchangeAddr !== '0x0000000000000000000000000000000000000000') {
        setExchangeAddress(exchangeAddr)
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking exchange:', error)
      return false
    }
  }

  const handleTokenSelect = async (token: Token) => {
    if (token.symbol === 'ETH') return // Can't create ETH/ETH exchange
    
    setToken1(token)
    setShowTokenSelector(false)
    
    // Check if exchange already exists for this token
    const exists = await checkExistingExchange(token.address)
    if (exists) {
      alert(`Exchange already exists for ${token.symbol}!`)
    } else {
      setExchangeAddress('') // Clear previous exchange address
    }
  }

  // Filter out ETH from available tokens for selection
  const availableTokens = COMMON_TOKENS.filter(token => token.symbol !== 'ETH')

  return (
    <div className={cn("card max-w-md mx-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Create Exchange</h2>
        <button className="p-2 text-secondary-400 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Exchange Pair */}
      <div className="space-y-3 mb-4">
        <div className="space-y-2">
          <label className="text-sm text-secondary-400">Token Pair</label>
          <div className="relative">
            <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
              <div className="flex-1">
                <span className="text-white font-medium">{ethToken.symbol}/{token1.symbol}</span>
                <p className="text-xs text-secondary-400">{ethToken.name} + {token1.name}</p>
              </div>
              <button 
                onClick={() => setShowTokenSelector(!showTokenSelector)}
                className="flex items-center space-x-2 bg-secondary-700 hover:bg-secondary-600 px-3 py-1 rounded-lg transition-colors"
              >
                <span className="text-white font-medium">{token1.symbol}</span>
                <ChevronDown className={cn("h-4 w-4 text-secondary-400 transition-transform", showTokenSelector && "rotate-180")} />
              </button>
            </div>
            
            {/* Token Selector Dropdown */}
            {showTokenSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-secondary-800 border border-secondary-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                {availableTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 hover:bg-secondary-700 transition-colors text-left",
                      token1.address === token.address && "bg-secondary-700"
                    )}
                  >
                    <div className="flex-1">
                      <span className="text-white font-medium">{token.symbol}</span>
                      <p className="text-xs text-secondary-400">{token.name}</p>
                    </div>
                    {token1.address === token.address && (
                      <span className="text-primary-500 text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Initial Liquidity */}
      <div className="space-y-3 mb-4">
        <h3 className="text-lg font-semibold text-white">Initial Liquidity</h3>
        
        <div className="space-y-2">
          <label className="text-sm text-secondary-400">{ethToken.symbol} Amount</label>
          <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
            <input
              type="number"
              value={initialEthAmount}
              onChange={(e) => setInitialEthAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
            />
            <span className="text-secondary-400 font-medium">{ethToken.symbol}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-secondary-400">{token1.symbol} Amount</label>
          <div className="flex items-center space-x-3 p-3 bg-secondary-800 rounded-lg border border-secondary-700">
            <input
              type="number"
              value={initialTokenAmount}
              onChange={(e) => setInitialTokenAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-lg font-medium outline-none"
            />
            <span className="text-secondary-400 font-medium">{token1.symbol}</span>
          </div>
        </div>
      </div>

      {/* Exchange Details - Compact */}
      <div className="space-y-2 mb-4 p-3 bg-secondary-800 rounded-lg text-sm">
        <div className="flex justify-between">
          <span className="text-secondary-400">Exchange Rate</span>
          <span className="text-white font-medium">1 {ethToken.symbol} = 1.5 {token1.symbol}</span>
        </div>
        {exchangeAddress && (
          <div className="flex justify-between">
            <span className="text-secondary-400">Exchange Address</span>
            <span className="text-white font-medium text-xs">{exchangeAddress.slice(0, 6)}...{exchangeAddress.slice(-4)}</span>
          </div>
        )}
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreateExchange}
        disabled={!initialEthAmount || !initialTokenAmount || isCreating}
        className={cn(
          "w-full btn-primary flex items-center justify-center space-x-2 py-3 text-lg font-semibold",
          (!initialEthAmount || !initialTokenAmount || isCreating) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Creating Exchange...</span>
          </>
        ) : (
          <>
            <Factory className="h-5 w-5" />
            <span>Create Exchange</span>
          </>
        )}
      </button>

      {/* Recent Exchanges - Compact */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Recent Exchanges</h3>
        <div className="space-y-2">
          <div className="p-3 bg-secondary-800 rounded-lg border border-secondary-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-medium">ETH/USDC</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <div className="flex justify-between text-sm text-secondary-400">
              <span>Created 2 hours ago</span>
              <span>$1.2M volume</span>
            </div>
          </div>
          <div className="p-3 bg-secondary-800 rounded-lg border border-secondary-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-medium">ETH/USDT</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <div className="flex justify-between text-sm text-secondary-400">
              <span>Created 1 day ago</span>
              <span>$850K volume</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 