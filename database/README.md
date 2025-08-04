# OpenStage Database Setup

This directory contains all the necessary SQL scripts to set up the OpenStage database with Supabase.

## Files Overview

- `schema.sql` - Complete database schema with all tables, relationships, indexes, and security policies
- `seed.sql` - Initial seed data including skills, sample projects, blog posts, and events
- `README.md` - This file with setup instructions

## Database Schema Overview

### Core Tables

1. **profiles** - Extended user profiles (linked to Supabase auth.users)
2. **skills** - Available skills in the platform
3. **user_skills** - User-skill relationships with proficiency levels
4. **projects** - Community projects
5. **project_participants** - Project membership tracking
6. **project_skills** - Required skills for projects
7. **applications** - Project applications from users
8. **blog_posts** - Community blog content
9. **events** - Community events and workshops
10. **event_registrations** - Event attendance tracking
11. **notifications** - User notifications system
12. **contact_messages** - Contact form submissions
13. **achievements** - Gamification achievements
14. **user_achievements** - User achievement tracking

### Key Features

- **Row Level Security (RLS)** - Enabled on all tables with appropriate policies
- **Automated Triggers** - For updating timestamps and maintaining counts
- **Custom Types** - Enums for user roles, project status, skill levels
- **Indexes** - Optimized for common query patterns
- **Views** - Pre-built views for common data aggregations

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be fully initialized
4. Note your project URL and anon key

### 2. Run the Schema

1. Navigate to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `schema.sql`
4. Paste and run the query
5. Wait for completion (this may take a few moments)

### 3. Run the Seed Data (Optional)

1. In the SQL Editor, create a new query
2. Copy the contents of `seed.sql`
3. Paste and run the query
4. This will populate your database with sample data

### 4. Verify Setup

Run these queries to verify everything is working:

\`\`\`sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT * FROM public.skills LIMIT 5;
SELECT * FROM public.projects LIMIT 3;
SELECT * FROM public.achievements LIMIT 5;
\`\`\`

### 5. Configure Environment Variables

Add these to your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## Authentication Setup

The database includes automatic profile creation when users sign up through Supabase Auth. The `handle_new_user()` function creates a profile record whenever a new user registers.

### Supported Auth Methods

The schema supports various authentication methods:
- Email/Password
- OAuth providers (Google, GitHub, etc.)
- Magic links

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public data is viewable by everyone
- Admins have appropriate elevated permissions
- Project mentors can manage their projects

### Data Protection

- Sensitive operations require authentication
- User data is protected by RLS policies
- Foreign key constraints maintain data integrity
- Triggers prevent data inconsistencies

## Database Maintenance

### Regular Tasks

1. **Monitor Performance** - Check slow queries and add indexes as needed
2. **Backup Data** - Supabase provides automatic backups, but consider additional backups for critical data
3. **Update Statistics** - PostgreSQL automatically updates statistics, but manual updates may be needed for large changes
4. **Clean Old Data** - Consider archiving old notifications, logs, etc.

### Scaling Considerations

- Add database indexes for new query patterns
- Consider partitioning for large tables (events, notifications)
- Monitor connection limits and upgrade plan as needed
- Use database replicas for read-heavy workloads

## Common Queries

### User Profile with Skills
\`\`\`sql
SELECT 
    p.*,
    array_agg(s.name) as skills
FROM profiles p
LEFT JOIN user_skills us ON p.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
WHERE p.id = $1
GROUP BY p.id;
\`\`\`

### Available Projects
\`\`\`sql
SELECT 
    p.*,
    pr.first_name || ' ' || pr.last_name as mentor_name,
    array_agg(DISTINCT s.name) as required_skills
FROM projects p
LEFT JOIN profiles pr ON p.mentor_id = pr.id
LEFT JOIN project_skills ps ON p.id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.id
WHERE p.is_open_for_applications = true
GROUP BY p.id, pr.first_name, pr.last_name;
\`\`\`

### User Notifications
\`\`\`sql
SELECT * FROM notifications
WHERE user_id = $1 AND is_read = false
ORDER BY created_at DESC;
\`\`\`

## Troubleshooting

### Common Issues

1. **RLS Policy Errors** - Make sure you're authenticated and have proper permissions
2. **Foreign Key Violations** - Ensure referenced records exist before inserting
3. **Unique Constraint Violations** - Check for duplicate data before inserting
4. **Permission Denied** - Verify RLS policies and user authentication

### Debug Queries

\`\`\`sql
-- Check current user
SELECT auth.uid();

-- Check user role
SELECT role FROM profiles WHERE id = auth.uid();

-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
\`\`\`

## Support

For questions about the database setup:
1. Check the Supabase documentation
2. Review the SQL comments in the schema file
3. Create an issue in the project repository
4. Contact the development team

## Contributing

When modifying the database schema:
1. Update both `schema.sql` and migration files
2. Test changes in a development environment first
3. Update this README if needed
4. Consider impact on existing data
5. Update RLS policies accordingly
