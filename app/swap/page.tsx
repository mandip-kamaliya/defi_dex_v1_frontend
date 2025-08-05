import Header from '@/components/Header'
import SwapCard from '@/components/SwapCard'

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Swap <span className="gradient-text">Tokens</span>
            </h1>
            <p className="text-secondary-400 text-lg">
              Exchange tokens instantly with minimal slippage
            </p>
          </div>
          <SwapCard />
        </div>
      </main>
    </div>
  )
} 