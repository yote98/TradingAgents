from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


def create_coach_n(llm):
    """
    Creates Coach N - an independent external coach who posts daily narrative and context via Discord.
    
    Coach N is NOT an analyst agent. They are a human coach who:
    - Posts daily market narrative and context in Discord with charts
    - Provides independent perspective separate from the system's analysts
    - Offers external guidance that complements (not replaces) internal analysis
    """

    def coach_n_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Get coach's daily plan from Discord webhook data
        discord_plan = state.get("coach_n_plan", "")
        chart_urls = state.get("coach_n_charts", [])
        
        # If no plan from Discord, skip this coach
        if not discord_plan or discord_plan.startswith("No"):
            return {
                "messages": [],
                "coach_n_report": "Coach N: No daily narrative posted for today.",
            }
        
        chart_info = ""
        if chart_urls:
            chart_info = f"\n\nChart attachments: {len(chart_urls)} chart(s)"
            for i, url in enumerate(chart_urls, 1):
                chart_info += f"\n- Chart {i}: {url}"
        
        system_message = f"""You are summarizing Coach N's daily market narrative from Discord.

Coach N is an EXTERNAL HUMAN COACH who posts independent market narrative and context.
They are NOT part of the internal analyst team.

Coach N's narrative for today: {discord_plan}{chart_info}

Your job is to:
1. Summarize Coach N's key narrative themes and market context
2. Highlight important events, catalysts, and dynamics they mentioned
3. Note any strategic perspective they provided
4. Present this as EXTERNAL GUIDANCE that traders can consider alongside internal analysis

Keep the summary concise and preserve Coach N's original insights.
This is independent external guidance, not internal system analysis."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"Summarize Coach N's market narrative for {ticker} on {current_date}"),
        ])

        chain = prompt | llm
        result = chain.invoke({})

        return {
            "messages": [result],
            "coach_n_report": result.content,
        }

    return coach_n_node


# Keep old name for backward compatibility
create_macro_coach = create_coach_n
