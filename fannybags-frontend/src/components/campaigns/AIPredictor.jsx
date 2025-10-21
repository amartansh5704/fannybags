import { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import { useEffect } from 'react';

export default function AIPredictor({revenueSharePct = 40,}) {
  const [formData, setFormData] = useState({
    genre: 'dhh',
    marketing_budget: 10000,
    video_budget: 10000,
    artist_followers: 20000,
    campaign_duration: 3,
    viral_factor: 'medium',
    revenue_share_pct: revenueSharePct
  });

  // Keep revenue share in sync with campaign prop
useEffect(() => {
  setFormData(prev => ({ 
    ...prev, 
    revenue_share_pct: revenueSharePct 
  }));
}, [revenueSharePct]);
  
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await campaignService.predictRevenue(formData);
      if (result.success) {
        setPrediction(result);
      }
    } catch (err) {
      setError('Prediction failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['genre', 'viral_factor'].includes(name) ? value : parseFloat(value) || 0
    }));
  };

  // Calculate investor returns based on investment amount
  const calculateInvestorReturns = () => {
    if (!prediction) return null;
    
    const campaignTotal = prediction.investment.total;
    const ownershipPercentage = (investmentAmount / campaignTotal) * 100;
    
    return {
      ownership: ownershipPercentage,
      returns_3m: (prediction.investor_returns.investor_share_3m * ownershipPercentage) / 100,
      returns_6m: (prediction.investor_returns.investor_share_6m * ownershipPercentage) / 100,
      returns_12m: (prediction.investor_returns.investor_share_12m * ownershipPercentage) / 100,
      roi: ((prediction.investor_returns.investor_share_3m * ownershipPercentage / 100) - investmentAmount) / investmentAmount * 100
    };
  };

  const investorReturns = calculateInvestorReturns();

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>🤖</span> AI Revenue Predictor
        <span className="text-sm font-normal text-gray-400 ml-2">(Conservative Estimates)</span>
      </h3>

      <form onSubmit={handlePredict} className="space-y-4 mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full p-3 bg-fb-dark border border-gray-700 rounded text-white"
            >
              <option value="dhh">DHH/Hip-Hop</option>
              <option value="indie pop">Indie Pop</option>
              <option value="pop">Pop</option>
              <option value="indie">Indie</option>
              <option value="bollywood">Bollywood</option>
              <option value="punjabi">Punjabi</option>
              <option value="electronic">Electronic</option>
              <option value="rock">Rock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total Artist Following</label>
            <input
              type="number"
              name="artist_followers"
              value={formData.artist_followers}
              onChange={handleChange}
              className="w-full p-3 bg-fb-dark border border-gray-700 rounded text-white"
              min="0"
              placeholder="Spotify + Instagram + YouTube"
            />
            <p className="text-xs text-gray-500 mt-1">Combined social media following</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fatega Factor 💥</label>
            <select
            name="viral_factor"
            value={formData.viral_factor}
            onChange={handleChange}
            className="w-full p-3 bg-fb-dark border border-gray-700 rounded text-white"
            >
                <option value="low">❄️ Thanda (Niche Appeal)</option>
                <option value="medium">🔥 Garam (Good Hook)</option>
                <option value="high">🔥🔥 Aag (Very Catchy)</option>
                <option value="viral">💥💥💥 FATEGA! (Viral Bomb)</option>
                </select>
                </div>

          <div>
            <label className="block text-sm font-medium mb-2">Marketing Budget (₹)</label>
            <input
              type="number"
              name="marketing_budget"
              value={formData.marketing_budget}
              onChange={handleChange}
              className="w-full p-3 bg-fb-dark border border-gray-700 rounded text-white"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video Budget (₹)</label>
            <input
              type="number"
              name="video_budget"
              value={formData.video_budget}
              onChange={handleChange}
              className="w-full p-3 bg-fb-dark border border-gray-700 rounded text-white"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Campaign Duration</label>
            <select
              name="campaign_duration"
              value={formData.campaign_duration}
              onChange={handleChange}
              className="w-full p-3 bg-fb-dark border border-gray-700 rounded text-white"
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? '🧠 Analyzing Market Data...' : '🚀 Predict Revenue'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      {prediction && (
        <div className="space-y-6 animate-fadeIn">
          {/* Confidence Score */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-lg border border-blue-500/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">AI Confidence Score</span>
              <span className="text-2xl font-bold text-blue-400">
                {prediction.prediction.confidence_score}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${prediction.prediction.confidence_score}%` }}
              ></div>
            </div>
          </div>

          {/* Stream Projections */}
          <div className="bg-fb-dark p-4 rounded-lg border border-purple-500/30">
            <p className="text-xs text-gray-400 mb-1">Total Streams/Views (3 Months)</p>
            <p className="text-3xl font-bold text-purple-400">
              {prediction.prediction.total_streams_3m.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Across all platforms
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-fb-dark p-4 rounded-lg border border-green-500/30">
              <p className="text-xs text-gray-400 mb-1">3-Month Revenue</p>
              <p className="text-xl font-bold text-green-400">
                ₹{prediction.prediction.gross_revenue_3m.toLocaleString()}
              </p>
            </div>

            <div className="bg-fb-dark p-4 rounded-lg border border-blue-500/30">
              <p className="text-xs text-gray-400 mb-1">6-Month Revenue</p>
              <p className="text-xl font-bold text-blue-400">
                ₹{prediction.prediction.gross_revenue_6m.toLocaleString()}
              </p>
            </div>

            <div className="bg-fb-dark p-4 rounded-lg border border-purple-500/30">
              <p className="text-xs text-gray-400 mb-1">12-Month Revenue</p>
              <p className="text-xl font-bold text-purple-400">
                ₹{prediction.prediction.gross_revenue_12m.toLocaleString()}
              </p>
            </div>

            <div className={`bg-fb-dark p-4 rounded-lg border ${prediction.prediction.roi_percentage > 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <p className="text-xs text-gray-400 mb-1">ROI</p>
              <p className={`text-xl font-bold ${prediction.prediction.roi_percentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {prediction.prediction.roi_percentage > 0 ? '+' : ''}{prediction.prediction.roi_percentage.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-fb-dark p-6 rounded-lg">
            <h4 className="font-bold mb-4">📊 Revenue Breakdown (3 Months)</h4>
  
            <div className="space-y-3 mb-6">
        {/* YouTube - Most popular */}
        <div className="flex justify-between items-center">
        <span className="text-sm">📺 YouTube ({prediction.breakdown.streaming.youtube.views.toLocaleString()} views)</span>
        <span className="font-bold">₹{prediction.breakdown.streaming.youtube.revenue.toLocaleString()}</span>
        </div>

    {/* Spotify - Second most popular */}
    <div className="flex justify-between items-center">
      <span className="text-sm">🎵 Spotify ({prediction.breakdown.streaming.spotify.streams.toLocaleString()} streams)</span>
      <span className="font-bold">₹{prediction.breakdown.streaming.spotify.revenue.toLocaleString()}</span>
    </div>

    {/* Other Platforms - JioSaavn, Gaana, Wynk */}
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">🎧 Other Platforms ({prediction.breakdown.streaming.other_platforms.streams.toLocaleString()} streams)</span>
      <span className="font-bold text-gray-300">₹{prediction.breakdown.streaming.other_platforms.revenue.toLocaleString()}</span>
    </div>
    <p className="text-xs text-gray-500 -mt-2 ml-6">JioSaavn, Gaana, Wynk, Amazon Music</p>

    {/* Apple Music - Only show if > 0 */}
    {prediction.breakdown.streaming.apple_music.streams > 0 && (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">🍎 Apple Music ({prediction.breakdown.streaming.apple_music.streams.toLocaleString()} streams)</span>
        <span className="font-bold text-gray-400">₹{prediction.breakdown.streaming.apple_music.revenue.toLocaleString()}</span>
      </div>
    )}

    {/* Reels/Shorts */}
    <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
      <span className="text-sm">📱 Reels/Shorts ({prediction.breakdown.additional.reels_shorts.uses.toLocaleString()} uses)</span>
      <span className="font-bold">₹{prediction.breakdown.additional.reels_shorts.revenue.toLocaleString()}</span>
    </div>

    {/* Sync Licensing - Conditional */}
    {prediction.breakdown.additional.sync_licensing.revenue > 0 && (
      <div className="flex justify-between items-center">
        <span className="text-sm">🎬 Sync Licensing ({prediction.breakdown.additional.sync_licensing.deals} deal{prediction.breakdown.additional.sync_licensing.deals > 1 ? 's' : ''})</span>
        <span className="font-bold text-green-400">₹{prediction.breakdown.additional.sync_licensing.revenue.toLocaleString()}</span>
      </div>
    )}

    {/* Merchandise - Conditional */}
    {prediction.breakdown.additional.merchandise.sales > 0 && (
      <div className="flex justify-between items-center">
        <span className="text-sm">👕 Merchandise ({prediction.breakdown.additional.merchandise.sales} sale{prediction.breakdown.additional.merchandise.sales > 1 ? 's' : ''})</span>
        <span className="font-bold">₹{prediction.breakdown.additional.merchandise.revenue.toLocaleString()}</span>
      </div>
    )}

    {/* Live Shows - Conditional */}
    {prediction.breakdown.additional.live_shows.revenue > 0 && (
      <div className="flex justify-between items-center">
        <span className="text-sm">🎤 Live Shows</span>
        <span className="font-bold">₹{prediction.breakdown.additional.live_shows.revenue.toLocaleString()}</span>
      </div>
    )}
  </div>

  <div className="border-t border-gray-700 pt-3">
    <div className="flex justify-between items-center text-lg font-bold">
      <span>Total Gross Revenue (3M)</span>
      <span className="text-green-400">₹{prediction.prediction.gross_revenue_3m.toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
      <span>Campaign Investment</span>
      <span>-₹{prediction.investment.total.toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xl font-bold mt-2">
      <span>Net Profit</span>
      <span className={prediction.prediction.net_revenue_3m > 0 ? 'text-green-400' : 'text-red-400'}>
        {prediction.prediction.net_revenue_3m > 0 ? '+' : ''}₹{Math.abs(prediction.prediction.net_revenue_3m).toLocaleString()}
      </span>
    </div>
  </div>
</div>

          {/* Investor Returns Calculator - ALWAYS VISIBLE */}
{prediction && (
  <div className="bg-gradient-to-br from-green-600/10 via-blue-600/10 to-purple-600/10 p-8 rounded-xl border-2 border-green-500/40">
    <h4 className="text-2xl font-bold mb-2 text-green-400 flex items-center gap-2">
      💰 Investor Returns Calculator
    </h4>
    <p className="text-gray-400 text-sm mb-6">
      See how much you can earn by investing in this campaign
    </p>
    
    {/* Investment Amount Input with Slider */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium">Your Investment Amount</label>
        <span className="text-xs text-gray-500">
          Max: ₹{prediction.investment.total.toLocaleString()}
        </span>
      </div>
      
      {/* Number Input */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-3.5 text-gray-400 text-lg">₹</span>
        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            const maxAmount = prediction.investment.total;
            setInvestmentAmount(Math.min(Math.max(value, 0), maxAmount));
          }}
          className="w-full p-3 pl-10 bg-fb-dark border-2 border-green-500/30 rounded-lg text-white text-xl font-bold focus:border-green-500 focus:outline-none"
          min="1000"
          max={prediction.investment.total}
          step="1000"
          placeholder="Enter amount"
        />
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(parseFloat(e.target.value))}
          min="1000"
          max={prediction.investment.total}
          step="500"
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${(investmentAmount / prediction.investment.total) * 100}%, #374151 ${(investmentAmount / prediction.investment.total) * 100}%, #374151 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₹1,000</span>
          <span>₹{prediction.investment.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Dynamic Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        <button
          onClick={() => setInvestmentAmount(Math.round(prediction.investment.total * 0.10))}
          className="py-2 px-3 bg-fb-dark border border-gray-600 rounded hover:border-green-500 text-sm transition"
          type="button"
        >
          10%
          <div className="text-xs text-gray-500">₹{Math.round(prediction.investment.total * 0.10).toLocaleString()}</div>
        </button>
        <button
          onClick={() => setInvestmentAmount(Math.round(prediction.investment.total * 0.25))}
          className="py-2 px-3 bg-fb-dark border border-gray-600 rounded hover:border-green-500 text-sm transition"
          type="button"
        >
          25%
          <div className="text-xs text-gray-500">₹{Math.round(prediction.investment.total * 0.25).toLocaleString()}</div>
        </button>
        <button
          onClick={() => setInvestmentAmount(Math.round(prediction.investment.total * 0.50))}
          className="py-2 px-3 bg-fb-dark border border-gray-600 rounded hover:border-green-500 text-sm transition"
          type="button"
        >
          50%
          <div className="text-xs text-gray-500">₹{Math.round(prediction.investment.total * 0.50).toLocaleString()}</div>
        </button>
        <button
          onClick={() => setInvestmentAmount(prediction.investment.total)}
          className="py-2 px-3 bg-fb-dark border border-gray-600 rounded hover:border-green-500 text-sm transition"
          type="button"
        >
          100%
          <div className="text-xs text-gray-500">₹{prediction.investment.total.toLocaleString()}</div>
        </button>
      </div>

      {/* Validation Messages */}
      {investmentAmount < 1000 && investmentAmount > 0 && (
        <p className="text-xs text-red-400 mt-2">⚠️ Minimum investment: ₹1,000</p>
      )}
      {investmentAmount > prediction.investment.total && (
        <p className="text-xs text-red-400 mt-2">⚠️ Cannot exceed campaign budget of ₹{prediction.investment.total.toLocaleString()}</p>
      )}
    </div>

    {/* Returns Display */}
    {investorReturns && investmentAmount >= 1000 && investmentAmount <= prediction.investment.total && (
      <div className="space-y-4">
        {/* Ownership Card */}
        <div className="bg-fb-dark p-5 rounded-lg border border-yellow-500/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Your Campaign Ownership</p>
              <p className="text-3xl font-bold text-yellow-400">{investorReturns.ownership.toFixed(2)}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Investor Pool Share</p>
              <p className="text-2xl font-bold text-gray-300">
                {((investorReturns.ownership / 100) * prediction.investor_returns.pool_percentage).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Returns Timeline */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* 3 Month Returns */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-5 rounded-lg border border-green-500/40">
            <p className="text-xs text-gray-300 mb-2">💚 3-Month Returns</p>
            <p className="text-2xl font-bold text-green-400 mb-1">
              ₹{investorReturns.returns_3m.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              ROI: <span className={investorReturns.roi > 0 ? 'text-green-400 font-bold' : 'text-red-400'}>
                {investorReturns.roi > 0 ? '+' : ''}{investorReturns.roi.toFixed(0)}%
              </span>
            </p>
          </div>

          {/* 6 Month Returns */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-5 rounded-lg border border-blue-500/40">
            <p className="text-xs text-gray-300 mb-2">💙 6-Month Returns</p>
            <p className="text-2xl font-bold text-blue-400 mb-1">
              ₹{investorReturns.returns_6m.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              ROI: <span className="text-blue-400 font-bold">
                +{(((investorReturns.returns_6m - investmentAmount) / investmentAmount) * 100).toFixed(0)}%
              </span>
            </p>
          </div>

          {/* 12 Month Returns */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-5 rounded-lg border border-purple-500/40">
            <p className="text-xs text-gray-300 mb-2">💜 12-Month Returns</p>
            <p className="text-2xl font-bold text-purple-400 mb-1">
              ₹{investorReturns.returns_12m.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              ROI: <span className="text-purple-400 font-bold">
                +{(((investorReturns.returns_12m - investmentAmount) / investmentAmount) * 100).toFixed(0)}%
              </span>
            </p>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="bg-fb-dark p-6 rounded-lg border-2 border-green-500/40">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Investment</span>
              <span className="text-xl font-bold text-white">₹{investmentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Expected Return (3M)</span>
              <span className="text-xl font-bold text-green-400">₹{investorReturns.returns_3m.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Your Profit (3M)</span>
                <span className={`text-2xl font-bold ${investorReturns.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {investorReturns.roi > 0 ? '+' : ''}₹{(investorReturns.returns_3m - investmentAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Recommendation */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs font-bold text-yellow-400 mb-2">💡 Investment Analysis</p>
          <p className="text-sm text-gray-300">
            {investorReturns.roi > 50 ? (
              <>
                <span className="text-green-400 font-bold">🔥 Excellent potential!</span> This campaign shows strong returns. 
                {investorReturns.ownership < 30 && " Consider increasing your stake to maximize earnings."}
              </>
            ) : investorReturns.roi > 20 ? (
              <>
                <span className="text-blue-400 font-bold">✅ Moderate returns.</span> Decent investment opportunity. 
                Diversify by investing in 2-3 campaigns for balanced risk.
              </>
            ) : investorReturns.roi > 0 ? (
              <>
                <span className="text-yellow-400 font-bold">⚠️ Low returns.</span> Consider smaller amounts 
                or look for higher-potential campaigns with better viral factor.
              </>
            ) : (
              <>
                <span className="text-red-400 font-bold">❌ Negative ROI.</span> Campaign needs higher budget 
                or better strategy. Not recommended at current projection.
              </>
            )}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 italic text-center">
          * AI-based projections. Actual returns depend on streaming performance and market conditions. 
          You receive {prediction.investor_returns.pool_percentage}% of gross revenue (investor pool share).
        </p>
      </div>
    )}

    {/* Show message if invalid amount */}
    {investmentAmount < 1000 && investmentAmount > 0 && (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-sm text-red-400">⚠️ Minimum investment: ₹1,000</p>
        <button
          onClick={() => setInvestmentAmount(1000)}
          className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded text-sm transition"
          type="button"
        >
          Set to ₹1,000
        </button>
      </div>
    )}
  </div>
)}

          {/* Break-even Info */}
          <div className="bg-fb-dark p-4 rounded-lg border border-yellow-500/30">
            <p className="text-sm text-gray-400">Break-even at</p>
            <p className="text-xl font-bold text-yellow-400">
              {prediction.prediction.breakeven_streams.toLocaleString()} total streams
            </p>
          </div>
        </div>
      )}
    </div>
  );
}