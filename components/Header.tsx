'use client'

import { useState, useEffect } from 'react'
import { Wallet, Menu, X } from 'lucide-react'
import { cn, formatAddress } from '@/lib/utils'
import { connectWallet, getBalance } from '@/lib/web3'

export default function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          updateBalance(accounts[0])
        }
      })
    }
  }, [])

  const updateBalance = async (addr: string) => {
    try {
      const ethBalance = await getBalance(addr)
      setBalance(parseFloat(ethBalance).toFixed(4))
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const account = await connectWallet()
      setAddress(account)
      setIsConnected(true)
      updateBalance(account)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const navigation = [
    { name: 'Create Exchange', href: '/create' },
    { name: 'Liquidity', href: '/liquidity' },
    { name: 'Swap', href: '/swap' },
  ]

  return (
    <header className="bg-secondary-900 border-b border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">defi dex</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-secondary-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2 bg-secondary-800 px-4 py-2 rounded-lg">
                <Wallet className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-white">{formatAddress(address)}</span>
                <span className="text-xs text-secondary-400">({balance} ETH)</span>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className={cn(
                  "btn-primary flex items-center space-x-2",
                  isConnecting && "opacity-50 cursor-not-allowed"
                )}
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-secondary-400 hover:text-white hover:bg-secondary-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-secondary-800">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-secondary-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 