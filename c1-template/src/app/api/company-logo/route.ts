import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  try {
    const fmpApiKey = process.env.FMP_API_KEY;
    
    if (!fmpApiKey) {
      return NextResponse.json({ logoUrl: null });
    }

    // Fetch company profile from FMP
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpApiKey}`
    );

    if (!response.ok) {
      return NextResponse.json({ logoUrl: null });
    }

    const data = await response.json();
    
    if (data && data.length > 0 && data[0].image) {
      return NextResponse.json({ logoUrl: data[0].image });
    }

    return NextResponse.json({ logoUrl: null });
  } catch (error) {
    console.error('Error fetching company logo:', error);
    return NextResponse.json({ logoUrl: null });
  }
}
