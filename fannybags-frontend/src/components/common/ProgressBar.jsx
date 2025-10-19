export default function ProgressBar({ 
  raised = 0, 
  target = 1, 
  percentage 
}) {
  // Calculate percentage if not provided
  const calculatedPercentage = percentage !== undefined 
    ? percentage 
    : (raised / target) * 100;
  
  // Ensure percentage is between 0 and 100
  const displayPercentage = Math.min(Math.max(calculatedPercentage, 0), 100);

  return (
    <div className="w-full">
      {/* Funding amounts */}
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-white">₹{Math.round(raised).toLocaleString()}</span>
        <span className="text-gray-400">₹{Math.round(target).toLocaleString()}</span>
      </div>
      
      {/* Progress bar container */}
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        {/* Filled portion */}
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${displayPercentage}%`,
            background: 'linear-gradient(to right, #10b981, #FF48B9)',
          }}
        ></div>
      </div>
      
      {/* Percentage text */}
      <div className="text-right text-xs text-gray-400 mt-1">
        {displayPercentage.toFixed(1)}% funded
      </div>
    </div>
  );
}