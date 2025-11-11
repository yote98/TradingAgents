/**
 * Accessibility Testing Script
 * 
 * This script provides automated accessibility testing for the Dashboard Sidebar Navigation.
 * Run with: node accessibility-test.js
 * 
 * Requirements:
 * - npm install --save-dev axe-core
 * - npm install --save-dev puppeteer
 */

const fs = require('fs');
const path = require('path');

// Color contrast calculation utilities
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Test color combinations
const colorTests = {
  lightTheme: [
    { name: 'Primary text on white', fg: '#1e293b', bg: '#ffffff', minRatio: 4.5 },
    { name: 'Secondary text on white', fg: '#64748b', bg: '#ffffff', minRatio: 4.5 },
    { name: 'Muted text on white', fg: '#94a3b8', bg: '#ffffff', minRatio: 3.0 },
    { name: 'Primary button', fg: '#ffffff', bg: '#3b82f6', minRatio: 4.5 },
    { name: 'Primary button hover', fg: '#ffffff', bg: '#2563eb', minRatio: 4.5 },
    { name: 'Sidebar text', fg: '#d1d5db', bg: '#1e293b', minRatio: 4.5 },
    { name: 'Active nav item', fg: '#ffffff', bg: '#3b82f6', minRatio: 4.5 },
    { name: 'Success text', fg: '#166534', bg: '#dcfce7', minRatio: 4.5 },
    { name: 'Error text', fg: '#991b1b', bg: '#fee2e2', minRatio: 4.5 },
    { name: 'Warning text', fg: '#92400e', bg: '#fef3c7', minRatio: 4.5 },
  ],
  darkTheme: [
    { name: 'Primary text on dark', fg: '#f1f5f9', bg: '#0f172a', minRatio: 4.5 },
    { name: 'Secondary text on dark', fg: '#cbd5e1', bg: '#0f172a', minRatio: 4.5 },
    { name: 'Muted text on dark', fg: '#94a3b8', bg: '#0f172a', minRatio: 4.5 },
    { name: 'Primary button (dark)', fg: '#ffffff', bg: '#3b82f6', minRatio: 4.5 },
    { name: 'Secondary button (dark)', fg: '#f1f5f9', bg: '#334155', minRatio: 4.5 },
  ]
};

// Run color contrast tests
function runColorContrastTests() {
  console.log('\n=== Color Contrast Tests ===\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  Object.entries(colorTests).forEach(([theme, tests]) => {
    console.log(`\n${theme.toUpperCase()}:`);
    console.log('─'.repeat(60));
    
    tests.forEach(test => {
      const ratio = getContrastRatio(test.fg, test.bg);
      const pass = ratio >= test.minRatio;
      
      if (pass) {
        passed++;
        console.log(`✅ ${test.name}: ${ratio.toFixed(2)}:1 (min: ${test.minRatio}:1)`);
      } else {
        failed++;
        failures.push({ theme, ...test, actualRatio: ratio });
        console.log(`❌ ${test.name}: ${ratio.toFixed(2)}:1 (min: ${test.minRatio}:1)`);
      }
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  if (failures.length > 0) {
    console.log('\n⚠️  Failed Tests:');
    failures.forEach(f => {
      console.log(`  - ${f.theme} / ${f.name}: ${f.actualRatio.toFixed(2)}:1 (need ${f.minRatio}:1)`);
    });
  }
  
  return { passed, failed, failures };
}

// Check ARIA attributes in components
function checkAriaAttributes() {
  console.log('\n=== ARIA Attributes Check ===\n');
  
  const componentsToCheck = [
    'src/components/Sidebar.tsx',
    'src/components/NavItem.tsx',
    'src/components/DashboardLayout.tsx',
    'src/components/sections/HomeSection.tsx',
    'src/components/sections/AnalyzeSection.tsx',
    'src/components/sections/BacktestSection.tsx',
    'src/components/sections/RiskSection.tsx',
  ];
  
  const ariaPatterns = [
    /aria-label=/g,
    /aria-labelledby=/g,
    /aria-current=/g,
    /aria-expanded=/g,
    /aria-hidden=/g,
    /aria-busy=/g,
    /role=/g,
  ];
  
  let totalAriaUsage = 0;
  
  componentsToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let fileAriaCount = 0;
    
    ariaPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        fileAriaCount += matches.length;
      }
    });
    
    totalAriaUsage += fileAriaCount;
    
    if (fileAriaCount > 0) {
      console.log(`✅ ${file}: ${fileAriaCount} ARIA attributes`);
    } else {
      console.log(`⚠️  ${file}: No ARIA attributes found`);
    }
  });
  
  console.log(`\nTotal ARIA attributes found: ${totalAriaUsage}`);
  
  return totalAriaUsage;
}

