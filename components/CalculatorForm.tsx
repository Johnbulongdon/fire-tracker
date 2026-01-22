'use client'

import { useState, useEffect } from 'react'
import { Calculator, Target, Calendar, TrendingUp, Save, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export default function CalculatorForm() {
  // 1. ALL HOOKS FIRST (in same order)
  const [isClient, setIsClient] = useState(false)
  const [inputs, setInputs] = useState({
    age: 30,
    income: 5000,
    invest: 1000,
    spend: 3000,
    stash: 50000
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  const supabase = createClient(
    'https://boqzhdfdetixnwnohtho.supabase.co',
    'sb_publishable_uXt2OykfORDHF6XHwNwsSQ_pvPd5HTP'
  )

  // 2. useEffect (runs once on mount)
  useEffect(() => {
    setIsClient(true)
    
    console.log('🔧 CalculatorForm mounted')
    console.log('Supabase client created:', !!supabase)
    
    supabase.from('user_plans').select('count', { head: true })
      .then(result => {
        if (result.error?.code === 'PGRST116') {
          console.log('ℹ️ Supabase connected! Table "user_plans" not found')
        } else if (result.error) {
          console.log('❌ Supabase error:', result.error.message)
        } else {
          console.log('✅ Supabase connected and table exists!')
        }
      })
  }, [])

  // 3. Client check AFTER all hooks
  if (!isClient) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 4. Component logic
  const handleChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }))
  }

  const fireNumber = inputs.spend * 12 * 25
  const yearsToFIRE = Math.max(0, Math.log((fireNumber - inputs.stash) / (inputs.invest * 12) / 0.07 + 1) / Math.log(1 + 0.07))
  const retirementAge = inputs.age + Math.max(0, yearsToFIRE)
  const progressPercent = Math.min((inputs.stash / fireNumber) * 100, 100)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('Saving your plan...')
    
    try {
      console.log('📝 Saving plan to Supabase...')
      
      const planData = {
        plan_name: 'My FIRE Plan',
        current_age: inputs.age,
        monthly_income: inputs.income,
        monthly_invest: inputs.invest,
        monthly_spend: inputs.spend,
        current_stash: inputs.stash,
        fire_number: fireNumber,
        expected_return: 7.0,
        withdrawal_rate: 4.0
      }
      
      console.log('Plan data:', planData)
      
      const { data, error } = await supabase
        .from('user_plans')
        .insert([planData])
        .select()
      
      if (error) {
        console.error('❌ Save error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        let errorMsg = 'Save failed'
        if (error.message) errorMsg += `: ${error.message}`
        if (error.hint) errorMsg += ` (${error.hint})`
        
        setSaveMessage(errorMsg)
      } else {
        console.log('✅ Save successful!', data)
        setSaveMessage(`✅ Plan saved! ID: ${data[0].id.slice(0, 8)}...`)
        setTimeout(() => setSaveMessage(''), 5000)
      }
    } catch (err: any) {
      console.error('❌ Save exception:', err)
      setSaveMessage(`Save error: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // 5. JSX
  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">FIRE Calculator</h2>
        <p className="text-gray-600 mt-2">Adjust the sliders to see your financial future</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            { label: 'Current Age', field: 'age', icon: '👤', min: 20, max: 70, step: 1 },
            { label: 'Monthly Income ($)', field: 'income', icon: '💰', min: 1000, max: 50000, step: 100 },
            { label: 'Monthly Investment ($)', field: 'invest', icon: '📈', min: 0, max: 10000, step: 100 },
            { label: 'Monthly Spending ($)', field: 'spend', icon: '💸', min: 1000, max: 20000, step: 100 },
            { label: 'Current Savings ($)', field: 'stash', icon: '🏦', min: 0, max: 1000000, step: 1000 },
          ].map(({ label, field, icon, min, max, step }) => (
            <div key={field} className="space-y-3">
              <div className="flex justify-between">
                <label className="font-medium text-gray-700">
                  <span className="mr-2">{icon}</span>
                  {label}
                </label>
                <span className="font-bold text-blue-600">
                  ${inputs[field as keyof typeof inputs].toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={inputs[field as keyof typeof inputs]}
                onChange={(e) => handleChange(field as keyof typeof inputs, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>${min.toLocaleString()}</span>
                <span>${max.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">FIRE Number</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${fireNumber.toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm">
              Amount needed to retire (25× annual expenses)
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Time to FIRE</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {yearsToFIRE.toFixed(1)} years
            </div>
            <p className="text-gray-600 text-sm">
              You can retire at age <span className="font-semibold">{retirementAge.toFixed(1)}</span>
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-100 p-6 rounded-2xl border border-purple-200">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Current: ${inputs.stash.toLocaleString()}</span>
                <span>Target: ${fireNumber.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {progressPercent.toFixed(1)}%
            </div>
            <p className="text-gray-600 text-sm">of the way to FIRE!</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  💾 Save My FIRE Plan
                </>
              )}
            </button>
            
            {saveMessage && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                saveMessage.includes('✅') || saveMessage.includes('saved')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                {saveMessage.includes('✅') ? (
                  <span className="text-lg">✅</span>
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm">{saveMessage}</span>
              </div>
            )}
            
            <div className="text-xs text-gray-500 text-center">
              Click "Save" to store your plan in the database. 
              {saveMessage.includes('Table not found') && (
                <div className="mt-1">
                  Go to Supabase → Table Editor → Create "user_plans" table
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}