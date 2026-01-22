import ProgressCircle from '../../components/ProgressCircle'  // Changed from @/
import PlanList from '../../components/PlanList'              // Changed from @/
import QuickAddButton from '../../components/QuickAddButton'  // Changed from @/
import { TrendingUp, Target, BarChart, Rocket } from 'lucide-react'

export default function DashboardPage() {
  // Example data - you'll replace with real data from Supabase
  const sampleData = {
    percentage: 42.5,
    fireNumber: 900000,
    currentStash: 382500,
    monthlyInvest: 1000,
    yearsToFIRE: 8.3
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            🔥 Your FIRE Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your journey to Financial Independence
          </p>
        </header>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">FIRE Number</div>
                <div className="text-xl font-bold text-gray-800">
                  ${sampleData.fireNumber.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Savings</div>
                <div className="text-xl font-bold text-gray-800">
                  ${sampleData.currentStash.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BarChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Monthly Invest</div>
                <div className="text-xl font-bold text-gray-800">
                  ${sampleData.monthlyInvest.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Rocket className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Years to FIRE</div>
                <div className="text-xl font-bold text-gray-800">
                  {sampleData.yearsToFIRE}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Progress Visualization */}
          <div className="lg:col-span-1">
            <ProgressCircle 
              percentage={sampleData.percentage}
              fireNumber={sampleData.fireNumber}
              currentStash={sampleData.currentStash}
            />
            
            <div className="mt-8">
              <QuickAddButton currentStash={sampleData.currentStash} />
            </div>

            {/* Quick Tips */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-gray-800 mb-3">💡 FIRE Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Increase savings rate by 1% each month
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Invest in low-cost index funds
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Track every expense for 30 days
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Review your plan quarterly
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Plan List */}
          <div className="lg:col-span-2">
            <PlanList />
            
            {/* Affiliate Section (Future Revenue) */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                ⚡ Boost Your FIRE Journey
              </h3>
              <p className="text-gray-600 mb-4">
                These tools can help you reach FIRE faster:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <a 
                  href="https://your-affiliate-link.com/ref=123" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors hover:shadow-md"
                >
                  <div className="font-bold text-gray-800 mb-1">High-Yield Savings (4.5% APY)</div>
                  <div className="text-sm text-gray-600">Get $100 bonus with $10,000 deposit</div>
                </a>
                <a 
                  href="https://brokerage-affiliate.com/ref=456" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors hover:shadow-md"
                >
                  <div className="font-bold text-gray-800 mb-1">Zero-Fee Investing</div>
                  <div className="text-sm text-gray-600">Free stocks when you sign up</div>
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                💰 These are affiliate links. We may earn a commission at no extra cost to you.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>🔥 Your FIRE journey is {sampleData.percentage}% complete. Keep going!</p>
          <p className="mt-1">Next milestone: ${Math.round(sampleData.fireNumber * 0.5).toLocaleString()}</p>
        </footer>
      </div>
    </div>
  )
}