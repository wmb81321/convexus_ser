export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <div className="absolute inset-0 w-20 h-20 border-2 border-primary/10 rounded-full mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Convexo Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Loading your smart wallet...
        </p>
      </div>
    </div>
  )
}
