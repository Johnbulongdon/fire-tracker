'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Calendar, TrendingUp, Target, Edit } from 'lucide-react'

interface Plan {
  id: string
  plan_name: string
  current_age: number
  monthly_income: number
  monthly_invest: number
  monthly_spend: number
  current_stash: number
  fire_number: number
  created_at: string
}

export default function PlanList() {
  // 1. ALL HOOKS FIRST
  const [isClient, setIsClient] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient(
    'https://boqzhdfdetixnwnohtho.supabase.co',
    'sb_publishable_uXt2OykfORDHF6XHwNwsSQ_pvPd5HTP'
  )

  // 2. DEFINE fetchPlans BEFORE useEffect
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  // 3. useEffect (can now use fetchPlans)
  useEffect(() => {
    setIsClient(true)
    fetchPlans()
  }, [])

  // 4. Client check
  if (!isClient) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-2xl">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">No saved plans yet</h3>
        <p className="text-gray-500 mt-2">Create your first FIRE plan in the calculator!</p>
        <button
          onClick={fetchPlans}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Your FIRE Plans</h2>
        <button 
          onClick={fetchPlans}
          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-lg"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {plans.map((plan) => {
          const progress = calculateProgress(plan.current_stash, plan.fire_number)
          const yearsToRetire = Math.max(0, 
            Math.log(
              (plan.fire_number - plan.current_stash) / (plan.monthly_invest * 12) / 0.07 + 1
            ) / Math.log(1 + 0.07)
          )
          
          return (
            <div 
              key={plan.id} 
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{plan.plan_name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Age {plan.current_age}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Monthly Income</div>
                  <div className="font-bold text-gray-800">${plan.monthly_income.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Monthly Invest</div>
                  <div className="font-bold text-green-600">${plan.monthly_invest.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Current Savings</div>
                  <div className="font-bold text-purple-600">${plan.current_stash.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Years to FIRE</div>
                  <div className="font-bold text-orange-600">{yearsToRetire.toFixed(1)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress to ${plan.fire_number.toLocaleString()}</span>
                  <span className="font-bold">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  <Edit className="inline w-4 h-4 mr-1" />
                  Edit
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm">
                  View Details →
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}