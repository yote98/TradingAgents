/**
 * Test Alpha Vantage Fallback
 * Run with: npx tsx test-fallback.ts
 */

async function testFallback() {
  console.log('🧪 Testing Alpha Vantage Fallback...\n');

  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'AAPL' }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Fallback is working!');
      console.log(`\nTicker: ${data.ticker}`);
      console.log(`Price: $${data.current_price}`);
      console.log(`Recommendation: ${data.final_decision}`);
      console.log(`Confidence: ${data.confidence}%`);
      console.log(`\nData source: ${data.market_data ? 'MarketData' : 'Alpha Vantage (fallback)'}`);
    } else {
      console.log('❌ ERROR:', data);
    }
  } catch (error) {
    console.error('❌ FETCH ERROR:', error);
  }
}

testFallback();
