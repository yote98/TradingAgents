/**
 * Alpha Vantage API Client (Fallback for MarketData)
 */

import { Quote } from './marketdata-client';

export class AlphaVantageClient {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(ticker: string): Promise<Quote> {
    const response = await fetch(
      `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${this.apiKey}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API failed for ${ticker}`);
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || !quote['05. price']) {
      throw new Error(`No data returned for ${ticker}`);
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    const volume = parseInt(quote['06. volume']);
    const high = parseFloat(quote['03. high']);
    const low = parseFloat(quote['04. low']);
    const open = parseFloat(quote['02. open']);
    const previousClose = parseFloat(quote['08. previous close']);

    return {
      symbol: quote['01. symbol'],
      price,
      change,
      changePercent,
      volume,
      marketCap: 0, // Not available in Global Quote
      high,
      low,
      open,
      previousClose,
    };
  }
}

export function getAlphaVantageClient(): AlphaVantageClient {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY not configured');
  }
  return new AlphaVantageClient(apiKey);
}
