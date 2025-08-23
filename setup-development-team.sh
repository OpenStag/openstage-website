#!/bin/bash

# Development Team Schema Setup Script
# This script creates the development_team_members table and related functionality

echo "Setting up development team schema..."

# Check if we have the Supabase URL and key
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables"
    echo "You can find these in your Supabase project settings"
    exit 1
fi

# Run the SQL file
echo "Creating development_team_members table..."
psql "$SUPABASE_URL" -f database/development_team_schema.sql

echo "Development team schema setup complete!"
echo ""
echo "The following table was created:"
echo "- development_team_members (with RLS policies and triggers)"
echo ""
echo "You can now use the development team joining functionality."
