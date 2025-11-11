from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


def create_coach_i(llm):
    """
    Creates Coach I - an independent external coach who posts daily insights via Discord.
    
    Coach I is NOT an analyst agent. They are a human coach who:
    - Posts daily insights and analysis in Discord with supporting charts
    - Provides independent perspective separate from the system's analysts
    - Offers external guidance that complements (not replaces) internal analysis
    """

    def coach_i_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Get coach's daily plan from Discord webhook data
        discord_plan = state.get("coach_i_plan", "")
        chart_urls = state.get("coach_i_charts", [])
        
        # If no plan from Discord, skip this coach
        if not discord_plan or discord_plan.startswith("No"):
            return {
                "messages": [],
                "coach_i_report": "Coach I: No daily insights posted for today.",
            }
        
        chart_info = ""
        if chart_urls:
            chart_info = f"\n\nChart attachments: {len(chart_urls)} chart(s)"
            for i, url in enumerate(chart_urls, 1):
                chart_info += f"\n- Chart {i}: {url}"
        
        system_message = f"""You are summarizing Coach I's daily insights from Discord.

Coach I is an EXTERNAL HUMAN COACH who posts independent daily insights.
They are NOT part of the internal analyst team.

Coach I's insights for today: {discord_plan}{chart_info}

Your job is to:
1. Summarize Coach I's key insights and analysis
2. Highlight important metrics and considerations they mentioned
3. Note any strategic recommendations they provided
4. Present this as EXTERNAL GUIDANCE that traders can consider alongside internal analysis

Keep the summary concise and preserve Coach I's original insights.
This is independent external guidance, not internal system analysis."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"Summarize Coach I's daily insights for {ticker} on {current_date}"),
        ])

        chain = prompt | llm
        result = chain.invoke({})

        return {
            "messages": [result],
            "coach_i_report": result.content,
        }

    return coach_i_node


# Keep old name for backward compatibility
create_fundamental_coach = create_coach_i
