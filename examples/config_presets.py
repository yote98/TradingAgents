"""
Configuration Presets for Different Trading Styles

This module provides optimized configuration presets for various trading strategies,
balancing cost, speed, and analysis depth.
"""

# ============================================================================
# DAY TRADING CONFIGURATION (Fast & Low Cost)
# ============================================================================
# Best for: Intraday trades, quick decisions, high frequency
# Cost: ~$0.01-0.05 per decision
# Speed: ~10-30 seconds per decision

DAY_TRADING_CONFIG = {
    # LLM Settings - Use fastest, cheapest models
    "llm_provider": "openai",
    "deep_think_llm": "gpt-4o-mini",      # Fast and cheap for quick analysis
    "quick_think_llm": "gpt-4o-mini",     # Same model for consistency
    "backend_url": "https://api.openai.com/v1",
    
    # Analyst Selection - Minimal for speed
    "selected_analysts": ["market"],       # Only technical analysis
    
    # Debate Settings - Minimal rounds
    "max_debate_rounds": 1,                # Quick decisions
    
    # Coach Settings - Disabled for speed
    "enable_coaches": False,
    "selected_coaches": [],
    
    # Risk Management - Basic
    "risk_management": {
        "enabled": True,
        "risk_per_trade_pct": 0.5,         # Conservative for day trading
        "position_sizing_method": "fixed_percentage",
        "stop_loss_method": "atr",
        "atr_multiplier": 1.5,             # Tight stops for day trading
    },
    
    # Project Settings
    "project_dir": ".",
}

# ============================================================================
# SWING TRADING CONFIGURATION (Balanced)
# ============================================================================
# Best for: Multi-day holds, balanced analysis, moderate frequency
# Cost: ~$0.10-0.30 per decision
# Speed: ~30-60 seconds per decision

SWING_TRADING_CONFIG = {
    # LLM Settings - Balanced performance
    "llm_provider": "openai",
    "deep_think_llm": "gpt-4o-mini",      # Good balance of cost/quality
    "quick_think_llm": "gpt-4o-mini",
    "backend_url": "https://api.openai.com/v1",
    
    # Analyst Selection - Core analysts
    "selected_analysts": ["market", "fundamentals"],
    
    # Debate Settings - Moderate depth
    "max_debate_rounds": 1,
    
    # Coach Settings - Optional
    "enable_coaches": False,               # Can enable if you have Discord setup
    "selected_coaches": [],
    
    # Risk Management - Standard
    "risk_management": {
        "enabled": True,
        "risk_per_trade_pct": 1.0,
        "position_sizing_method": "fixed_percentage",
        "stop_loss_method": "atr",
        "atr_multiplier": 2.0,
        "min_risk_reward_ratio": 2.0,
    },
    
    # Project Settings
    "project_dir": ".",
}

# ============================================================================
# LONG-TERM INVESTING CONFIGURATION (Thorough)
# ============================================================================
# Best for: Position trading, comprehensive analysis, low frequency
# Cost: ~$0.50-1.50 per decision
# Speed: ~1-3 minutes per decision

LONG_TERM_CONFIG = {
    # LLM Settings - High quality analysis
    "llm_provider": "openai",
    "deep_think_llm": "gpt-4o",           # Best quality for important decisions
    "quick_think_llm": "gpt-4o-mini",     # Cheaper for simple tasks
    "backend_url": "https://api.openai.com/v1",
    
    # Analyst Selection - Comprehensive
    "selected_analysts": ["market", "fundamentals", "news"],
    
    # Debate Settings - Thorough analysis
    "max_debate_rounds": 2,                # More debate for better decisions
    
    # Coach Settings - Optional
    "enable_coaches": False,
    "selected_coaches": [],
    
    # Risk Management - Conservative
    "risk_management": {
        "enabled": True,
        "risk_per_trade_pct": 2.0,         # Larger positions for long-term
        "position_sizing_method": "fixed_percentage",
        "stop_loss_method": "support_resistance",
        "min_risk_reward_ratio": 3.0,      # Higher R:R for long-term
        "max_portfolio_risk_pct": 10.0,
    },
    
    # Project Settings
    "project_dir": ".",
}

# ============================================================================
# ULTRA-LOW COST CONFIGURATION (Maximum Savings)
# ============================================================================
# Best for: Testing, learning, budget-conscious users
# Cost: ~$0.005-0.02 per decision
# Speed: ~5-15 seconds per decision

ULTRA_LOW_COST_CONFIG = {
    # LLM Settings - Cheapest possible
    "llm_provider": "openai",
    "deep_think_llm": "gpt-4o-mini",
    "quick_think_llm": "gpt-4o-mini",
    "backend_url": "https://api.openai.com/v1",
    
    # Analyst Selection - Single analyst
    "selected_analysts": ["market"],
    
    # Debate Settings - Minimal
    "max_debate_rounds": 1,
    
    # Coach Settings - Disabled
    "enable_coaches": False,
    "selected_coaches": [],
    
    # Risk Management - Basic
    "risk_management": {
        "enabled": True,
        "risk_per_trade_pct": 1.0,
        "position_sizing_method": "fixed_percentage",
    },
    
    # Project Settings
    "project_dir": ".",
}

# ============================================================================
# PREMIUM CONFIGURATION (Maximum Quality)
# ============================================================================
# Best for: High-stakes decisions, maximum analysis depth
# Cost: ~$2-5 per decision
# Speed: ~3-5 minutes per decision

