'use client'

import ProgressCircle from '@/components/ProgressCircle'
import PlanList from '@/components/PlanList'
import QuickAddButton from '@/components/QuickAddButton'
import ProjectionChart from '@/components/ProjectionChart'
import LogStashForm from '@/components/LogStashForm'
import CalculatorForm from '@/components/CalculatorForm'
import { TrendingUp, Target, BarChart, Rocket, LogOut, User, RefreshCw, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [latestPlan, setLatestPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<any>(null)

  const fetchLatestPlan = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching plan:', error)
        }
        setLatestPlan(null)
      } else {
        setLatestPlan(data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestPlan()
  }, [user])

  const calculateStats = () => {
    if (!latestPlan) return {
      percentage: 0,
      fireNumber: 0,
      currentStash: 0,
      monthlyInvest: 0,
      yearsToFIRE: 0
    }

    const percentage = Math.min((latestPlan.current_stash / latestPlan.fire_number) * 100, 100)
    const yearsToFIRE = Math.max(0, 
      Math.log(
        (latestPlan.fire_number - latestPlan.current_stash) / (latestPlan.monthly_invest * 12) / 0.07 + 1
      ) / Math.log(1 + 0.07)
    )

    return {
      percentage,
      fireNumber: latestPlan.fire_number,
      currentStash: latestPlan.current_stash,
      monthlyInvest: latestPlan.monthly_invest,
      yearsToFIRE: parseFloat(yearsToFIRE.toFixed(1))
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your FIRE journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              🔥 Your FIRE Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Track your journey to Financial Independence
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchLatestPlan}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-2 text-sm text-gray-600 shadow-sm">
              <User className="w-4 h-4 text-blue-500" />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-md shadow-red-100"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        {!latestPlan ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-blue-100 text-center">
            <Target className="w-16 h-16 text-blue-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">Ready to start your journey?</h2>
            <p className="text-gray-600 mt-4 max-w-md mx-auto">
              You haven't saved any FIRE plans yet. Head over to the calculator on the home page to create your first projection!
            </p>
            <a 
              href="/"
              className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
            >
              Go to Calculator
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">FIRE Number</div>
                    <div className="text-xl font-bold text-gray-800">
                      ${stats.fireNumber.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Savings</div>
                    <div className="text-xl font-bold text-gray-800">
                      ${stats.currentStash.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Invest</div>
                    <div className="text-xl font-bold text-gray-800">
                      ${stats.monthlyInvest.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Years to FIRE</div>
                    <div className="text-xl font-bold text-gray-800">
                      {stats.yearsToFIRE}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <ProgressCircle 
                  percentage={stats.percentage}
                  fireNumber={stats.fireNumber}
                  currentStash={stats.currentStash}
                  planName={latestPlan.plan_name}
                />
                
                <LogStashForm 
                  planId={latestPlan.id} 
                  currentStash={stats.currentStash} 
                  onSuccess={fetchLatestPlan} 
                />
                
                <QuickAddButton 
                  currentStash={stats.currentStash} 
                  planId={latestPlan.id}
                  onUpdate={fetchLatestPlan}
                />
              </div>

              <div className="lg:col-span-2 space-y-8">
                {/* Temporarily hidden to debug build failure */}
                {/* <ProjectionChart 
                  planId={latestPlan.id}
                  currentStash={latestPlan.current_stash}
                  monthlyInvest={latestPlan.monthly_invest}
                  fireNumber={latestPlan.fire_number}
                  expectedReturn={latestPlan.expected_return || 7}
                  currentAge={latestPlan.current_age}
                /> */}
                
                <PlanList onEdit={(plan) => setEditingPlan(plan)} />
              </div>
            </div>
          </>
        )}

        {editingPlan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button 
                onClick={() => setEditingPlan(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
              <CalculatorForm 
                initialData={editingPlan} 
                onSave={() => {
                  setEditingPlan(null)
                  fetchLatestPlan()
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
