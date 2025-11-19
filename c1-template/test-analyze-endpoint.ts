/**
 * Test the /api/analyze endpoint to diagnose 500 errors
 */

async function testAnalyzeEndpoint() {
  const ticker = 'AAPL';
  
  try {
    console.log(`Testing /api/analyze with ticker: ${ticker}`);
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker }),
    });

    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Current Price:', data.current_price);
      console.log('Recommendation:', data.final_decision);
      console.log('Confidence:', data.confidence);
    } else {
      console.log('❌ ERROR!');
      console.log('Error details:', data);
    }
  } catch (error) {
    console.error('❌ FETCH ERROR:', error);
  }
}

testAnalyzeEndpoint();
