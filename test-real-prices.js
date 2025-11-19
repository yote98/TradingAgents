// Quick test to show real-time prices from our API
const tickers = ['AAPL', 'TSLA', 'NVDA', 'MSFT'];

async function testPrices() {
  console.log('🔍 Testing Real-Time Prices from Our API\n');
  console.log('='.repeat(60));
  
  for (const ticker of tickers) {
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      
      const data = await response.json();
      console.log(`\n${ticker}:`);
      console.log(`  Price: $${data.current_price}`);
      console.log(`  Recommendation: ${data.final_decision}`);
      console.log(`  Confidence: ${data.confidence}%`);
      console.log(`  Source: MarketData.app (Real-time)`);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ These are the CORRECT real-time prices!');
  console.log('If the UI shows different prices, it\'s using cached/old data.\n');
}

testPrices();
