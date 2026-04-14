'use client'

interface ProgressCircleProps {
  percentage: number
  fireNumber: number
  currentStash: number
  planName?: string
}

export default function ProgressCircle({ percentage, fireNumber, currentStash, planName }: ProgressCircleProps) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-xl border border-blue-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex flex-col items-center">
        <span>FIRE Progress</span>
        {planName && <span className="text-sm font-medium text-blue-600 mt-1">{planName}</span>}
      </h3>
      
      <div className="relative w-64 h-64">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="16"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-800">{percentage.toFixed(1)}%</div>
          <div className="text-gray-600 mt-2">to FIRE</div>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-4 w-full">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current:</span>
          <span className="font-bold text-green-600">${currentStash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Target:</span>
          <span className="font-bold text-blue-600">${fireNumber.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
