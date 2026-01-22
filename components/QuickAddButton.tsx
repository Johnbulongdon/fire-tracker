'use client'

import { useState, useEffect } from 'react'
import { Plus, Check } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface QuickAddButtonProps {
  currentStash: number
}

export default function QuickAddButton({ currentStash }: QuickAddButtonProps) {
  // 1. ALL HOOKS FIRST (same order every render)
  const [isClient, setIsClient] = useState(false)
  const [amount, setAmount] = useState('500')
  const [isAdding, setIsAdding] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient(
    'https://boqzhdfdetixnwnohtho.supabase.co',
    'sb_publishable_uXt2OykfORDHF6XHwNwsSQ_pvPd5HTP'
  )

  // 2. useEffect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 3. Client check AFTER all hooks
  if (!isClient) {
    return <div className="p-4 text-center">Loading...</div>
  }

  // 4. Rest of your component logic
  const handleAdd = async () => {
    setIsAdding(true)
    try {
      // In a real app, you'd update the specific plan
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      console.log(`Added $${amount} to savings`)
    } catch (error) {
      console.error('Error adding savings:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // 5. JSX
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200">
      <h3 className="font-bold text-gray-800 mb-4">Quick Add Savings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current:</span>
          <span className="font-bold text-gray-800">${currentStash.toLocaleString()}</span>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-2">Add amount:</label>
          <div className="flex gap-2">
            {['100', '500', '1000', '5000'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`flex-1 py-2 text-center rounded-lg border ${
                  amount === value
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                }`}
              >
                ${value}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Custom amount"
            min="1"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding || success}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${
              success
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90'
            } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAdding ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : success ? (
              <>
                <Check className="w-5 h-5" />
                Added!
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Savings
              </>
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          This will update your most recent FIRE plan
        </div>
      </div>
    </div>
  )
}