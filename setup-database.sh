#!/bin/bash

# Database Setup Script for OpenStage Design Feature
# This script helps you set up the database tables in the correct order

echo "🚀 OpenStage Database Setup"
echo "=========================="
echo ""

echo "📋 Setup Options:"
echo "1. Full setup (user_schema.sql + design_schema.sql) - RECOMMENDED"
echo "2. Design only (design_schema_standalone.sql) - If you already have users"
echo "3. Manual setup instructions"
echo ""

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📁 Full Setup Selected"
        echo "====================="
        echo ""
        echo "Please run these files in your Supabase SQL Editor in this exact order:"
        echo ""
        echo "Step 1: Copy and run database/user_schema.sql"
        echo "Step 2: Copy and run database/design_schema.sql"
        echo ""
        echo "⚠️  IMPORTANT: Run them one at a time and wait for each to complete!"
        ;;
    2)
        echo ""
        echo "🎨 Design Only Setup Selected"
        echo "============================="
        echo ""
        echo "Please run this file in your Supabase SQL Editor:"
        echo ""
        echo "Step 1: Copy and run database/design_schema_standalone.sql"
        echo ""
        echo "This includes a basic profiles table if it doesn't exist."
        ;;
    3)
        echo ""
        echo "📖 Manual Setup Instructions"
        echo "============================"
        echo ""
        echo "1. Go to your Supabase project dashboard"
        echo "2. Navigate to 'SQL Editor'"
        echo "3. Click 'New Query'"
        echo "4. Copy the content from the appropriate SQL file"
        echo "5. Paste it into the editor"
        echo "6. Click 'Run' button"
        echo ""
        echo "📁 Files to use:"
        echo "- database/user_schema.sql (run first)"
        echo "- database/design_schema.sql (run second)"
        echo "OR"
        echo "- database/design_schema_standalone.sql (all-in-one)"
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "📋 After Setup:"
echo "=============="
echo "1. Start your Next.js app: npm run dev"
echo "2. Create a user account via signup"
echo "3. Visit /design page to test the feature"
echo "4. Submit a test design"
echo "5. Check your Supabase dashboard to verify data"
echo ""
echo "🔧 Environment Variables Needed:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "📚 For detailed setup info, see:"
echo "- DATABASE_SETUP.md"
echo "- DESIGN_SETUP.md"
echo ""
echo "✅ Setup guide complete!"
