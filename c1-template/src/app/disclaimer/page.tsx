export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-8">Legal Disclaimer</h1>
        
        <div className="space-y-6 text-gray-200">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Not Financial Advice</h2>
            <p>
              The information provided by AlphaFlow AI ("we," "us," or "our") on ai-trades.my (the "Site") 
              is for general informational and educational purposes only. All information on the Site is provided 
              in good faith, however we make no representation or warranty of any kind, express or implied, 
              regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any 
              information on the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">No Investment Advice</h2>
            <p>
              The Site and its content are NOT intended to provide financial, investment, trading, or any other 
              kind of professional advice. The AI-generated analysis, recommendations, and insights provided 
              through our platform should NOT be considered as financial advice or recommendations to buy, sell, 
              or hold any securities or investments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Risk Warning</h2>
            <p className="mb-4">
              Trading and investing in financial markets involves substantial risk of loss and is not suitable 
              for every investor. The valuation of stocks, cryptocurrencies, and other financial instruments may 
              fluctuate, and you may lose all or more than your original investment.
            </p>
            <p>
              Past performance is not indicative of future results. Any historical returns, expected returns, or 
              probability projections may not reflect actual future performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">AI-Generated Content</h2>
            <p>
              Our platform uses artificial intelligence to analyze market data and generate insights. While we 
              strive for accuracy, AI systems can make errors, produce biased results, or generate incomplete 
              analysis. Users should independently verify all information and conduct their own research before 
              making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Consult a Professional</h2>
            <p>
              Before making any financial decisions, you should consult with a qualified financial advisor, 
              accountant, or other professional who can provide advice tailored to your specific financial 
              situation and goals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">No Guarantees</h2>
            <p>
              We make no guarantees regarding the performance of any investment strategy, stock, or financial 
              instrument mentioned or analyzed on our platform. All investments carry risk, and you may lose money.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Research Purposes Only</h2>
            <p>
              AlphaFlow AI is designed for research and educational purposes. It is a tool to assist in your 
              own research and analysis, not a replacement for professional financial advice or your own due diligence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Responsibility</h2>
            <p>
              By using AlphaFlow AI, you acknowledge that you are solely responsible for your own investment 
              decisions and that you will not hold us liable for any losses or damages resulting from your use 
              of our platform or reliance on any information provided.
            </p>
          </section>

          <div className="mt-8 p-6 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-white font-bold text-center">
              ⚠️ USE AT YOUR OWN RISK. ALWAYS DO YOUR OWN RESEARCH. NEVER INVEST MORE THAN YOU CAN AFFORD TO LOSE.
            </p>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            Last Updated: November 19, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
