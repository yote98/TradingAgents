// Quick test of the chat API
async function testChat() {
  console.log('Testing chat API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, can you analyze AAPL?' }
        ]
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullText += chunk;
        process.stdout.write(chunk);
      }
      
      console.log('\n\n✅ Chat API is working!');
      console.log('Full response length:', fullText.length);
    } else {
      const text = await response.text();
      console.error('❌ Error:', text);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChat();
