// Quick test to verify Stripe checkout API works
const testStripeCheckout = async () => {
  try {
    console.log('Testing Stripe checkout API...');
    
    const response = await fetch('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1SV7a7PnZExcep4xOJtVLd8q', // Pro plan
        planName: 'Pro',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Stripe checkout session created');
      console.log('Session ID:', data.sessionId);
      console.log('Checkout URL:', data.url);
    } else {
      console.log('❌ ERROR:', data.error);
    }
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
};

testStripeCheckout();
