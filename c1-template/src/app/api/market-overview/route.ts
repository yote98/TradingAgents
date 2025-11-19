import { NextRequest, NextResponse } from 'next/server';

// Mock data for market overview - in production, this would fetch from a real API
export async function GET(req: NextRequest) {
  try {
    // Simulate market data
    const marketData = {
      topMovers: [
        {
          ticker: "NVDA",
          name: "NVIDIA Corp.",
          sector: "Technology",
          price: 496.20,
          change: 12.50,
          changePercent: 2.6
        },
        {
          ticker: "META",
          name: "Meta Platforms",
          sector: "Comm Services",
          price: 545.60,
          change: 11.20,
          changePercent: 2.1
        },
        {
          ticker: "AAPL",
          name: "Apple Inc.",
          sector: "Technology",
          price: 191.40,
          change: 7.20,
          changePercent: 3.8
        },
        {
          ticker: "MSFT",
          name: "Microsoft Corp.",
          sector: "Technology",
          price: 378.90,
          change: 8.50,
          changePercent: 2.3
        },
        {
          ticker: "GOOGL",
          name: "Alphabet Inc.",
          sector: "Comm Services",
          price: 141.80,
          change: 2.90,
          changePercent: 2.1
        },
        {
          ticker: "TSLA",
          name: "Tesla Inc.",
          sector: "Consumer Discr.",
          price: 242.80,
          change: -5.60,
          changePercent: -2.3
        },
        {
          ticker: "XOM",
          name: "Exxon Mobil",
          sector: "Energy",
          price: 101.10,
          change: -2.40,
          changePercent: -2.3
        },
        {
          ticker: "JPM",
          name: "JPMorgan Chase",
          sector: "Financials",
          price: 158.30,
          change: 2.80,
          changePercent: 1.8
        },
        {
          ticker: "JNJ",
          name: "Johnson & Johnson",
          sector: "Health Care",
          price: 156.70,
          change: 3.90,
          changePercent: 2.5
        },
        {
          ticker: "V",
          name: "Visa Inc.",
          sector: "Financials",
          price: 267.50,
          change: 4.20,
          changePercent: 1.6
        }
      ],
      sectorData: [
        { sector: "Info Tech", return: 3.2 },
        { sector: "Health Care", return: 2.5 },
        { sector: "Comm Services", return: 2.1 },
        { sector: "Financials", return: 1.8 },
        { sector: "Industrials", return: 1.5 },
        { sector: "Consumer Discr.", return: 1.2 },
        { sector: "Staples", return: 0.8 },
        { sector: "Real Estate", return: 0.6 },
        { sector: "Utilities", return: 0.4 },
        { sector: "Materials", return: 0.2 },
        { sector: "Energy", return: -0.5 }
      ],
      macroHighlights: [
        "Tech sector leads with strong momentum across semiconductors and software",
        "Sector breadth positive: 9 of 11 sectors showing gains; Energy lags on softer crude",
        "Macro: Risk-on sentiment with yields easing; watch upcoming inflation data and Fed commentary"
      ],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market overview' },
      { status: 500 }
    );
  }
}
