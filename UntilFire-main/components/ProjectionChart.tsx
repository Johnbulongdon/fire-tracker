'use client'

import { 
  ComposedChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface ProjectionChartProps {
  planId?: string
  currentStash: number
  monthlyInvest: number
  fireNumber: number
  expectedReturn: number
  currentAge: number
}

export default function ProjectionChart({ 
  planId,
  currentStash, 
  monthlyInvest, 
  fireNumber, 
  expectedReturn,
  currentAge
}: ProjectionChartProps) {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      if (!planId) return
      const { data, error } = await supabase
        .from('stash_history')
        .select('*')
        .eq('plan_id', planId)
        .order('logged_date', { ascending: true })

      if (!error && data) {
        setHistory(data)
      }
    }

    fetchHistory()
  }, [planId])

  const generateData = () => {
    const data = []
    let stash = currentStash
    const annualReturn = expectedReturn / 100
    const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1
    
    for (let year = 0; year <= 40; year++) {
      data.push({
        age: currentAge + year,
        wealth: Math.round(stash),
        target: fireNumber
      })
      
      if (stash > fireNumber * 2) break;

      for (let month = 0; month < 12; month++) {
        stash = (stash + monthlyInvest) * (1 + monthlyReturn)
      }
    }
    return data
  }

  const chartData = generateData()
  
  const mergedData = chartData.map(d => {
    const historicalPoint = history.find(h => {
      const loggedDate = new Date(h.logged_date)
      const now = new Date()
      const ageAtLog = currentAge + (loggedDate.getFullYear() - now.getFullYear())
      return ageAtLog === d.age
    })
    return {
      ...d,
      actual: historicalPoint ? Number(historicalPoint.stash_amount) : null
    }
  })

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-blue-500">📊</span>
        Wealth Projection vs Reality
      </h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mergedData}>
            <defs>
              <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="age" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => value ? [`$${Number(value).toLocaleString()}`, 'Wealth'] : ['', '']}
              labelFormatter={(label) => `Age ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="wealth" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWealth)" 
              name="Projected"
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#10b981" 
              strokeWidth={4}
              dot={{ r: 6, fill: '#10b981' }}
              connectNulls
              name="Actual Progress"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              dot={false}
              strokeWidth={1}
              name="Target"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Projected Wealth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span>Actual Stash</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 border-t-2 border-dashed border-red-500"></div>
          <span>FIRE Target</span>
        </div>
      </div>
    </div>
  )
}
