"""Coach plans resource implementation"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from ..protocol.schemas import Resource, ResourceResult

logger = logging.getLogger(__name__)


class CoachPlansResource:
    """
    Coach plans resource for accessing human coach guidance.
    
    This resource provides access to coach plans stored in the Discord
    enhanced storage system. Plans can be filtered by ticker symbol and
    are automatically limited to the last 30 days.
    """
    
    RESOURCE_URI_TEMPLATE = "coach://plans/{ticker}"
    RESOURCE_NAME = "coach_plans"
    RESOURCE_DESCRIPTION = (
        "Access human coach trading plans and guidance from Discord. "
        "Plans include technical analysis, fundamental insights, sentiment analysis, "
        "and news commentary from experienced traders. "
        "Automatically filtered to last 30 days of plans."
    )
    
    def __init__(self, storage_manager: Any):
        """
        Initialize the coach plans resource.
        
        Args:
            storage_manager: StorageManager instance from Discord enhanced integration
        """
        self.storage = storage_manager
    
    def get_resource_definition(self) -> Resource:
        """
        Get the MCP resource definition.
        
        Returns:
            Resource definition with URI template and description
        """
        return Resource(
            uri_template=self.RESOURCE_URI_TEMPLATE,
            name=self.RESOURCE_NAME,
            description=self.RESOURCE_DESCRIPTION,
            mime_type="application/json"
        )
    
    async def read(
        self,
        ticker: Optional[str] = None,
        days: int = 30
    ) -> ResourceResult:
        """
        Read coach plans, optionally filtered by ticker.
        
        Args:
            ticker: Optional stock ticker to filter plans (e.g., "AAPL")
            days: Number of days to look back (default: 30, max: 90)
            
        Returns:
            ResourceResult with coach plans data or error
        """
        try:
            # Validate days parameter
            days = min(max(1, days), 90)  # Clamp between 1 and 90
            
            logger.info(
                f"Reading coach plans for ticker={ticker}, days={days}",
                extra={"ticker": ticker, "days": days}
            )
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Fetch plans from storage
            all_plans = self._fetch_plans_in_range(start_date, end_date)
            
            if not all_plans:
                return ResourceResult(
                    success=True,
                    data={
                        "ticker": ticker,
                        "days": days,
                        "plans": [],
                        "message": f"No coach plans found in the last {days} days"
                    }
                )
            
            # Filter by ticker if specified
            if ticker:
                filtered_plans = self._filter_by_ticker(all_plans, ticker.upper())
            else:
                filtered_plans = all_plans
            
            # Format response
            response = {
                "ticker": ticker,
                "days": days,
                "date_range": {
                    "start": start_date.strftime("%Y-%m-%d"),
                    "end": end_date.strftime("%Y-%m-%d")
                },
                "total_plans": len(filtered_plans),
                "plans": self._format_plans(filtered_plans)
            }
            
            logger.info(
                f"Retrieved {len(filtered_plans)} coach plans",
                extra={"ticker": ticker, "count": len(filtered_plans)}
            )
            
            return ResourceResult(
                success=True,
                data=response
            )
            
        except Exception as e:
            logger.exception(f"Error reading coach plans: {e}")
            return ResourceResult(
                success=False,
                error={
                    "code": 500,
                    "message": f"Internal error reading coach plans: {str(e)}"
                }
            )
    
    def _fetch_plans_in_range(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Fetch all plans within date range.
        
        Args:
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            List of plan dictionaries
        """
        all_plans = []
        
        # Iterate through each day in range
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            
            # Get plans for this date
            daily_plans = self.storage.get_plans_by_date(date_str)
            
            # Add each coach's plan to the list
            for coach_name, plan_data in daily_plans.items():
                all_plans.append({
                    "coach": coach_name,
                    "date": date_str,
                    "plan": plan_data.get("plan", ""),
                    "author": plan_data.get("author", "unknown"),
                    "channel": plan_data.get("channel"),
                    "charts": plan_data.get("charts", []),
                    "created_at": plan_data.get("created_at"),
                    "edited_at": plan_data.get("edited_at")
                })
            
            current_date += timedelta(days=1)
        
        return all_plans
    
    def _filter_by_ticker(
        self,
        plans: List[Dict[str, Any]],
        ticker: str
    ) -> List[Dict[str, Any]]:
        """
        Filter plans that mention the specified ticker.
        
        Args:
            plans: List of all plans
            ticker: Ticker symbol to filter by
            
        Returns:
            Filtered list of plans
        """
        filtered = []
        
        # Common ticker formats to search for
        ticker_patterns = [
            ticker,  # AAPL
            f"${ticker}",  # $AAPL
            f"#{ticker}",  # #AAPL
            ticker.lower(),  # aapl
            f"${ticker.lower()}",  # $aapl
        ]
        
        for plan in plans:
            plan_text = plan.get("plan", "").lower()
            
            # Check if any ticker pattern appears in the plan
            if any(pattern.lower() in plan_text for pattern in ticker_patterns):
                filtered.append(plan)
        
        return filtered
    
    def _format_plans(self, plans: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format plans for response.
        
        Args:
            plans: List of plan dictionaries
            
        Returns:
            Formatted list of plans
        """
        formatted = []
        
        # Group by coach for better organization
        coaches = {}
        for plan in plans:
            coach = plan["coach"]
            if coach not in coaches:
                coaches[coach] = []
            coaches[coach].append(plan)
        
        # Format each coach's plans
        for coach, coach_plans in coaches.items():
            # Sort by date (most recent first)
            coach_plans.sort(key=lambda p: p["date"], reverse=True)
            
            formatted.append({
                "coach": self._format_coach_name(coach),
                "coach_id": coach,
                "plan_count": len(coach_plans),
                "latest_plan": coach_plans[0] if coach_plans else None,
                "all_plans": coach_plans
            })
        
        # Sort coaches by plan count (most active first)
        formatted.sort(key=lambda c: c["plan_count"], reverse=True)
        
        return formatted
    
    def _format_coach_name(self, coach_id: str) -> str:
        """
        Format coach ID to human-readable name.
        
        Args:
            coach_id: Coach identifier (e.g., "coach_d")
            
        Returns:
            Human-readable coach name
        """
        coach_names = {
            "coach_d": "Technical Coach (D)",
            "coach_i": "Fundamental Coach (I)",
            "coach_s": "Sentiment Coach (S)",
            "coach_n": "News Coach (N)"
        }
        
        return coach_names.get(coach_id, coach_id.replace("_", " ").title())
