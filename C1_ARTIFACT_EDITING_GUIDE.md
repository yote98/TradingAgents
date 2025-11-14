# C1 Artifact Editing Guide

## Overview

Artifacts in C1 can be **edited iteratively** without regenerating from scratch. This is perfect for refining analysis, updating reports, or modifying visualizations based on user feedback.

## What are Artifacts?

Artifacts are standalone generated content like:
- **Reports**: Analysis documents, summaries
- **Presentations**: Slide decks
- **Documents**: Trading strategies, research notes
- **Visualizations**: Charts, dashboards

## Editing Pattern

Instead of regenerating, you **edit** by:
1. Sending the existing artifact content as an `assistant` message
2. Sending edit instructions as a `user` message
3. Getting back the modified artifact

## Architecture

```
User: "Add risk metrics to this analysis"
    ↓
Frontend sends:
  - assistant: [existing artifact content]
  - user: "Add risk metrics"
    ↓
C1 Artifact API
    ↓
Returns: Modified artifact with risk metrics
```

## Implementation for TradingAgents

### Use Case: Editing Stock Analysis Reports

When a user wants to refine their analysis:
- "Add more detail on fundamentals"
- "Include social sentiment data"
- "Update with latest prices"
- "Add risk assessment"

### Step 1: Create Artifact Generation Endpoint

Create `aiapp/src/app/api/artifact/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/artifact",
  apiKey: process.env.THESYS_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, ticker } = await req.json();

    // Generate initial artifact
    const artifact = await client.chat.completions.create({
      model: "c1/artifact/v-20251030",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      metadata: {
        thesys: JSON.stringify({
          c1_artifact_type: "document", // or "slides", "report"
          id: `analysis_${ticker}_${Date.now()}`,
        }),
      },
    });

    const content = artifact.choices[0].message.content;
    const artifactId = `analysis_${ticker}_${Date.now()}`;

    return NextResponse.json({
      content,
      artifactId,
      ticker,
    });
  } catch (error) {
    console.error("Artifact generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate artifact" },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Artifact Editing Endpoint

Create `aiapp/src/app/api/artifact/edit/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/artifact",
  apiKey: process.env.THESYS_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { 
      existingContent, 
      editPrompt, 
      artifactId,
      artifactType = "document" 
    } = await req.json();

    if (!existingContent || !editPrompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Edit the artifact
    const updatedArtifact = await client.chat.completions.create({
      model: "c1/artifact/v-20251030",
      messages: [
        // 1. Existing artifact as assistant message
        {
          role: "assistant",
          content: existingContent,
        },
        // 2. Edit instruction as user message
        {
          role: "user",
          content: editPrompt,
        },
      ],
      metadata: {
        thesys: JSON.stringify({
          c1_artifact_type: artifactType,
          id: artifactId,
        }),
      },
    });

    const updatedContent = updatedArtifact.choices[0].message.content;

    return NextResponse.json({
      content: updatedContent,
      artifactId,
    });
  } catch (error) {
    console.error("Artifact editing error:", error);
    return NextResponse.json(
      { error: "Failed to edit artifact" },
      { status: 500 }
    );
  }
}
```

### Step 3: Create Frontend Component

Create `aiapp/src/components/ArtifactEditor.tsx`:

```typescript
"use client";

