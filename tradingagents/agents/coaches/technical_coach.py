from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


def create_coach_d(llm):
    """
    Creates Coach D - an independent external coach who posts daily trading plans via Discord.
    
    Coach D is NOT an analyst agent. They are a human coach who:
    - Posts daily trading plans in Discord with TradingView/TPO charts
    - Provides independent perspective separate from the system's analysts
    - Offers external guidance that complements (not replaces) internal analysis
    """

    def coach_d_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Get coach's daily plan from Discord webhook data
        discord_plan = state.get("coach_d_plan", "")
        chart_urls = state.get("coach_d_charts", [])
        
        # If no plan from Discord, skip this coach
        if not discord_plan or discord_plan.startswith("No"):
            return {
                "messages": [],
                "coach_d_report": "Coach D: No daily plan posted for today.",
            }
        
        chart_info = ""
        if chart_urls:
            chart_info = f"\n\nChart attachments: {len(chart_urls)} chart(s)"
            for i, url in enumerate(chart_urls, 1):
                chart_info += f"\n- Chart {i}: {url}"
        
        system_message = f"""You are summarizing Coach D's daily trading plan from Discord.

Coach D is an EXTERNAL HUMAN COACH who posts independent daily trading plans.
They are NOT part of the internal analyst team.

Coach D's plan for today: {discord_plan}{chart_info}

Your job is to:
1. Summarize Coach D's key points and chart analysis
2. Highlight the levels, setups, and strategies they mentioned
3. Note any specific risk management guidance they provided
4. Present this as EXTERNAL GUIDANCE that traders can consider alongside internal analysis

Keep the summary concise and preserve Coach D's original insights.
This is independent external guidance, not internal system analysis."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"Summarize Coach D's daily plan for {ticker} on {current_date}"),
        ])

        chain = prompt | llm
        result = chain.invoke({})

        return {
            "messages": [result],
            "coach_d_report": result.content,
        }

    return coach_d_node


# Keep old name for backward compatibility
create_technical_coach = create_coach_d
