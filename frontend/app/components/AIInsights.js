export default function AIInsights({ insights }) {
  if (!insights) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">AI Insights</h3>
      
      {insights.quote && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-700">Reflective Quote:</h4>
          <p className="italic text-gray-600">{insights.quote}</p>
        </div>
      )}
      
      {insights.mentalHealthTip && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-700">Mental Health Tip:</h4>
          <p className="text-gray-600">{insights.mentalHealthTip}</p>
        </div>
      )}
      
      {insights.productivityHack && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-700">Productivity Hack:</h4>
          <p className="text-gray-600">{insights.productivityHack}</p>
        </div>
      )}
    </div>
  );
} 