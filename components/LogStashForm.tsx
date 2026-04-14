'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { DollarSign, Save, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface LogStashFormProps {
  planId: string
  currentStash: number
  onSuccess?: () => void
}

export default function LogStashForm({ planId, currentStash, onSuccess }: LogStashFormProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(currentStash)
  const [isSaving, setIsSaving] = useState(false)

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !planId) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('stash_history')
        .insert([{
          user_id: user.id,
          plan_id: planId,
          stash_amount: amount,
          logged_date: new Date().toISOString().split('T')[0]
        }])

      if (error) throw error

      const { error: updateError } = await supabase
        .from('user_plans')
        .update({ current_stash: amount })
        .eq('id', planId)

      if (updateError) throw updateError

      toast.success('Stash logged successfully!')
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error('Error logging stash:', error)
      toast.error(`Failed to log stash: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-500" />
        Log Current Stash
      </h3>
      <form onSubmit={handleLog} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Total Savings
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Update Stash
        </button>
      </form>
    </div>
  )
}
