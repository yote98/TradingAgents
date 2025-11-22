# Crayon AI Charts Discovery 🎨

## What We Found

You have **@crayonai/react-ui v0.9.1** installed with a complete charting library!

## Available Chart Components

### 📊 Full-Size Charts
1. **AreaChart** - Area/line charts with fills
2. **BarChart** - Vertical bar charts
3. **HorizontalBarChart** - Horizontal bar charts
4. **LineChart** - Line charts
5. **PieChart** - Pie/donut charts
6. **RadarChart** ⭐ - Spider/radar charts (what we're using!)
7. **RadialChart** - Radial/circular charts
8. **ScatterChart** - Scatter plot charts
9. **SingleStackedBarChart** - Stacked bar charts

### 📈 Condensed Charts
- **AreaChartCondensed** - Compact area charts
- **BarChartCondensed** - Compact bar charts
- **LineChartCondensed** - Compact line charts

### 🔬 Mini Charts (Sparklines)
- **MiniAreaChart** - Tiny area charts
- **MiniBarChart** - Tiny bar charts
- **MiniLineChart** - Tiny line charts

## RadarChart Features

### Props
```typescript
{
  data: Array<Record<string, string | number>>;
  categoryKey: string; // Which field to use for labels
  theme?: "ocean" | "orchid" | "emerald" | "sunset" | "spectrum" | "vivid";
  customPalette?: string[]; // Custom colors
  variant?: "line" | "area"; // Line or filled area
  grid?: boolean; // Show grid lines
  legend?: boolean; // Show legend
  strokeWidth?: number;
  areaOpacity?: number;
  icons?: Partial<Record<string, React.ComponentType>>; // Custom icons
  isAnimationActive?: boolean;
  height?: number;
  width?: number;
}
```

### Themes Available
- **ocean** - Blue tones
- **orchid** - Purple tones
- **emerald** ⭐ - Green tones (we're using this for crypto!)
- **sunset** - Orange/red tones
- **spectrum** - Rainbow colors
- **vivid** - Bright colors

### Our Implementation
```typescript
<RadarChart
  data={[
    { dimension: 'Volatility', value: 75 },
    { dimension: 'Volume', value: 60 },
    { dimension: 'Momentum', value: 45 },
    { dimension: 'Fear/Greed', value: 16 },
    { dimension: 'Social', value: 70 },
    { dimension: 'Technicals', value: 50 },
    { dimension: 'On-Chain', value: 65 },
  ]}
  categoryKey="dimension"
  theme="emerald"
  variant="area"
  grid={true}
  legend={false}
  height={400}
  isAnimationActive={true}
/>
```

## Other Crayon Components Available

### UI Components
- Accordion
- Button / Buttons
- Calendar
- Callout
- Card / CardHeader
- Carousel
- CheckBoxGroup / CheckBoxItem
- CodeBlock
- DatePicker
- FormControl
- IconButton
- Image / ImageGallery
- Input
- Label
- ListBlock / ListItem
- MarkDownRenderer
- RadioGroup / RadioItem
- Select
- Separator
- Slider
- Steps
- SwitchGroup / SwitchItem
- Table
- Tabs
- Tag / TagBlock
- TextArea
- TextCallout
- TextContent

### Special Components
- **CopilotShell** - AI copilot interface
- **CrayonChat** - Chat interface
- **Shell** - Application shell
- **ThemeProvider** - Theme management

## Potential Use Cases for Your App

### 1. Fear & Greed Gauge
Use **RadialChart** for a circular gauge showing Fear & Greed Index (0-100)

### 2. Price History
Use **LineChart** or **AreaChart** for 7-day price trends

### 3. Portfolio Allocation
Use **PieChart** for portfolio breakdown

### 4. Volume Analysis
Use **BarChart** for volume over time

### 5. Multi-Stock Comparison
Use **HorizontalBarChart** for comparing multiple stocks

### 6. Sparklines in Cards
Use **MiniLineChart** for tiny price charts in stock cards

### 7. Sentiment Trends
Use **AreaChart** for Fear & Greed over time

## Thesys GenUI SDK

You also have **@thesysai/genui-sdk v0.7.3** installed. This likely provides:
- AI-powered UI generation
- Tool calling capabilities
- Integration with Thesys Playground features

## Next Steps

### Immediate
1. ✅ Test the RadarChart deployment
2. Test different themes (ocean, sunset, vivid)
3. Add animations and interactions

### Future Enhancements
1. **Fear & Greed Gauge** - Use RadialChart for circular meter
2. **Price History Chart** - Use LineChart for 7-day trends
3. **Volume Bars** - Use BarChart for trading volume
4. **Portfolio Pie** - Use PieChart for allocation
5. **Sparklines** - Use MiniLineChart in stock cards
6. **Sentiment Timeline** - Use AreaChart for Fear & Greed history

### Explore Thesys SDK
- Check tool calling capabilities
- Explore AI-powered chart generation
- Integration with Thesys Playground

## Resources

- **Package:** `@crayonai/react-ui` v0.9.1
- **Location:** `node_modules/@crayonai/react-ui/dist/components/Charts/`
- **Docs:** Check Crayon AI documentation
- **Themes:** 6 built-in color schemes
- **Variants:** Line and area fills

## Summary

You have a **professional-grade charting library** already installed! The Crayon RadarChart is perfect for our crypto sentiment visualization, and we have many more chart types available for future enhancements.

**Current Status:** ✅ Using Crayon RadarChart with emerald theme
**Next:** Test deployment and explore other chart types!
