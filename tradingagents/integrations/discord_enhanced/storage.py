"""
Storage layer for Discord integration using SQLite.

Provides persistent storage for coach plans with support for:
- CRUD operations
- Chart attachments
- Edit history
- Efficient queries
"""

import sqlite3
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import json


logger = logging.getLogger(__name__)


class StorageManager:
    """Manages persistent storage of coach plans in SQLite database."""
    
    # Database schema version for migrations
    SCHEMA_VERSION = 1
    
    def __init__(self, database_path: str):
        """
        Initialize storage manager.
        
        Args:
            database_path: Path to SQLite database file
        """
        self.database_path = database_path
        self._ensure_database_directory()
        self._initialize_database()
        
    def _ensure_database_directory(self):
        """Create database directory if it doesn't exist."""
        db_path = Path(self.database_path)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
    def _initialize_database(self):
        """Initialize database schema if not exists."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Create schema_version table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS schema_version (
                        version INTEGER PRIMARY KEY,
                        applied_at TEXT NOT NULL
                    )
                """)
                
                # Create coach_plans table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS coach_plans (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        coach_name TEXT NOT NULL,
                        date TEXT NOT NULL,
                        plan TEXT NOT NULL,
                        author TEXT NOT NULL,
                        channel TEXT,
                        created_at TEXT NOT NULL,
                        edited_at TEXT,
                        is_deleted INTEGER DEFAULT 0,
                        UNIQUE(coach_name, date)
                    )
                """)
                
                # Create plan_charts table for chart attachments
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS plan_charts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        plan_id INTEGER NOT NULL,
                        chart_url TEXT NOT NULL,
                        filename TEXT,
                        added_at TEXT NOT NULL,
                        FOREIGN KEY (plan_id) REFERENCES coach_plans(id) ON DELETE CASCADE
                    )
                """)
                
                # Create plan_history table for edit tracking
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS plan_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        plan_id INTEGER NOT NULL,
                        plan_text TEXT NOT NULL,
                        edited_by TEXT NOT NULL,
                        edited_at TEXT NOT NULL,
                        FOREIGN KEY (plan_id) REFERENCES coach_plans(id) ON DELETE CASCADE
                    )
                """)
                
                # Create indexes for common queries
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_coach_date 
                    ON coach_plans(coach_name, date)
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_date 
                    ON coach_plans(date)
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_plan_id 
                    ON plan_charts(plan_id)
                """)
                
                # Record schema version
                cursor.execute("""
                    INSERT OR IGNORE INTO schema_version (version, applied_at)
                    VALUES (?, ?)
                """, (self.SCHEMA_VERSION, datetime.now().isoformat()))
                
                conn.commit()
                logger.info(f"Database initialized at {self.database_path}")
                
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def _get_connection(self) -> sqlite3.Connection:
        """
        Get database connection with proper configuration.
        
        Returns:
            SQLite connection object
        """
        conn = sqlite3.Connection(self.database_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key constraints
        return conn
    
    def save_plan(
        self,
        coach_name: str,
        date: str,
        plan: str,
        author: str,
        channel: Optional[str] = None,
        chart_urls: Optional[List[str]] = None
    ) -> int:
        """
        Save or update a coach plan.
        
        Args:
            coach_name: Coach identifier (e.g., 'coach_d')
            date: Date in YYYY-MM-DD format
            plan: Plan text content
            author: Discord username of author
            channel: Discord channel name
            chart_urls: List of chart attachment URLs
            
        Returns:
            Plan ID
            
        Raises:
            sqlite3.Error: If database operation fails
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if plan already exists
                cursor.execute("""
                    SELECT id, plan FROM coach_plans 
                    WHERE coach_name = ? AND date = ? AND is_deleted = 0
                """, (coach_name, date))
                
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing plan
                    plan_id = existing['id']
                    old_plan = existing['plan']
                    
                    # Save to history
                    cursor.execute("""
                        INSERT INTO plan_history (plan_id, plan_text, edited_by, edited_at)
                        VALUES (?, ?, ?, ?)
                    """, (plan_id, old_plan, author, datetime.now().isoformat()))
                    
                    # Update plan
                    cursor.execute("""
                        UPDATE coach_plans 
                        SET plan = ?, edited_at = ?
                        WHERE id = ?
                    """, (plan, datetime.now().isoformat(), plan_id))
                    
                    logger.info(f"Updated plan for {coach_name} on {date}")
                else:
                    # Insert new plan
                    cursor.execute("""
                        INSERT INTO coach_plans 
                        (coach_name, date, plan, author, channel, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (coach_name, date, plan, author, channel, datetime.now().isoformat()))
                    
                    plan_id = cursor.lastrowid
                    logger.info(f"Created new plan for {coach_name} on {date}")
                
                # Handle chart URLs
                if chart_urls:
                    # Delete existing charts for this plan
                    cursor.execute("DELETE FROM plan_charts WHERE plan_id = ?", (plan_id,))
                    
                    # Insert new charts
                    for url in chart_urls:
                        filename = url.split('/')[-1] if '/' in url else None
                        cursor.execute("""
                            INSERT INTO plan_charts (plan_id, chart_url, filename, added_at)
                            VALUES (?, ?, ?, ?)
                        """, (plan_id, url, filename, datetime.now().isoformat()))
                    
                    logger.info(f"Added {len(chart_urls)} chart(s) to plan {plan_id}")
                
                conn.commit()
                return plan_id
                
        except sqlite3.Error as e:
            logger.error(f"Failed to save plan: {e}")
            raise
    
    def get_plan(self, coach_name: str, date: str) -> Optional[Dict[str, Any]]:
        """
        Get a coach plan by coach name and date.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            
        Returns:
            Dictionary with plan data or None if not found
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Get plan
                cursor.execute("""
                    SELECT * FROM coach_plans 
                    WHERE coach_name = ? AND date = ? AND is_deleted = 0
                """, (coach_name, date))
                
                row = cursor.fetchone()
                if not row:
                    return None
                
                plan_data = dict(row)
                
                # Get chart URLs
                cursor.execute("""
                    SELECT chart_url, filename FROM plan_charts 
                    WHERE plan_id = ?
                    ORDER BY added_at
                """, (plan_data['id'],))
                
                charts = [dict(chart) for chart in cursor.fetchall()]
                plan_data['charts'] = [c['chart_url'] for c in charts]
                
                return plan_data
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get plan: {e}")
            return None
    
    def get_plans_by_date(self, date: str) -> Dict[str, Dict[str, Any]]:
        """
        Get all coach plans for a specific date.
        
        Args:
            date: Date in YYYY-MM-DD format
            
        Returns:
            Dictionary mapping coach names to plan data
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Get all plans for date
                cursor.execute("""
                    SELECT * FROM coach_plans 
                    WHERE date = ? AND is_deleted = 0
                    ORDER BY coach_name
                """, (date,))
                
                plans = {}
                for row in cursor.fetchall():
                    plan_data = dict(row)
                    coach_name = plan_data['coach_name']
                    
                    # Get chart URLs
                    cursor.execute("""
                        SELECT chart_url FROM plan_charts 
                        WHERE plan_id = ?
                        ORDER BY added_at
                    """, (plan_data['id'],))
                    
                    plan_data['charts'] = [c['chart_url'] for c in cursor.fetchall()]
                    plans[coach_name] = plan_data
                
                return plans
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get plans by date: {e}")
            return {}
    
    def update_plan(
        self,
        coach_name: str,
        date: str,
        plan: str,
        author: str
    ) -> bool:
        """
        Update an existing plan.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            plan: New plan text
            author: Username making the edit
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Get existing plan
                cursor.execute("""
                    SELECT id, plan FROM coach_plans 
                    WHERE coach_name = ? AND date = ? AND is_deleted = 0
                """, (coach_name, date))
                
                row = cursor.fetchone()
                if not row:
                    logger.warning(f"Plan not found for {coach_name} on {date}")
                    return False
                
                plan_id = row['id']
                old_plan = row['plan']
                
                # Save to history
                cursor.execute("""
                    INSERT INTO plan_history (plan_id, plan_text, edited_by, edited_at)
                    VALUES (?, ?, ?, ?)
                """, (plan_id, old_plan, author, datetime.now().isoformat()))
                
                # Update plan
                cursor.execute("""
                    UPDATE coach_plans 
                    SET plan = ?, edited_at = ?
                    WHERE id = ?
                """, (plan, datetime.now().isoformat(), plan_id))
                
                conn.commit()
                logger.info(f"Updated plan {plan_id} by {author}")
                return True
                
        except sqlite3.Error as e:
            logger.error(f"Failed to update plan: {e}")
            return False
    
    def delete_plan(self, coach_name: str, date: str) -> bool:
        """
        Soft delete a plan (mark as deleted).
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    UPDATE coach_plans 
                    SET is_deleted = 1, edited_at = ?
                    WHERE coach_name = ? AND date = ? AND is_deleted = 0
                """, (datetime.now().isoformat(), coach_name, date))
                
                if cursor.rowcount > 0:
                    conn.commit()
                    logger.info(f"Deleted plan for {coach_name} on {date}")
                    return True
                else:
                    logger.warning(f"Plan not found for {coach_name} on {date}")
                    return False
                    
        except sqlite3.Error as e:
            logger.error(f"Failed to delete plan: {e}")
            return False
    
    def get_plan_history(self, coach_name: str, date: str) -> List[Dict[str, Any]]:
        """
        Get edit history for a plan.
        
        Args:
            coach_name: Coach identifier
            date: Date in YYYY-MM-DD format
            
        Returns:
            List of historical versions
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Get plan ID
                cursor.execute("""
                    SELECT id FROM coach_plans 
                    WHERE coach_name = ? AND date = ?
                """, (coach_name, date))
                
                row = cursor.fetchone()
                if not row:
                    return []
                
                plan_id = row['id']
                
                # Get history
                cursor.execute("""
                    SELECT * FROM plan_history 
                    WHERE plan_id = ?
                    ORDER BY edited_at DESC
                """, (plan_id,))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get plan history: {e}")
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get database statistics.
        
        Returns:
            Dictionary with stats (total plans, charts, etc.)
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Count active plans
                cursor.execute("SELECT COUNT(*) as count FROM coach_plans WHERE is_deleted = 0")
                total_plans = cursor.fetchone()['count']
                
                # Count charts
                cursor.execute("SELECT COUNT(*) as count FROM plan_charts")
                total_charts = cursor.fetchone()['count']
                
                # Count edits
                cursor.execute("SELECT COUNT(*) as count FROM plan_history")
                total_edits = cursor.fetchone()['count']
                
                # Get latest plan date
                cursor.execute("""
                    SELECT MAX(created_at) as latest FROM coach_plans WHERE is_deleted = 0
                """)
                latest_plan = cursor.fetchone()['latest']
                
                return {
                    'total_plans': total_plans,
                    'total_charts': total_charts,
                    'total_edits': total_edits,
                    'latest_plan': latest_plan,
                    'database_path': self.database_path
                }
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get stats: {e}")
            return {}