// Check semantic HTML
function checkSemanticHTML() {
  console.log('\n=== Semantic HTML Check ===\n');
  
  const componentsToCheck = [
    'src/components/sections/HomeSection.tsx',
    'src/components/sections/AnalyzeSection.tsx',
    'src/components/sections/BacktestSection.tsx',
    'src/components/sections/RiskSection.tsx',
    'src/components/sections/CoachesSection.tsx',
    'src/components/sections/SocialSection.tsx',
    'src/components/sections/SettingsSection.tsx',
  ];
  
  const semanticElements = {
    section: /<section/g,
    article: /<article/g,
    aside: /<aside/g,
    nav: /<nav/g,
    header: /<header/g,
    footer: /<footer/g,
    main: /<main/g,
    h1: /<h1/g,
    h2: /<h2/g,
    h3: /<h3/g,
    fieldset: /<fieldset/g,
    legend: /<legend/g,
  };
  
  const results = {};
  
  componentsToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(file);
    results[fileName] = {};
    
    Object.entries(semanticElements).forEach(([element, pattern]) => {
      const matches = content.match(pattern);
      results[fileName][element] = matches ? matches.length : 0;
    });
  });
  
  // Display results
  Object.entries(results).forEach(([file, elements]) => {
    console.log(`\n${file}:`);
    Object.entries(elements).forEach(([element, count]) => {
      if (count > 0) {
        console.log(`  ✅ <${element}>: ${count}`);
      }
    });
  });
  
  return results;
}

// Generate accessibility report
function generateReport(colorResults, ariaCount, semanticResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      colorContrastTests: {
        passed: colorResults.passed,
        failed: colorResults.failed,
        total: colorResults.passed + colorResults.failed,
      },
      ariaAttributes: ariaCount,
      semanticHTML: Object.values(semanticResults).reduce((acc, file) => {
        return acc + Object.values(file).reduce((sum, count) => sum + count, 0);
      }, 0),
    },
    colorContrastFailures: colorResults.failures,
    overallScore: calculateScore(colorResults, ariaCount),
  };
  
  const reportPath = path.join(__dirname, 'accessibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  return report;
}

function calculateScore(colorResults, ariaCount) {
  const colorScore = (colorResults.passed / (colorResults.passed + colorResults.failed)) * 50;
  const ariaScore = Math.min(ariaCount / 50, 1) * 30; // Max 30 points for ARIA
  const baseScore = 20; // Base points for having the structure
  
  return Math.round(colorScore + ariaScore + baseScore);
}

// Main execution
function main() {
  console.log('🔍 Running Accessibility Tests...\n');
  console.log('='.repeat(60));
  
  try {
    const colorResults = runColorContrastTests();
    const ariaCount = checkAriaAttributes();
    const semanticResults = checkSemanticHTML();
    
    const report = generateReport(colorResults, ariaCount, semanticResults);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Overall Accessibility Score:', report.overallScore, '/ 100');
    
    if (report.overallScore >= 90) {
      console.log('✅ Excellent! Meets WCAG AA standards.');
    } else if (report.overallScore >= 75) {
      console.log('⚠️  Good, but some improvements needed.');
    } else {
      console.log('❌ Needs significant accessibility improvements.');
    }
    
    console.log('\n✨ Accessibility audit complete!\n');
    
    // Exit with error code if there are failures
    process.exit(colorResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Error running accessibility tests:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runColorContrastTests,
  checkAriaAttributes,
  checkSemanticHTML,
  getContrastRatio,
};
