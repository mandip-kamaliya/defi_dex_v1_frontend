import Header from '@/components/Header'
import CreateExchangeCard from '@/components/CreateExchangeCard'

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Create <span className="gradient-text">Exchange</span>
            </h1>
            <p className="text-secondary-400 text-lg">
              Create new trading pairs and provide initial liquidity
            </p>
          </div>
          <CreateExchangeCard />
        </div>
      </main>
    </div>
  )
} 