PREMIUM_CONFIG = {
    # LLM Settings - Best available models
    "llm_provider": "openai",
    "deep_think_llm": "gpt-4o",           # Best reasoning
    "quick_think_llm": "gpt-4o",          # Consistent quality
    "backend_url": "https://api.openai.com/v1",
    
    # Analyst Selection - All analysts
    "selected_analysts": ["market", "fundamentals", "news", "social"],
    
    # Debate Settings - Maximum depth
    "max_debate_rounds": 3,
    
    # Coach Settings - All coaches if available
    "enable_coaches": True,
    "selected_coaches": ["coach_d", "coach_i", "coach_s", "coach_n"],
    "discord_webhooks": {
        # Add your webhook URLs here if using coaches
    },
    
    # Risk Management - Comprehensive
    "risk_management": {
        "enabled": True,
        "risk_per_trade_pct": 1.5,
        "position_sizing_method": "kelly",
        "stop_loss_method": "atr",
        "atr_multiplier": 2.5,
        "min_risk_reward_ratio": 2.5,
        "max_portfolio_risk_pct": 8.0,
        "enable_portfolio_assessment": True,
    },
    
    # Project Settings
    "project_dir": ".",
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_config(preset: str = "swing_trading"):
    """
    Get a configuration preset by name.
    
    Args:
        preset: One of "day_trading", "swing_trading", "long_term", 
                "ultra_low_cost", or "premium"
    
    Returns:
        Configuration dictionary
    """
    presets = {
        "day_trading": DAY_TRADING_CONFIG,
        "swing_trading": SWING_TRADING_CONFIG,
        "long_term": LONG_TERM_CONFIG,
        "ultra_low_cost": ULTRA_LOW_COST_CONFIG,
        "premium": PREMIUM_CONFIG,
    }
    
    if preset not in presets:
        raise ValueError(f"Unknown preset: {preset}. Choose from {list(presets.keys())}")
    
    return presets[preset].copy()


def customize_config(base_preset: str, **overrides):
    """
    Start with a preset and customize specific settings.
    
    Example:
        config = customize_config(
            "swing_trading",
            selected_analysts=["market", "fundamentals", "news"],
            max_debate_rounds=2
        )
    
    Args:
        base_preset: Name of the base preset
        **overrides: Settings to override
    
    Returns:
        Customized configuration dictionary
    """
    config = get_config(base_preset)
    config.update(overrides)
    return config


def print_config_comparison():
    """Print a comparison table of all presets."""
    print("\n" + "="*80)
    print("CONFIGURATION PRESETS COMPARISON")
    print("="*80)
    
    presets = [
        ("Ultra Low Cost", ULTRA_LOW_COST_CONFIG),
        ("Day Trading", DAY_TRADING_CONFIG),
        ("Swing Trading", SWING_TRADING_CONFIG),
        ("Long-Term", LONG_TERM_CONFIG),
        ("Premium", PREMIUM_CONFIG),
    ]
    
    print(f"\n{'Preset':<20} {'Model':<15} {'Analysts':<10} {'Rounds':<8} {'Est. Cost':<12} {'Speed'}")
    print("-"*80)
    
    costs = ["$0.005-0.02", "$0.01-0.05", "$0.10-0.30", "$0.50-1.50", "$2-5"]
    speeds = ["5-15s", "10-30s", "30-60s", "1-3m", "3-5m"]
    
    for i, (name, config) in enumerate(presets):
        model = config["deep_think_llm"]
        analysts = len(config["selected_analysts"])
        rounds = config["max_debate_rounds"]
        cost = costs[i]
        speed = speeds[i]
        
        print(f"{name:<20} {model:<15} {analysts:<10} {rounds:<8} {cost:<12} {speed}")
    
    print("\n" + "="*80)
    print("Choose based on your needs:")
    print("  • Ultra Low Cost: Testing and learning")
    print("  • Day Trading: Fast decisions, minimal cost")
    print("  • Swing Trading: Balanced approach (RECOMMENDED)")
    print("  • Long-Term: Thorough analysis for important decisions")
    print("  • Premium: Maximum quality for high-stakes trades")
    print("="*80 + "\n")


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

if __name__ == "__main__":
    # Print comparison table
    print_config_comparison()
    
    # Example 1: Use a preset directly
    print("\nExample 1: Using swing trading preset")
    config = get_config("swing_trading")
    print(f"Analysts: {config['selected_analysts']}")
    print(f"Model: {config['deep_think_llm']}")
    
    # Example 2: Customize a preset
    print("\nExample 2: Customizing day trading preset")
    custom_config = customize_config(
        "day_trading",
        selected_analysts=["market", "fundamentals"],  # Add fundamentals
        max_debate_rounds=2  # More thorough analysis
    )
    print(f"Analysts: {custom_config['selected_analysts']}")
    print(f"Rounds: {custom_config['max_debate_rounds']}")
    
    # Example 3: Use with TradingAgentsGraph
    print("\nExample 3: Creating trading graph with preset")
    print("```python")
    print("from tradingagents.graph.trading_graph import TradingAgentsGraph")
    print("from examples.config_presets import get_config")
    print("")
    print("# Use swing trading preset")
    print("config = get_config('swing_trading')")
    print("graph = TradingAgentsGraph(config=config)")
    print("")
    print("# Run a trade decision")
    print("state, signal = graph.propagate('AAPL', '2024-01-15')")
    print("```")
