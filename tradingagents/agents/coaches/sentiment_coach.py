from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


def create_coach_s(llm):
    """
    Creates Coach S - an independent external coach who posts daily sentiment insights via Discord.
    
    Coach S is NOT an analyst agent. They are a human coach who:
    - Posts daily sentiment and positioning analysis in Discord with charts
    - Provides independent perspective separate from the system's analysts
    - Offers external guidance that complements (not replaces) internal analysis
    """

    def coach_s_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Get coach's daily plan from Discord webhook data
        discord_plan = state.get("coach_s_plan", "")
        chart_urls = state.get("coach_s_charts", [])
        
        # If no plan from Discord, skip this coach
        if not discord_plan or discord_plan.startswith("No"):
            return {
                "messages": [],
                "coach_s_report": "Coach S: No daily sentiment analysis posted for today.",
            }
        
        chart_info = ""
        if chart_urls:
            chart_info = f"\n\nChart attachments: {len(chart_urls)} chart(s)"
            for i, url in enumerate(chart_urls, 1):
                chart_info += f"\n- Chart {i}: {url}"
        
        system_message = f"""You are summarizing Coach S's daily sentiment analysis from Discord.

Coach S is an EXTERNAL HUMAN COACH who posts independent sentiment and positioning analysis.
They are NOT part of the internal analyst team.

Coach S's analysis for today: {discord_plan}{chart_info}

Your job is to:
1. Summarize Coach S's sentiment assessment and positioning insights
2. Highlight key sentiment indicators and crowd behavior they mentioned
3. Note any contrarian opportunities they identified
4. Present this as EXTERNAL GUIDANCE that traders can consider alongside internal analysis

Keep the summary concise and preserve Coach S's original insights.
This is independent external guidance, not internal system analysis."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"Summarize Coach S's sentiment analysis for {ticker} on {current_date}"),
        ])

        chain = prompt | llm
        result = chain.invoke({})

        return {
            "messages": [result],
            "coach_s_report": result.content,
        }

    return coach_s_node


# Keep old name for backward compatibility
create_sentiment_coach = create_coach_s
