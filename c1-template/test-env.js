// Quick test to check if env vars are loaded
require('dotenv').config({ path: '.env.local' });

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 20)}...` : 
  'NOT FOUND');

console.log('MARKETDATA_API_KEY:', process.env.MARKETDATA_API_KEY ? 
  'Found' : 
  'NOT FOUND');
