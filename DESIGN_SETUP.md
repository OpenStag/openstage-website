# Design Management Setup Guide

This guide will help you set up the design management feature in your OpenStage website.

## Database Setup

### 1. Run the Design Schema

Execute the following SQL file in your Supabase SQL editor:

```sql
-- Run the content of database/design_schema.sql
```

This will create:
- `designs` table for storing design submissions
- `design_status_history` table for tracking status changes
- `design_comments` table for admin/user communication
- All necessary RLS policies for security
- Triggers for automatic status tracking
- Helpful views for querying

### 2. Required Database Tables

The design feature requires these tables to be present:
- `profiles` (should already exist from user schema)
- `designs` (created by design_schema.sql)
- `design_status_history` (created by design_schema.sql)
- `design_comments` (created by design_schema.sql)

## Features Included

### For Users:
1. **Design Submission Form**
   - Design name (required)
   - Project type: Website or Web Application
   - Number of pages
   - Figma link (optional, validated)
   - Description (optional)

2. **Design Timeline**
   - View all submitted designs
   - Track progress through status updates
   - See status history with timestamps
   - Visual timeline showing progression

3. **Status Tracking**
   - Pending Review (initial status)
   - Accepted
   - In Development
   - Completed
   - Rejected

### For Admins (Future Implementation):
- Review and approve/reject designs
- Update design status
- Add comments and notes
- Assign designs to developers

## Design Status Workflow

```
Pending Review → Accepted → In Development → Completed
       ↓
    Rejected
```

### Status Descriptions:
- **Pending Review**: Design submitted, waiting for admin review
- **Accepted**: Design approved and queued for development
- **In Development**: Work has started on the design
- **Completed**: Design implementation finished
- **Rejected**: Design not approved (with admin notes)

## User Interface

### Design Page Features:
1. **Authentication Required**: Users must be logged in
2. **Form Validation**: 
   - Required fields validation
   - Figma URL validation
   - Minimum page count validation
3. **Real-time Updates**: Form submission updates the timeline immediately
4. **Responsive Design**: Works on desktop and mobile
5. **Progress Visualization**: Timeline shows design journey

### Navigation Integration:
- Added "Design" link to main navigation
- Available in both desktop and mobile menus
- Positioned between "About" and "Contact Us"

## File Structure

```
src/
├── app/
│   └── design/
│       └── page.tsx          # Main design submission page
├── lib/
│   ├── designs.ts            # Design utilities and API functions
│   └── supabase.ts           # Updated with design types
└── components/
    └── Navigation.tsx        # Updated with design link

database/
└── design_schema.sql         # Database schema for designs
```

## Usage Instructions

### For Users:
1. Navigate to `/design` or click "Design" in the navigation
2. Fill out the design submission form
3. Submit the form
4. View your submitted designs and their progress in the timeline below

### For Developers/Admins:
1. Use Supabase dashboard to update design status
2. Add comments through the `design_comments` table
3. Review submissions in the `designs` table

## API Functions Available

From `lib/designs.ts`:
- `createDesign(designData)` - Submit new design
- `getUserDesigns()` - Get user's designs with history
- `getDesignById(id)` - Get specific design details
- `updateDesign(id, updates)` - Update design (only when pending)
- `deleteDesign(id)` - Delete design (only when pending)
- `addDesignComment(id, comment)` - Add comment to design

## Security Features

- **Row Level Security (RLS)**: Users can only see their own designs
- **Admin Access**: Admins can view and manage all designs
- **Status Restrictions**: Users can only edit designs with "pending" status
- **Authentication Required**: All design operations require login

## Future Enhancements

1. **Admin Dashboard**: Interface for admins to manage designs
2. **File Uploads**: Allow users to upload design files
3. **Email Notifications**: Notify users of status changes
4. **Comments System**: Two-way communication between users and admins
5. **Design Categories**: Categorize designs by industry or type
6. **Pricing Integration**: Add pricing based on complexity
7. **Developer Assignment**: Assign specific developers to designs

## Testing the Feature

1. Ensure you have users created through the signup process
2. Log in as a user
3. Navigate to the Design page
4. Submit a test design
5. Check the Supabase database to verify data storage
6. Update the design status manually in Supabase to test timeline updates

## Troubleshooting

### Common Issues:
1. **"User not authenticated" error**: Ensure user is logged in
2. **Database errors**: Check that all tables exist and RLS policies are applied
3. **Figma link validation**: Ensure the URL starts with https://www.figma.com or https://figma.com
4. **Timeline not updating**: Check that triggers are working in the database

### Required Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Make sure these are set in your `.env.local` file.
