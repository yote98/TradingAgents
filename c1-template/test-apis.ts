/**
 * Test API connections directly
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

async function testAPIs() {
  console.log('🧪 Testing API Connections...\n');

  const ticker = 'AAPL';
  
  // Test FMP
  console.log('📊 Testing FMP (Financial Modeling Prep)...');
  const fmpKey = process.env.FMP_API_KEY;
  console.log(`Key: ${fmpKey?.substring(0, 10)}...`);
  
  try {
    const fmpUrl = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpKey}`;
    console.log(`URL: ${fmpUrl.replace(fmpKey!, 'KEY')}`);
    
    const fmpRes = await fetch(fmpUrl);
    console.log(`Status: ${fmpRes.status} ${fmpRes.statusText}`);
    
    const fmpData = await fmpRes.json();
    console.log('Response:', JSON.stringify(fmpData, null, 2).substring(0, 500));
    
    if (fmpData[0]) {
      console.log('✅ FMP Working! Got company data\n');
    } else {
      console.log('❌ FMP returned empty data\n');
    }
  } catch (error) {
    console.error('❌ FMP Error:', error);
  }

  // Test NewsData.io
  console.log('\n📰 Testing NewsData.io...');
  const newsdataKey = process.env.NEWSDATA_API_KEY;
  console.log(`Key: ${newsdataKey?.substring(0, 15)}...`);
  
  try {
    const newsdataUrl = `https://newsdata.io/api/1/news?apikey=${newsdataKey}&q=${ticker}&language=en&category=business`;
    console.log(`URL: ${newsdataUrl.replace(newsdataKey!, 'KEY')}`);
    
    const newsdataRes = await fetch(newsdataUrl);
    console.log(`Status: ${newsdataRes.status} ${newsdataRes.statusText}`);
    
    const newsdataData = await newsdataRes.json();
    console.log('Response:', JSON.stringify(newsdataData, null, 2).substring(0, 500));
    
    if (newsdataData.status === 'success' && newsdataData.results) {
      console.log(`✅ NewsData Working! Got ${newsdataData.results.length} articles\n`);
    } else {
      console.log('❌ NewsData issue:', newsdataData.message || 'No results\n');
    }
  } catch (error) {
    console.error('❌ NewsData Error:', error);
  }

  // Test MarketData.app
  console.log('\n💰 Testing MarketData.app...');
  const marketdataKey = process.env.MARKETDATA_API_KEY;
  console.log(`Key: ${marketdataKey?.substring(0, 15)}...`);
  
  try {
    const marketdataUrl = `https://api.marketdata.app/v1/stocks/quotes/${ticker}/?token=${marketdataKey}`;
    console.log(`URL: ${marketdataUrl.replace(marketdataKey!, 'KEY')}`);
    
    const marketdataRes = await fetch(marketdataUrl);
    console.log(`Status: ${marketdataRes.status} ${marketdataRes.statusText}`);
    
    const marketdataData = await marketdataRes.json();
    console.log('Response:', JSON.stringify(marketdataData, null, 2).substring(0, 300));
    
    if (marketdataData.s === 'ok') {
      console.log('✅ MarketData Working!\n');
    } else {
      console.log('❌ MarketData issue\n');
    }
  } catch (error) {
    console.error('❌ MarketData Error:', error);
  }
}

testAPIs();