import { useState } from "react";
import { C1Component, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

interface ArtifactEditorProps {
  ticker: string;
}

export default function ArtifactEditor({ ticker }: ArtifactEditorProps) {
  const [artifact, setArtifact] = useState<{
    content: string;
    artifactId: string;
  } | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Generate initial artifact
  const generateArtifact = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/artifact/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a comprehensive trading analysis report for ${ticker}`,
          ticker,
        }),
      });

      const data = await response.json();
      setArtifact({
        content: data.content,
        artifactId: data.artifactId,
      });
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit existing artifact
  const editArtifact = async () => {
    if (!artifact || !editPrompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/artifact/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingContent: artifact.content,
          editPrompt,
          artifactId: artifact.artifactId,
          artifactType: "document",
        }),
      });

      const data = await response.json();
      setArtifact({
        content: data.content,
        artifactId: data.artifactId,
      });
      setEditPrompt(""); // Clear edit prompt
    } catch (error) {
      console.error("Edit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider
      theme={{
        colors: {
          primary: "#10b981",
          background: "#111827",
          surface: "#1f2937",
          text: "#f9fafb",
        },
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Trading Analysis for {ticker}
          </h1>

          {/* Generate Button */}
          {!artifact && (
            <button
              onClick={generateArtifact}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate Analysis"}
            </button>
          )}

          {/* Artifact Display */}
          {artifact && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <C1Component
                  c1Response={artifact.content}
                  isStreaming={isLoading}
                />
              </div>

              {/* Edit Controls */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Refine Analysis
                </h2>
                
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g., 'Add risk metrics' or 'Include social sentiment'"
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") editArtifact();
                    }}
                  />
                  <button
                    onClick={editArtifact}
                    disabled={isLoading || !editPrompt.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? "Updating..." : "Update"}
                  </button>
                </div>

                {/* Quick Edit Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditPrompt("Add detailed risk assessment");
                      setTimeout(editArtifact, 100);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    + Risk Assessment
                  </button>
                  <button
                    onClick={() => {
                      setEditPrompt("Include social media sentiment analysis");
                      setTimeout(editArtifact, 100);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    + Social Sentiment
                  </button>
                  <button
                    onClick={() => {
                      setEditPrompt("Add technical indicators and chart patterns");
                      setTimeout(editArtifact, 100);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    + Technical Analysis
                  </button>
                  <button
                    onClick={() => {
                      setEditPrompt("Make it more concise and actionable");
                      setTimeout(editArtifact, 100);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Make Concise
                  </button>
                </div>
              </div>

              {/* Regenerate Button */}
              <button
                onClick={generateArtifact}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
```

### Step 4: Create Page Route

Create `aiapp/src/app/artifact/[ticker]/page.tsx`:

```typescript
"use client";

import { use } from "react";
import ArtifactEditor from "@/components/ArtifactEditor";

export default function ArtifactPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);

  return <ArtifactEditor ticker={ticker.toUpperCase()} />;
}
```

## Common Edit Patterns

### 1. Add More Detail
```typescript
editPrompt: "Add more detail about the fundamentals section"
```

### 2. Change Tone
```typescript
editPrompt: "Make the analysis more bullish/bearish"
```

### 3. Add Section
```typescript
editPrompt: "Add a section on competitive analysis"
```

### 4. Update Data
```typescript
editPrompt: "Update with the latest market data"
```

### 5. Simplify
```typescript
editPrompt: "Simplify the language for beginner traders"
```

### 6. Add Visuals
```typescript
editPrompt: "Add more charts and visualizations"
```

## Integration with TradingAgents Tools

You can combine artifact editing with tool calling:

```typescript
// In your edit endpoint
const editWithToolData = async (existingContent, editPrompt, ticker) => {
  // First, get fresh data from TradingAgents
  const toolData = await fetch(`${TRADINGAGENTS_API}/analyze`, {
    method: "POST",
    body: JSON.stringify({ ticker }),
  });

  // Then edit the artifact with the new data
  const enhancedPrompt = `${editPrompt}. Use this latest data: ${JSON.stringify(toolData)}`;

  return await client.chat.completions.create({
    model: "c1/artifact/v-20251030",
    messages: [
      { role: "assistant", content: existingContent },
      { role: "user", content: enhancedPrompt },
    ],
    // ... metadata
  });
};
```

## Artifact Types

### Document (Trading Report)
```typescript
c1_artifact_type: "document"
// Best for: Analysis reports, research notes
```

### Slides (Presentation)
```typescript
c1_artifact_type: "slides"
// Best for: Investment pitches, quarterly reviews
```

### Report (Structured Data)
```typescript
c1_artifact_type: "report"
// Best for: Performance reports, backtesting results
```

## Best Practices

### 1. Store Artifact History
```typescript
interface ArtifactVersion {
  content: string;
  timestamp: number;
  editPrompt?: string;
}

const [history, setHistory] = useState<ArtifactVersion[]>([]);

// After each edit
setHistory(prev => [...prev, {
  content: updatedContent,
  timestamp: Date.now(),
  editPrompt,
}]);
```

### 2. Provide Edit Suggestions
```typescript
const suggestedEdits = [
  "Add risk metrics",
  "Include social sentiment",
  "Make more concise",
  "Add technical indicators",
  "Update with latest data",
];
```

### 3. Show Edit History
```typescript
<div className="mt-4">
  <h3>Edit History</h3>
  {history.map((version, i) => (
    <div key={i} className="p-2 border-b">
      <span>{new Date(version.timestamp).toLocaleString()}</span>
      {version.editPrompt && <span>: {version.editPrompt}</span>}
      <button onClick={() => setArtifact({ content: version.content })}>
        Restore
      </button>
    </div>
  ))}
</div>
```

### 4. Validate Edits
```typescript
const validateEdit = (editPrompt: string) => {
  if (editPrompt.length < 5) {
    return "Edit prompt too short";
  }
  if (editPrompt.length > 500) {
    return "Edit prompt too long";
  }
  return null;
};
```

## Use Cases for TradingAgents

### 1. Iterative Analysis Refinement
```
User: "Analyze AAPL"
→ Generate initial report
User: "Add more on fundamentals"
→ Edit to expand fundamentals
User: "Include risk assessment"
→ Edit to add risk section
```

### 2. Presentation Building
```
User: "Create investment pitch for TSLA"
→ Generate slide deck
User: "Add competitive analysis slide"
→ Edit to add new slide
User: "Make it more bullish"
→ Edit tone
```

### 3. Report Customization
```
User: "Generate Q4 performance report"
→ Generate report
User: "Add charts for each metric"
→ Edit to add visualizations
User: "Simplify for executives"
→ Edit to simplify language
```

## Testing

### Test Artifact Generation
```bash
curl -X POST http://localhost:3000/api/artifact/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyze AAPL", "ticker": "AAPL"}'
```

### Test Artifact Editing
```bash
curl -X POST http://localhost:3000/api/artifact/edit \
  -H "Content-Type: application/json" \
  -d '{
    "existingContent": "...",
    "editPrompt": "Add risk metrics",
    "artifactId": "analysis_AAPL_123"
  }'
```

## Production Considerations

### 1. Rate Limiting
```typescript
// Limit edits per artifact
const MAX_EDITS_PER_ARTIFACT = 10;
```

### 2. Cost Management
```typescript
// Track API usage
const trackArtifactEdit = (artifactId: string, tokens: number) => {
  // Log to analytics
};
```

### 3. Caching
```typescript
// Cache artifacts to reduce regeneration
const cacheArtifact = (artifactId: string, content: string) => {
  localStorage.setItem(`artifact_${artifactId}`, content);
};
```

### 4. Error Handling
```typescript
try {
  const updated = await editArtifact(params);
  return updated;
} catch (error) {
  // Fallback to previous version
  return previousVersion;
}
```

## Summary

Artifact editing enables:
- **Iterative refinement** without starting over
- **User-driven customization** of analysis
- **Efficient updates** with minimal API calls
- **Version history** for tracking changes
- **Quick modifications** with suggested edits

This makes your TradingAgents interface more interactive and user-friendly, allowing traders to refine analysis exactly how they want it.

## Next Steps

1. Implement basic artifact generation
2. Add editing capability
3. Create quick-edit buttons
4. Add version history
5. Test with real trading scenarios

## Resources

- Main C1 Guide: `C1_COMPLETE_IMPLEMENTATION_GUIDE.md`
- Advanced Features: `C1_ADVANCED_FEATURES_GUIDE.md`
- Quick Start: `C1_QUICK_START.md`
- Thesys Docs: https://docs.thesys.dev
