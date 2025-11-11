"""
Enhanced Discord bot for coach plan management.

Provides commands for posting, editing, and viewing coach plans with
comprehensive error handling and reconnection logic.
"""

import discord
from discord.ext import commands
import logging
import asyncio
from typing import Optional
from datetime import datetime

from .service import PlanService
from .config import ConfigManager


logger = logging.getLogger(__name__)


class CoachPlanBot(commands.Bot):
    """Enhanced Discord bot for managing coach plans."""
    
    def __init__(
        self,
        config: ConfigManager,
        service: PlanService,
        *args,
        **kwargs
    ):
        """
        Initialize bot with configuration and service.
        
        Args:
            config: Configuration manager
            service: Plan service for business logic
        """
        # Set up intents
        intents = discord.Intents.default()
        intents.message_content = True
        
        # Initialize bot
        super().__init__(
            command_prefix='!',
            intents=intents,
            *args,
            **kwargs
        )
        
        self.config = config
        self.service = service
        self._reconnect_attempts = 0
        
        # Register event handlers
        self.setup_events()
        
        # Register commands
        self.setup_commands()
        
        logger.info("CoachPlanBot initialized")
    
    def setup_events(self):
        """Set up event handlers."""
        
        @self.event
        async def on_ready():
            """Handle bot ready event."""
            logger.info(f'{self.user} has connected to Discord!')
            logger.info(f'Bot is in {len(self.guilds)} guild(s)')
            
            # Log guild names
            for guild in self.guilds:
                logger.info(f'  - {guild.name} (id: {guild.id})')
            
            # Reset reconnect counter on successful connection
            self._reconnect_attempts = 0
        
        @self.event
        async def on_error(event, *args, **kwargs):
            """Handle bot errors."""
            logger.error(f'Error in event {event}', exc_info=True)
        
        @self.event
        async def on_command_error(ctx, error):
            """Handle command errors."""
            if isinstance(error, commands.CommandNotFound):
                await ctx.send(
                    f"❌ Unknown command. Use `!help` to see available commands."
                )
            elif isinstance(error, commands.MissingRequiredArgument):
                await ctx.send(
                    f"❌ Missing required argument: {error.param.name}\n"
                    f"Use `!help {ctx.command}` for usage information."
                )
            elif isinstance(error, commands.BadArgument):
                await ctx.send(f"❌ Invalid argument: {error}")
            else:
                logger.error(f'Command error in {ctx.command}', exc_info=error)
                await ctx.send(
                    f"❌ An error occurred while processing your command. "
                    f"Please try again or contact an administrator."
                )
        
        @self.event
        async def on_disconnect():
            """Handle bot disconnect."""
            logger.warning("Bot disconnected from Discord")
            self._reconnect_attempts += 1
        
        @self.event
        async def on_resumed():
            """Handle bot reconnection."""
            logger.info("Bot reconnected to Discord")
            self._reconnect_attempts = 0
    
    def setup_commands(self):
        """Set up bot commands."""
        
        @self.command(name='plan')
        async def post_plan(ctx, coach: str, *, plan_text: str):
            """
            Post a coach plan for today.
            
            Usage: !plan <coach> <plan text>
            Example: !plan d Watch for breakout above $950
            
            Coaches: d (Day), i (Intraday), s (Swing), n (News)
            You can attach chart images to your message.
            """
            logger.info(f"Plan command from {ctx.author} for coach {coach}")
            
            # Process the plan
            success, message, plan_id = self.service.process_plan_message(
                coach_name=coach,
                plan_text=plan_text,
                author=str(ctx.author),
                channel=str(ctx.channel),
                attachments=ctx.message.attachments
            )
            
            await ctx.send(message)
            
            if success:
                logger.info(f"Plan {plan_id} posted successfully")
        
        @self.command(name='edit')
        async def edit_plan(ctx, coach: str, date: Optional[str] = None, *, new_plan: str = None):
            """
            Edit your previously posted plan.
            
            Usage: !edit <coach> [date] <new plan text>
            Example: !edit d Updated: Watch for breakout above $975
            Example: !edit d 2024-01-15 Revised plan text
            
            If date is omitted, edits today's plan.
            Only the original author can edit their plan.
            """
            # Parse arguments (date is optional)
            if date and not date.startswith('20'):  # Not a date, it's part of the plan
                new_plan = f"{date} {new_plan}" if new_plan else date
                date = None
            
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            if not new_plan:
                await ctx.send("❌ Please provide the new plan text")
                return
            
            logger.info(f"Edit command from {ctx.author} for coach {coach} on {date}")
            
            # Edit the plan
            success, message = self.service.edit_plan(
                coach_name=coach,
                date=date,
                new_plan_text=new_plan,
                author=str(ctx.author)
            )
            
            await ctx.send(message)
        
        @self.command(name='delete')
        async def delete_plan(ctx, coach: str, date: Optional[str] = None):
            """
            Delete your previously posted plan.
            
            Usage: !delete <coach> [date]
            Example: !delete d
            Example: !delete d 2024-01-15
            
            If date is omitted, deletes today's plan.
            Only the original author can delete their plan.
            """
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            logger.info(f"Delete command from {ctx.author} for coach {coach} on {date}")
            
            # Delete the plan
            success, message = self.service.delete_plan(
                coach_name=coach,
                date=date,
                author=str(ctx.author)
            )
            
            await ctx.send(message)
        
        @self.command(name='plans')
        async def list_plans(ctx, date: Optional[str] = None):
            """
            List all coach plans for a specific date.
            
            Usage: !plans [date]
            Example: !plans
            Example: !plans 2024-01-15
            
            If date is omitted, shows today's plans.
            """
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            logger.info(f"Plans command from {ctx.author} for date {date}")
            
            # Get all plans
            plans = self.service.get_all_plans_for_api(date)
            
            if 'error' in plans:
                await ctx.send(f"❌ Error: {plans['error']}")
                return
            
            if not plans:
                await ctx.send(f"📋 No plans found for {date}")
                return
            
            # Build response
            response = f"📋 **Coach Plans for {date}**\n\n"
            
            for coach_name, plan_data in plans.items():
                # Extract coach letter
                coach_letter = coach_name.split('_')[1].upper()
                display_name = self.service.COACH_DISPLAY_NAMES.get(
                    coach_name.split('_')[1],
                    coach_name
                )
                
                response += f"**{display_name}** (by {plan_data['author']}):\n"
                response += f"{plan_data['plan']}\n"
                
                if plan_data.get('charts'):
                    response += f"📊 {len(plan_data['charts'])} chart(s) attached\n"
                
                if plan_data.get('edited_at'):
                    response += f"✏️ Edited\n"
                
                response += "\n"
            
            # Split response if too long (Discord limit is 2000 chars)
            if len(response) > 2000:
                chunks = [response[i:i+1900] for i in range(0, len(response), 1900)]
                for chunk in chunks:
                    await ctx.send(chunk)
            else:
                await ctx.send(response)
        
        @self.command(name='myplans')
        async def my_plans(ctx, date: Optional[str] = None):
            """
            List your own plans for a specific date.
            
            Usage: !myplans [date]
            Example: !myplans
            Example: !myplans 2024-01-15
            
            If date is omitted, shows today's plans.
            """
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            logger.info(f"MyPlans command from {ctx.author} for date {date}")
            
            # Get all plans
            all_plans = self.service.get_all_plans_for_api(date)
            
            if 'error' in all_plans:
                await ctx.send(f"❌ Error: {all_plans['error']}")
                return
            
            # Filter by author
            author = str(ctx.author)
            my_plans = {
                coach: data for coach, data in all_plans.items()
                if data['author'] == author
            }
            
            if not my_plans:
                await ctx.send(f"📋 You have no plans for {date}")
                return
            
            # Build response
            response = f"📋 **Your Plans for {date}**\n\n"
            
            for coach_name, plan_data in my_plans.items():
                display_name = self.service.COACH_DISPLAY_NAMES.get(
                    coach_name.split('_')[1],
                    coach_name
                )
                
                response += f"**{display_name}**:\n"
                response += f"{plan_data['plan']}\n"
                
                if plan_data.get('charts'):
                    response += f"📊 {len(plan_data['charts'])} chart(s)\n"
                
                if plan_data.get('edited_at'):
                    response += f"✏️ Edited\n"
                
                response += "\n"
            
            await ctx.send(response)
        
        @self.command(name='history')
        async def plan_history(ctx, coach: str, date: Optional[str] = None):
            """
            View edit history for a plan.
            
            Usage: !history <coach> [date]
            Example: !history d
            Example: !history d 2024-01-15
            
            If date is omitted, shows today's plan history.
            """
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            logger.info(f"History command from {ctx.author} for coach {coach} on {date}")
            
            # Get history
            success, result = self.service.get_plan_history(coach, date)
            
            if not success:
                await ctx.send(f"❌ Error: {result}")
                return
            
            if not result:
                await ctx.send(f"📜 No edit history found for coach {coach} on {date}")
                return
            
            # Build response
            response = f"📜 **Edit History for Coach {coach.upper()} on {date}**\n\n"
            
            for i, entry in enumerate(result, 1):
                response += f"**Edit {i}** by {entry['edited_by']} at {entry['edited_at'][:19]}:\n"
                response += f"{entry['plan_text'][:200]}{'...' if len(entry['plan_text']) > 200 else ''}\n\n"
            
            # Split if too long
            if len(response) > 2000:
                chunks = [response[i:i+1900] for i in range(0, len(response), 1900)]
                for chunk in chunks:
                    await ctx.send(chunk)
            else:
                await ctx.send(response)
    
    async def start_with_retry(self, token: str):
        """
        Start bot with automatic retry on connection failure.
        
        Args:
            token: Discord bot token
        """
        max_attempts = self.config.reconnect_attempts
        delay = self.config.reconnect_delay_seconds
        
        for attempt in range(1, max_attempts + 1):
            try:
                logger.info(f"Starting bot (attempt {attempt}/{max_attempts})...")
                await self.start(token)
                break  # Success
            except discord.LoginFailure:
                logger.error("Invalid Discord bot token")
                raise
            except Exception as e:
                logger.error(f"Failed to start bot (attempt {attempt}): {e}")
                
                if attempt < max_attempts:
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                    delay *= 2  # Exponential backoff
                else:
                    logger.error("Max reconnection attempts reached")
                    raise
    
    async def close(self):
        """Close bot connection gracefully."""
        logger.info("Closing bot connection...")
        await super().close()
        logger.info("Bot connection closed")
