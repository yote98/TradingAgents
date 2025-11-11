"""
Service layer for Discord integration business logic.

Handles validation, authorization, and data formatting between
Discord bot/API and storage layer.
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import re

from .storage import StorageManager


logger = logging.getLogger(__name__)


class PlanService:
    """Business logic layer for coach plan management."""
    
    # Valid coach names (single letters)
    VALID_COACHES = ['d', 'i', 's', 'n']
    
    # Coach name mappings for display
    COACH_DISPLAY_NAMES = {
        'd': 'Coach D (Day Trading)',
        'i': 'Coach I (Intraday)',
        's': 'Coach S (Swing)',
        'n': 'Coach N (News/Events)'
    }
    
    def __init__(self, storage: StorageManager):
        """
        Initialize service with storage dependency.
        
        Args:
            storage: StorageManager instance for data persistence
        """
        self.storage = storage
        logger.info("PlanService initialized")
    
    def validate_coach_name(self, coach_name: str) -> Tuple[bool, Optional[str]]:
        """
        Validate coach name.
        
        Args:
            coach_name: Coach identifier to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not coach_name:
            return False, "Coach name is required"
        
        coach_lower = coach_name.lower().strip()
        
        if coach_lower not in self.VALID_COACHES:
            valid_list = ', '.join(self.VALID_COACHES)
            return False, f"Invalid coach name '{coach_name}'. Valid coaches: {valid_list}"
        
        return True, None
    
    def extract_chart_urls(self, attachments: List[Any]) -> List[str]:
        """
        Extract chart URLs from Discord message attachments.
        
        Args:
            attachments: List of Discord attachment objects
            
        Returns:
            List of chart URLs (images only)
        """
        chart_urls = []
        
        if not attachments:
            return chart_urls
        
        # Image extensions to accept
        image_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
        
        for attachment in attachments:
            # Check if attachment has required attributes
            if not hasattr(attachment, 'url') or not hasattr(attachment, 'filename'):
                logger.warning(f"Attachment missing url or filename: {attachment}")
                continue
            
            # Check if it's an image
            filename_lower = attachment.filename.lower()
            if any(filename_lower.endswith(ext) for ext in image_extensions):
                chart_urls.append(attachment.url)
                logger.info(f"Extracted chart URL: {attachment.filename}")
            else:
                logger.debug(f"Skipped non-image attachment: {attachment.filename}")
        
        return chart_urls
    
    def process_plan_message(
        self,
        coach_name: str,
        plan_text: str,
        author: str,
        date: Optional[str] = None,
        channel: Optional[str] = None,
        attachments: Optional[List[Any]] = None
    ) -> Tuple[bool, str, Optional[int]]:
        """
        Process and save a plan message from Discord.
        
        Args:
            coach_name: Coach identifier (d, i, s, n)
            plan_text: Plan content
            author: Discord username
            date: Date in YYYY-MM-DD format (defaults to today)
            channel: Discord channel name
            attachments: List of Discord attachment objects
            
        Returns:
            Tuple of (success, message, plan_id)
        """
        logger.info(f"Processing plan from {author} for coach {coach_name}")
        
        # Validate coach name
        is_valid, error_msg = self.validate_coach_name(coach_name)
        if not is_valid:
            logger.warning(f"Invalid coach name: {error_msg}")
            return False, error_msg, None
        
        # Normalize coach name
        coach_name = f"coach_{coach_name.lower().strip()}"
        
        # Validate plan text
        if not plan_text or not plan_text.strip():
            error_msg = "Plan text cannot be empty"
            logger.warning(error_msg)
            return False, error_msg, None
        
        plan_text = plan_text.strip()
        
        # Use today's date if not provided
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Validate date format
        if not self._validate_date_format(date):
            error_msg = f"Invalid date format '{date}'. Use YYYY-MM-DD"
            logger.warning(error_msg)
            return False, error_msg, None
        
        # Extract chart URLs
        chart_urls = self.extract_chart_urls(attachments) if attachments else []
        
        # Log plan details
        logger.info(f"Plan details: coach={coach_name}, date={date}, "
                   f"author={author}, charts={len(chart_urls)}")
        
        try:
            # Save plan to storage
            plan_id = self.storage.save_plan(
                coach_name=coach_name,
                date=date,
                plan=plan_text,
                author=author,
                channel=channel,
                chart_urls=chart_urls
            )
            
            # Build success message
            chart_info = f" with {len(chart_urls)} chart(s)" if chart_urls else ""
            success_msg = (
                f"✅ Plan recorded for **{self.COACH_DISPLAY_NAMES.get(coach_name.split('_')[1], coach_name)}** "
                f"on {date}{chart_info}\n"
                f"Preview: {plan_text[:100]}{'...' if len(plan_text) > 100 else ''}"
            )
            
            logger.info(f"Successfully saved plan {plan_id}")
            return True, success_msg, plan_id
            
        except Exception as e:
            error_msg = f"Failed to save plan: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg, None
    
    def edit_plan(
        self,
        coach_name: str,
        date: str,
        new_plan_text: str,
        author: str
    ) -> Tuple[bool, str]:
        """
        Edit an existing plan with authorization check.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            new_plan_text: New plan content
            author: Username requesting the edit
            
        Returns:
            Tuple of (success, message)
        """
        logger.info(f"Edit request from {author} for coach {coach_name} on {date}")
        
        # Validate coach name
        is_valid, error_msg = self.validate_coach_name(coach_name)
        if not is_valid:
            return False, error_msg
        
        coach_name = f"coach_{coach_name.lower().strip()}"
        
        # Validate new plan text
        if not new_plan_text or not new_plan_text.strip():
            return False, "New plan text cannot be empty"
        
        # Get existing plan
        existing_plan = self.storage.get_plan(coach_name, date)
        if not existing_plan:
            return False, f"No plan found for {coach_name} on {date}"
        
        # Authorization check: only original author can edit
        if existing_plan['author'] != author:
            error_msg = (
                f"❌ Authorization failed: Only {existing_plan['author']} "
                f"can edit this plan"
            )
            logger.warning(f"Edit denied for {author}: not original author")
            return False, error_msg
        
        try:
            # Update plan
            success = self.storage.update_plan(
                coach_name=coach_name,
                date=date,
                plan=new_plan_text.strip(),
                author=author
            )
            
            if success:
                success_msg = f"✅ Plan updated for {coach_name} on {date}"
                logger.info(f"Plan edited successfully by {author}")
                return True, success_msg
            else:
                return False, "Failed to update plan"
                
        except Exception as e:
            error_msg = f"Error updating plan: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg
    
    def delete_plan(
        self,
        coach_name: str,
        date: str,
        author: str
    ) -> Tuple[bool, str]:
        """
        Delete a plan with authorization check.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            author: Username requesting the deletion
            
        Returns:
            Tuple of (success, message)
        """
        logger.info(f"Delete request from {author} for coach {coach_name} on {date}")
        
        # Validate coach name
        is_valid, error_msg = self.validate_coach_name(coach_name)
        if not is_valid:
            return False, error_msg
        
        coach_name = f"coach_{coach_name.lower().strip()}"
        
        # Get existing plan
        existing_plan = self.storage.get_plan(coach_name, date)
        if not existing_plan:
            return False, f"No plan found for {coach_name} on {date}"
        
        # Authorization check: only original author can delete
        if existing_plan['author'] != author:
            error_msg = (
                f"❌ Authorization failed: Only {existing_plan['author']} "
                f"can delete this plan"
            )
            logger.warning(f"Delete denied for {author}: not original author")
            return False, error_msg
        
        try:
            # Delete plan
            success = self.storage.delete_plan(coach_name, date)
            
            if success:
                success_msg = f"✅ Plan deleted for {coach_name} on {date}"
                logger.info(f"Plan deleted successfully by {author}")
                return True, success_msg
            else:
                return False, "Failed to delete plan"
                
        except Exception as e:
            error_msg = f"Error deleting plan: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg
    
    def get_plan_for_api(
        self,
        coach_name: str,
        date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get plan formatted for API response.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            Dictionary with plan data formatted for API
        """
        # Validate coach name
        is_valid, error_msg = self.validate_coach_name(coach_name)
        if not is_valid:
            logger.warning(f"API request with invalid coach: {error_msg}")
            return {
                'plan': f"Invalid coach name: {coach_name}",
                'charts': [],
                'error': error_msg
            }
        
        coach_name = f"coach_{coach_name.lower().strip()}"
        
        # Use today's date if not provided
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        logger.info(f"API request for {coach_name} on {date}")
        
        try:
            # Get plan from storage
            plan_data = self.storage.get_plan(coach_name, date)
            
            if plan_data:
                # Format response
                return {
                    'plan': plan_data['plan'],
                    'charts': plan_data.get('charts', []),
                    'author': plan_data['author'],
                    'created_at': plan_data['created_at'],
                    'edited_at': plan_data.get('edited_at'),
                    'channel': plan_data.get('channel')
                }
            else:
                # No plan found
                return {
                    'plan': f"No plan available for {coach_name} on {date}",
                    'charts': []
                }
                
        except Exception as e:
            logger.error(f"Error getting plan for API: {e}", exc_info=True)
            return {
                'plan': f"Error retrieving plan: {str(e)}",
                'charts': [],
                'error': str(e)
            }
    
    def get_all_plans_for_api(self, date: Optional[str] = None) -> Dict[str, Any]:
        """
        Get all coach plans for a date formatted for API response.
        
        Args:
            date: Date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            Dictionary mapping coach names to plan data
        """
        # Use today's date if not provided
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        logger.info(f"API request for all plans on {date}")
        
        try:
            # Get all plans from storage
            plans = self.storage.get_plans_by_date(date)
            
            # Format response
            result = {}
            for coach_name, plan_data in plans.items():
                result[coach_name] = {
                    'plan': plan_data['plan'],
                    'charts': plan_data.get('charts', []),
                    'author': plan_data['author'],
                    'created_at': plan_data['created_at'],
                    'edited_at': plan_data.get('edited_at')
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting all plans for API: {e}", exc_info=True)
            return {'error': str(e)}
    
    def get_plan_history(
        self,
        coach_name: str,
        date: str
    ) -> Tuple[bool, Any]:
        """
        Get edit history for a plan.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            
        Returns:
            Tuple of (success, history_data or error_message)
        """
        # Validate coach name
        is_valid, error_msg = self.validate_coach_name(coach_name)
        if not is_valid:
            return False, error_msg
        
        coach_name = f"coach_{coach_name.lower().strip()}"
        
        try:
            history = self.storage.get_plan_history(coach_name, date)
            return True, history
        except Exception as e:
            logger.error(f"Error getting plan history: {e}", exc_info=True)
            return False, str(e)
    
    def _validate_date_format(self, date: str) -> bool:
        """
        Validate date format (YYYY-MM-DD).
        
        Args:
            date: Date string to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            datetime.strptime(date, '%Y-%m-%d')
            return True
        except ValueError:
            return False
