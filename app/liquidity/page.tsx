import Header from '@/components/Header'
import LiquidityCard from '@/components/LiquidityCard'

export default function LiquidityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Manage <span className="gradient-text">Liquidity</span>
            </h1>
            <p className="text-secondary-400 text-lg">
              Add or remove liquidity to earn trading fees
            </p>
          </div>
          <LiquidityCard />
        </div>
      </main>
    </div>
  )
} 