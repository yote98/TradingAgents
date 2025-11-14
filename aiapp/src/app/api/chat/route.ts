import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 Received body:', JSON.stringify(body, null, 2));
    
    // C1Chat sends prompt object, not messages array
    let messages = [];
    
    if (body.prompt && body.prompt.content) {
      // Extract content and decode HTML entities
      let content = body.prompt.content;
      // Remove <content> tags if present
      content = content.replace(/<\/?content>/g, '');
      // Decode HTML entities
      content = content.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      
      messages = [{ role: 'user', content: content }];
    } else if (body.messages) {
      messages = body.messages;
    } else if (body.message) {
      messages = [{ role: 'user', content: body.message }];
    }

    console.log('💬 Messages array:', messages);

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return new Response(
        'Error: OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.',
        { 
          status: 500, 
          headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
        }
      );
    }

    // Create a streaming response in the format C1Chat expects
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenAI with streaming
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are AlphaFlow AI, a multi-agent trading analysis system with:
- Market Analyst (technical indicators)
- Fundamentals Analyst (financial metrics)
- News Analyst (news & insider data)
- Social Media Analyst (sentiment analysis)

You can help with stock analysis, risk management, backtesting, and sentiment analysis.`
              },
              ...messages
            ],
            stream: true,
            temperature: 0.7,
          });

          // Stream the response in plain text format (what C1Chat expects)
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorText = `I apologize, but I encountered an error: ${errorMessage}. Please try again.`;
          controller.enqueue(encoder.encode(errorText));
          controller.close();
        }
      },
    });

    console.log('✅ Returning stream to client');
    
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "AlphaFlow AI Chat API is running",
      message: "Use POST to send chat messages"
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}