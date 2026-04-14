'use client'

import { useState, useEffect } from 'react'
import { Plus, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface QuickAddButtonProps {
  currentStash: number
  planId: string
  onUpdate: () => void
}

export default function QuickAddButton({ currentStash, planId, onUpdate }: QuickAddButtonProps) {
  const [isClient, setIsClient] = useState(false)
  const [amount, setAmount] = useState('500')
  const [isAdding, setIsAdding] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const handleAdd = async () => {
    if (!planId) return

    setIsAdding(true)
    try {
      const addAmount = parseInt(amount) || 0
      const newStash = currentStash + addAmount

      const { error } = await supabase
        .from('user_plans')
        .update({ current_stash: newStash })
        .eq('id', planId)

      if (error) throw error
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('stash_history')
          .insert([{
            user_id: user.id,
            plan_id: planId,
            stash_amount: newStash,
            logged_date: new Date().toISOString().split('T')[0]
          }])
      }

      setSuccess(true)
      toast.success(`Successfully added $${addAmount.toLocaleString()} to your savings!`)
      onUpdate()
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding savings:', error)
      toast.error('Failed to update savings')
    } finally {
      setIsAdding(false)
    }
  }

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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
