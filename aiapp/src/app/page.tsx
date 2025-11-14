"use client";

import { useEffect, useState } from "react";

import dynamic from 'next/dynamic';

const SimpleChat = dynamic(() => import('@/components/SimpleChat'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 50%, #0a2525 100%)',
      color: '#ffffff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(20, 184, 166, 0.2)',
          borderTopColor: '#14b8a6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Loading AlphaFlow AI...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
});

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000000',
    backgroundImage: 'url("https://cdn.cmsfly.com/6847c04a58030400123992c0/images/herobg-3DNHN.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  nav: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0.5rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  button: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  hero: {
    textAlign: 'center' as const,
    padding: '6.25rem 2rem 4rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#cbd5e1',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '4rem auto',
    padding: '0 2rem',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    transform: 'translateZ(0)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  featureCardHover: {
    transform: 'translateY(-8px) translateZ(0)',
    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3)',
  },
  featureIcon: {
    fontSize: '64px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '0.75rem',
  },
  featureDesc: {
    fontSize: '0.95rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '4rem auto',
    padding: '0 2rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    transform: 'translateZ(0)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
  },
  statCardHover: {
    transform: 'translateY(-5px) translateZ(0)',
    boxShadow: '0 15px 30px rgba(20, 184, 166, 0.4), 0 8px 15px rgba(0, 0, 0, 0.3)',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.95rem',
    color: '#cbd5e1',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '1rem 2rem',
    color: '#94a3b8',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '4rem',
    position: 'relative' as const,
    zIndex: 10,
  },
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // ULTIMATE Nuclear option: Remove the "N" logo with MutationObserver
    const removeNLogo = () => {
      // Target all fixed position elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed') {
          const rect = el.getBoundingClientRect();
          // Bottom-left corner (where N logo appears)
          if (rect.bottom > window.innerHeight - 150 && rect.left < 150) {
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
            (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
            (el as HTMLElement).style.setProperty('opacity', '0', 'important');
            (el as HTMLElement).remove(); // Nuclear: just delete it
          }
        }
      });
    };
    
    // Run immediately
    removeNLogo();
    
    // Run every 50ms (more aggressive)
    const interval = setInterval(removeNLogo, 50);
    
    // Watch for DOM changes and remove immediately
    const observer = new MutationObserver(removeNLogo);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscriptionMessage('');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptionMessage('🎉 Successfully subscribed! Check your email for confirmation.');
        setEmail('');
      } else {
        setSubscriptionMessage(`❌ ${data.error || 'Subscription failed. Please try again.'}`);
      }
    } catch {
      setSubscriptionMessage('❌ Network error. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #0a1f1a 0%, #134e4a 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#ffffff' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (showChat) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        background: '#0f0f0f',
        backgroundImage: 'none'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '280px',
          background: '#1a1a1a',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          overflowY: 'auto',
          height: '100vh'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem', flexShrink: 0 }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              AlphaFlow AI
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Multi-Agent Intelligence</p>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setShowChat(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                ← Back to Home
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                INTERNAL ANALYSTS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { icon: '📈', label: 'Market Analyst', desc: 'Technical indicators' },
                  { icon: '💰', label: 'Fundamentals Analyst', desc: 'Financial metrics' },
                  { icon: '📰', label: 'News Analyst', desc: 'News & insider data' },
                  { icon: '💬', label: 'Social Media Analyst', desc: 'Sentiment analysis' },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(20, 184, 166, 0.15)',
                      border: '1px solid rgba(20, 184, 166, 0.3)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(20, 184, 166, 0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateY(-2px)';
                      target.style.boxShadow = '0 8px 24px rgba(20, 184, 166, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.1)';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: '#14b8a6', fontSize: '0.8rem', fontWeight: '500' }}>
                        {item.label}
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                EXTERNAL COACHES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { icon: '📊', label: 'Coach D', desc: 'Daily trading plans' },
                  { icon: '💡', label: 'Coach I', desc: 'Insights & analysis' },
                  { icon: '🎯', label: 'Coach S', desc: 'Sentiment & positioning' },
                  { icon: '📖', label: 'Coach N', desc: 'Narrative & context' },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateY(-2px)';
                      target.style.background = 'rgba(255, 255, 255, 0.12)';
                      target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateY(0)';
                      target.style.background = 'rgba(255, 255, 255, 0.08)';
                      target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: '500' }}>
                        {item.label}
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </nav>
        </div>

        {/* Chat Area */}
        <div 
          className="chat-container jade-theme"
          style={{ 
            flex: 1, 
            position: 'relative',
            background: '#0f0f0f',
            minHeight: '100vh',
            padding: '0',
            // CSS variables for C1Chat Jade theme (darker)
            ['--c1-primary-color' as string]: '#14b8a6',
            ['--c1-background-color' as string]: '#0f0f0f',
            ['--c1-text-color' as string]: '#ffffff',
            ['--c1-input-background' as string]: 'rgba(255, 255, 255, 0.95)',
            ['--c1-input-text-color' as string]: '#0f172a',
            ['--c1-message-background' as string]: 'rgba(20, 184, 166, 0.15)',
            ['--c1-border-color' as string]: 'rgba(20, 184, 166, 0.3)',
            ['--c1-user-message-bg' as string]: 'rgba(20, 184, 166, 0.2)',
            ['--c1-assistant-message-bg' as string]: 'rgba(255, 255, 255, 0.05)',
          } as React.CSSProperties}
        >
          {mounted ? (
            <SimpleChat />
          ) : (
            <div style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              Loading AlphaFlow AI...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page-container" style={styles.container}>
      {/* Navigation */}
      <nav style={{...styles.nav, position: 'relative', zIndex: 10}}>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <button onClick={() => setShowChat(true)} style={styles.button}>Launch AI</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{...styles.hero, position: 'relative', zIndex: 10}}>
        <h1 style={styles.title}>
          AI-Powered Market Intelligence<br />for Smarter Decisions
        </h1>
        <p style={styles.subtitle}>
          Multi-agent AI framework for comprehensive market analysis, risk management, and intelligent trading decisions
        </p>
        <button onClick={() => setShowChat(true)} style={styles.button}>Launch AI Assistant</button>
      </div>

      {/* Features */}
      <div id="features" style={{...styles.features, position: 'relative', zIndex: 10}}>
        <div 
          style={hoveredCard === 0 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={styles.featureIcon}>
            <div style={{
              fontSize: '64px',
              filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.4))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              transform: hoveredCard === 0 ? 'scale(1.1)' : 'scale(1)'
            }}>
              📈
            </div>
          </div>
          <h3 style={styles.featureTitle}>Market Analysis</h3>
          <p style={styles.featureDesc}>Real-time technical indicators, price trends, and volume analysis powered by AI</p>
        </div>
        <div 
          style={hoveredCard === 1 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={styles.featureIcon}>
            <div style={{
              fontSize: '64px',
              filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.4))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              transform: hoveredCard === 1 ? 'scale(1.1)' : 'scale(1)'
            }}>
              🤖
            </div>
          </div>
          <h3 style={styles.featureTitle}>Multi-Agent System</h3>
          <p style={styles.featureDesc}>Specialized AI analysts for market, fundamentals, news, and social sentiment</p>
        </div>
        <div 
          style={hoveredCard === 2 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={styles.featureIcon}>
            <div style={{
              fontSize: '64px',
              filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.4))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              transform: hoveredCard === 2 ? 'scale(1.1)' : 'scale(1)'
            }}>
              🛡️
            </div>
          </div>
          <h3 style={styles.featureTitle}>Risk Management</h3>
          <p style={styles.featureDesc}>Advanced position sizing, stop-loss calculation, and portfolio risk assessment</p>
        </div>
        <div 
          style={hoveredCard === 3 ? {...styles.featureCard, ...styles.featureCardHover} : styles.featureCard}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={styles.featureIcon}>
            <div style={{
              fontSize: '64px',
              filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.4))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              transform: hoveredCard === 3 ? 'scale(1.1)' : 'scale(1)'
            }}>
              ⏱️
            </div>
          </div>
          <h3 style={styles.featureTitle}>Backtesting</h3>
          <p style={styles.featureDesc}>Test strategies on historical data with comprehensive performance metrics</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{...styles.stats, position: 'relative', zIndex: 10}}>
        <div 
          style={hoveredStat === 0 ? {...styles.statCard, ...styles.statCardHover} : styles.statCard}
          onMouseEnter={() => setHoveredStat(0)}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statNumber}>4</div>
          <div style={styles.statLabel}>AI Analysts</div>
        </div>
        <div 
          style={hoveredStat === 1 ? {...styles.statCard, ...styles.statCardHover} : styles.statCard}
          onMouseEnter={() => setHoveredStat(1)}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statNumber}>85+</div>
          <div style={styles.statLabel}>Twitter Sources</div>
        </div>
        <div 
          style={hoveredStat === 2 ? {...styles.statCard, ...styles.statCardHover} : styles.statCard}
          onMouseEnter={() => setHoveredStat(2)}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statNumber}>13+</div>
          <div style={styles.statLabel}>News Feeds</div>
        </div>
        <div 
          style={hoveredStat === 3 ? {...styles.statCard, ...styles.statCardHover} : styles.statCard}
          onMouseEnter={() => setHoveredStat(3)}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statNumber}>100%</div>
          <div style={styles.statLabel}>Validated</div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={{
        maxWidth: '500px',
        margin: '0.5rem auto 1rem',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <style>{`
          @keyframes rotateBorder {
            0% {
              box-shadow: 
                0 0 20px rgba(16, 185, 129, 0.8),
                0 0 40px rgba(16, 185, 129, 0.4),
                inset 0 0 20px rgba(16, 185, 129, 0.2);
            }
            25% {
              box-shadow: 
                20px 0 20px rgba(212, 252, 121, 0.8),
                40px 0 40px rgba(212, 252, 121, 0.4),
                inset 0 0 20px rgba(16, 185, 129, 0.2);
            }
            50% {
              box-shadow: 
                0 20px 20px rgba(16, 185, 129, 0.8),
                0 40px 40px rgba(16, 185, 129, 0.4),
                inset 0 0 20px rgba(16, 185, 129, 0.2);
            }
            75% {
              box-shadow: 
                -20px 0 20px rgba(212, 252, 121, 0.8),
                -40px 0 40px rgba(212, 252, 121, 0.4),
                inset 0 0 20px rgba(16, 185, 129, 0.2);
            }
            100% {
              box-shadow: 
                0 0 20px rgba(16, 185, 129, 0.8),
                0 0 40px rgba(16, 185, 129, 0.4),
                inset 0 0 20px rgba(16, 185, 129, 0.2);
            }
          }
        `}</style>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '2px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '12px',
          padding: '1rem 1rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          animation: 'rotateBorder 3s ease-in-out infinite'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '0.4rem',
            lineHeight: '1.2'
          }}>
            Unlock AI-Powered Trading Intelligence
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#cbd5e1',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            Join elite traders getting weekly multi-agent analysis, market insights, and institutional-grade research.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: '500px',
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubscribing}
              style={{
                flex: '1',
                minWidth: '280px',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                opacity: isSubscribing ? 0.7 : 1
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#10b981';
                target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={isSubscribing}
              style={{
                padding: '0.75rem 1.5rem',
                background: isSubscribing 
                  ? 'rgba(212, 252, 121, 0.5)' 
                  : 'linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isSubscribing ? 'not-allowed' : 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'transform 0.2s, box-shadow 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isSubscribing) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 4px 12px rgba(212, 252, 121, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubscribing) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'none';
                }
              }}
            >
              {isSubscribing ? 'Subscribing...' : 'Join Elite Traders'}
            </button>
          </form>
          
          {subscriptionMessage && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: subscriptionMessage.includes('Successfully') 
                ? 'rgba(16, 185, 129, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${subscriptionMessage.includes('Successfully') 
                ? 'rgba(16, 185, 129, 0.4)' 
                : 'rgba(239, 68, 68, 0.4)'}`,
              color: '#ffffff',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {subscriptionMessage}
            </div>
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Weekly market insights</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>AI trading strategies</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>No spam, unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>TradingAgents - Multi-Agent AI Research Framework</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>For research and educational purposes only</p>
      </footer>
    </div>
  );
}