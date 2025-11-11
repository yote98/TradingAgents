import requests
import json
from typing import Dict, Optional
from datetime import datetime


class DiscordWebhookClient:
    """Client for fetching coach daily plans from Discord webhooks."""

    def __init__(self, webhook_urls: Dict[str, str]):
        """
        Initialize Discord webhook client.
        
        Args:
            webhook_urls: Dictionary mapping coach names to their webhook URLs
                Example: {
                    "technical_coach": "https://discord.com/api/webhooks/...",
                    "fundamental_coach": "https://discord.com/api/webhooks/...",
                    "sentiment_coach": "https://discord.com/api/webhooks/...",
                    "macro_coach": "https://discord.com/api/webhooks/..."
                }
        """
        self.webhook_urls = webhook_urls
        self.cache = {}  # Cache plans by date

    def fetch_coach_plan(self, coach_name: str, date: str = None) -> Dict[str, any]:
        """
        Fetch daily plan and charts for a specific coach from Discord.
        
        Args:
            coach_name: Name of the coach (e.g., "coach_d")
            date: Trading date (defaults to today)
            
        Returns:
            Dictionary with 'plan' (str) and 'charts' (list of URLs)
        """
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        cache_key = f"{coach_name}_{date}"
        
        # Check cache first
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        webhook_url = self.webhook_urls.get(coach_name)
        if not webhook_url:
            return {
                "plan": f"No webhook configured for {coach_name}",
                "charts": []
            }
        
        try:
            # Fetch messages from Discord webhook
            # Note: Discord webhooks are typically for sending, not receiving
            # For receiving, you'd need to use Discord bot API or a custom endpoint
            # This is a placeholder for the actual implementation
            
            # Option 1: Use Discord Bot API to fetch channel messages
            # Option 2: Use a custom server that receives webhook POSTs from Discord
            # Option 3: Read from a shared database/file that Discord bot updates
            
            # For now, return a placeholder
            result = self._fetch_from_custom_endpoint(webhook_url, coach_name, date)
            
            # Cache the result
            self.cache[cache_key] = result
            return result
            
        except Exception as e:
            return {
                "plan": f"Error fetching plan for {coach_name}: {str(e)}",
                "charts": []
            }

    def _fetch_from_custom_endpoint(self, webhook_url: str, coach_name: str, date: str) -> Dict[str, any]:
        """
        Fetch coach plan and charts from a custom endpoint.
        
        This assumes you have a server that:
        1. Receives Discord messages via webhook
        2. Stores them in a database with chart attachments
        3. Exposes a GET endpoint to retrieve plans and charts
        
        Replace this with your actual implementation.
        """
        try:
            # Convert webhook URL to a GET endpoint
            # Example: https://your-server.com/api/coach-plans?coach=coach_d&date=2024-05-10
            base_url = webhook_url.replace("/webhooks/", "/api/coach-plans/")
            response = requests.get(
                base_url,
                params={"coach": coach_name, "date": date},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "plan": data.get("plan", "No plan available for today"),
                    "charts": data.get("charts", [])
                }
            else:
                return {
                    "plan": f"No plan available for {date}",
                    "charts": []
                }
                
        except requests.RequestException as e:
            return {
                "plan": f"Could not fetch plan: {str(e)}",
                "charts": []
            }

    def fetch_all_coach_plans(self, date: str = None) -> Dict[str, any]:
        """
        Fetch daily plans and charts for all configured coaches.
        
        Args:
            date: Trading date (defaults to today)
            
        Returns:
            Dictionary mapping coach names to their plans and charts
        """
        result = {}
        for coach_name in self.webhook_urls.keys():
            if coach_name == "summary_webhook":
                continue  # Skip the summary webhook
            
            data = self.fetch_coach_plan(coach_name, date)
            result[f"{coach_name}_plan"] = data.get("plan", "")
            result[f"{coach_name}_charts"] = data.get("charts", [])
        return result

    def send_trading_summary(self, webhook_url: str, summary: Dict) -> bool:
        """
        Send trading summary back to Discord.
        
        Args:
            webhook_url: Discord webhook URL to send to
            summary: Trading summary data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Format the summary as a Discord embed
            embed = {
                "title": f"Trading Summary - {summary.get('ticker', 'N/A')}",
                "description": summary.get("decision", "No decision"),
                "color": self._get_color_for_decision(summary.get("decision", "")),
                "fields": [
                    {
                        "name": "Date",
                        "value": summary.get("date", "N/A"),
                        "inline": True
                    },
                    {
                        "name": "Action",
                        "value": summary.get("action", "N/A"),
                        "inline": True
                    },
                ],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            payload = {
                "embeds": [embed]
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            return response.status_code == 204
            
        except Exception as e:
            print(f"Error sending to Discord: {e}")
            return False

    def _get_color_for_decision(self, decision: str) -> int:
        """Get Discord embed color based on trading decision."""
        decision_lower = decision.lower()
        if "buy" in decision_lower:
            return 0x00FF00  # Green
        elif "sell" in decision_lower:
            return 0xFF0000  # Red
        else:
            return 0xFFFF00  # Yellow for HOLD
