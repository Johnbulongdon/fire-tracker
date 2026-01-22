import CalculatorForm from '../components/CalculatorForm'
import { Sparkles, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link' // ← ADD THIS IMPORT

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section - keep as is */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calculate Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Financial Freedom</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how soon you can retire with our FIRE (Financial Independence, Retire Early) calculator.
            No signup required to start.
          </p>
        </div>
      </div>

      {/* Calculator Section - keep as is */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <CalculatorForm />
        </div>
      </div>

      {/* Features Section - keep as is */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex p-3 bg-blue-100 rounded-xl mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Secure</h3>
            <p className="text-gray-600">
              Your financial data stays in your browser. We only store data if you create an account.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex p-3 bg-green-100 rounded-xl mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Projections</h3>
            <p className="text-gray-600">
              Get customized calculations based on your income, spending, and investment strategy.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Actionable Insights</h3>
            <p className="text-gray-600">
              Learn how small changes can accelerate your journey to financial independence.
            </p>
          </div>
        </div>
      </div>

      {/* Footer - ADD THE LINK HERE */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 mb-4">
            🔥 Built for the FIRE community • Your journey to financial freedom starts here
          </p>
          {/* ADD THIS LINK */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            📊 View Your Dashboard →
          </Link>
        </div>
      </footer>
    </div>
  )
}