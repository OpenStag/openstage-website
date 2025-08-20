-- OpenStage Database Seed Data
-- Run this after creating the schema to populate initial data

-- =============================================
-- INSERT INITIAL SKILLS
-- =============================================

INSERT INTO public.skills (name, category, description) VALUES
-- Programming Languages
('JavaScript', 'programming', 'Popular programming language for web development'),
('TypeScript', 'programming', 'Typed superset of JavaScript'),
('Python', 'programming', 'Versatile programming language for data science and web development'),
('Java', 'programming', 'Enterprise-level programming language'),
('C#', 'programming', 'Microsoft programming language for .NET development'),
('PHP', 'programming', 'Server-side scripting language'),
('Go', 'programming', 'Modern programming language developed by Google'),
('Rust', 'programming', 'Systems programming language focused on safety and performance'),

-- Frontend Technologies
('React', 'frontend', 'Popular JavaScript library for building user interfaces'),
('Vue.js', 'frontend', 'Progressive JavaScript framework'),
('Angular', 'frontend', 'Platform for building mobile and desktop web applications'),
('Next.js', 'frontend', 'React framework for production applications'),
('HTML', 'frontend', 'Standard markup language for web pages'),
('CSS', 'frontend', 'Style sheet language for describing presentation'),
('Tailwind CSS', 'frontend', 'Utility-first CSS framework'),
('Sass', 'frontend', 'CSS preprocessor'),

-- Backend Technologies
('Node.js', 'backend', 'JavaScript runtime built on Chrome V8 engine'),
('Express.js', 'backend', 'Web application framework for Node.js'),
('Django', 'backend', 'High-level Python web framework'),
('Flask', 'backend', 'Lightweight Python web framework'),
('Spring Boot', 'backend', 'Java-based framework for creating microservices'),
('ASP.NET Core', 'backend', 'Cross-platform framework for building modern applications'),

-- Databases
('PostgreSQL', 'database', 'Advanced open source relational database'),
('MySQL', 'database', 'Popular open source relational database'),
('MongoDB', 'database', 'Document-oriented NoSQL database'),
('Redis', 'database', 'In-memory data structure store'),
('Supabase', 'database', 'Open source Firebase alternative'),

-- DevOps & Tools
('Docker', 'devops', 'Platform for developing, shipping, and running applications'),
('Git', 'devops', 'Distributed version control system'),
('GitHub', 'devops', 'Web-based Git repository hosting service'),
('CI/CD', 'devops', 'Continuous Integration and Continuous Deployment'),
('AWS', 'devops', 'Amazon Web Services cloud platform'),
('Vercel', 'devops', 'Platform for frontend frameworks and static sites'),

-- Design
('UI/UX Design', 'design', 'User Interface and User Experience design'),
('Figma', 'design', 'Collaborative interface design tool'),
('Adobe Photoshop', 'design', 'Image editing software'),
('Adobe Illustrator', 'design', 'Vector graphics editor'),

-- Project Management
('Scrum', 'project-management', 'Agile framework for managing product development'),
('Kanban', 'project-management', 'Visual system for managing work'),
('Jira', 'project-management', 'Issue tracking and project management tool'),
('Trello', 'project-management', 'Collaboration tool for organizing projects');

-- =============================================
-- INSERT INITIAL ACHIEVEMENTS
-- =============================================

INSERT INTO public.achievements (name, description, icon_url, badge_color, criteria, points) VALUES
('Welcome to OpenStage', 'Complete your profile setup', NULL, '#10B981', 'Fill out all required profile fields', 10),
('First Project', 'Join your first project', NULL, '#3B82F6', 'Successfully join a project', 25),
('Project Completer', 'Complete your first project', NULL, '#8B5CF6', 'Finish a project from start to end', 50),
('Skill Master', 'Add 5 skills to your profile', NULL, '#F59E0B', 'Add at least 5 skills with experience levels', 20),
('Mentor', 'Lead your first project as a mentor', NULL, '#EF4444', 'Create and lead a project as a mentor', 100),
('Collaborator', 'Work on 3 different projects', NULL, '#06B6D4', 'Participate in 3 or more projects', 75),
('Early Bird', 'Join OpenStage in the first month', NULL, '#84CC16', 'Register within the first month of launch', 15),
('Community Builder', 'Attend 5 events', NULL, '#F97316', 'Attend 5 community events', 40),
('Knowledge Sharer', 'Write your first blog post', NULL, '#EC4899', 'Publish a blog post on OpenStage', 30),
('Networking Pro', 'Connect with 10 members', NULL, '#6366F1', 'Build connections with fellow members', 35);

-- =============================================
-- INSERT SAMPLE PROJECTS
-- =============================================

-- Note: You'll need to replace the mentor_id UUIDs with actual user IDs after users are created
-- For now, we'll use placeholder values that should be updated

INSERT INTO public.projects (
    title, 
    description, 
    long_description,
    status,
    difficulty_level,
    max_participants,
    start_date,
    end_date,
    estimated_hours,
    tags,
    requirements,
    learning_objectives,
    is_featured,
    is_open_for_applications
) VALUES
(
    'E-Commerce Website with React & Node.js',
    'Build a full-stack e-commerce platform with modern technologies',
    'In this project, participants will work together to create a comprehensive e-commerce website. The project includes user authentication, product catalog, shopping cart, payment integration, and admin dashboard. This is perfect for developers who want to gain experience with full-stack development and learn industry best practices.',
    'planning',
    'intermediate',
    6,
    '2025-09-01',
    '2025-12-15',
    120,
    ARRAY['React', 'Node.js', 'E-commerce', 'Full-stack'],
    ARRAY['Basic JavaScript knowledge', 'Understanding of HTML/CSS', 'Git basics'],
    ARRAY['Full-stack development', 'API design', 'Database management', 'Payment integration', 'Team collaboration'],
    true,
    true
),
(
    'Mobile App for Community Events',
    'Create a React Native app for discovering and managing local community events',
    'Develop a mobile application that helps community members discover, create, and manage local events. The app will feature event listings, user profiles, RSVP functionality, and real-time notifications. Perfect for learning mobile development and working with real-world features.',
    'planning',
    'beginner',
    4,
    '2025-08-15',
    '2025-11-30',
    80,
    ARRAY['React Native', 'Mobile', 'Community', 'Events'],
    ARRAY['Basic programming knowledge', 'Interest in mobile development'],
    ARRAY['Mobile app development', 'React Native', 'API integration', 'UI/UX for mobile'],
    true,
    true
),
(
    'Data Analytics Dashboard',
    'Build an interactive dashboard for visualizing OpenStage community metrics',
    'Create a comprehensive analytics dashboard that visualizes various metrics about the OpenStage community. The dashboard will display user engagement, project statistics, skill distributions, and growth trends. This project is ideal for those interested in data visualization and analytics.',
    'planning',
    'intermediate',
    3,
    '2025-09-15',
    '2025-12-01',
    60,
    ARRAY['Data Analytics', 'Dashboard', 'Python', 'Visualization'],
    ARRAY['Basic Python knowledge', 'Understanding of data concepts', 'SQL basics'],
    ARRAY['Data analysis', 'Data visualization', 'Dashboard design', 'Working with databases'],
    false,
    true
),
(
    'OpenStage Blog Platform',
    'Develop a content management system for community blog posts',
    'Build a blog platform where OpenStage members can share their experiences, tutorials, and insights. The platform will include features like rich text editing, categorization, comments, and social sharing. Great for learning content management and community building features.',
    'active',
    'beginner',
    5,
    '2025-07-01',
    '2025-10-15',
    90,
    ARRAY['Blog', 'CMS', 'Content', 'Community'],
    ARRAY['Basic web development knowledge', 'HTML/CSS understanding'],
    ARRAY['Content management systems', 'User-generated content', 'Rich text editing', 'Community features'],
    false,
    true
);

-- =============================================
-- INSERT SAMPLE BLOG POSTS
-- =============================================

INSERT INTO public.blog_posts (
    title,
    slug,
    content,
    excerpt,
    tags,
    is_published,
    is_featured,
    published_at
) VALUES
(
    'Welcome to OpenStage: Where Learning Meets Real-World Experience',
    'welcome-to-openstage',
    'OpenStage represents a revolutionary approach to bridging the gap between academic learning and professional experience. Our platform connects students and young professionals with real-world projects, mentors, and a supportive community...',
    'Discover how OpenStage is transforming the way students gain practical experience in technology.',
    ARRAY['announcement', 'welcome', 'community'],
    true,
    true,
    NOW()
),
(
    'Building Your First Full-Stack Project: A Beginner''s Guide',
    'building-first-fullstack-project',
    'Starting your first full-stack project can feel overwhelming, but with the right approach and mindset, it becomes an exciting journey of discovery. In this guide, we''ll walk through the essential steps...',
    'A comprehensive guide for beginners to start their first full-stack development project.',
    ARRAY['tutorial', 'full-stack', 'beginner'],
    true,
    false,
    NOW() - INTERVAL '3 days'
),
(
    'The Importance of Soft Skills in Tech Careers',
    'soft-skills-in-tech',
    'While technical skills are crucial in technology careers, soft skills often determine long-term success. Communication, teamwork, problem-solving, and adaptability are equally important...',
    'Exploring why soft skills are essential for success in technology careers.',
    ARRAY['career', 'soft-skills', 'professional-development'],
    true,
    false,
    NOW() - INTERVAL '1 week'
);

-- =============================================
-- INSERT SAMPLE EVENTS
-- =============================================

INSERT INTO public.events (
    title,
    description,
    type,
    start_time,
    end_time,
    location,
    meeting_url,
    max_attendees,
    tags,
    is_published
) VALUES
(
    'OpenStage Launch Event',
    'Join us for the official launch of OpenStage! Meet the team, learn about our mission, and connect with fellow community members.',
    'meetup',
    '2025-08-15 18:00:00+00',
    '2025-08-15 20:00:00+00',
    'online',
    'https://meet.google.com/abc-defg-hij',
    100,
    ARRAY['launch', 'networking', 'community'],
    true
),
(
    'Git & GitHub Workshop for Beginners',
    'Learn the fundamentals of version control with Git and GitHub. Perfect for beginners who want to collaborate on projects.',
    'workshop',
    '2025-08-22 19:00:00+00',
    '2025-08-22 21:00:00+00',
    'online',
    'https://meet.google.com/git-workshop',
    50,
    ARRAY['workshop', 'git', 'beginner'],
    true
),
(
    'Project Showcase: August 2025',
    'Community members present their completed projects and share their learning experiences.',
    'project-showcase',
    '2025-08-29 18:30:00+00',
    '2025-08-29 20:30:00+00',
    'online',
    'https://meet.google.com/showcase-aug',
    75,
    ARRAY['showcase', 'projects', 'community'],
    true
),
(
    'Career Panel: Breaking into Tech',
    'Hear from industry professionals about their journey into tech and get advice on building your career.',
    'webinar',
    '2025-09-05 19:00:00+00',
    '2025-09-05 20:30:00+00',
    'online',
    'https://meet.google.com/career-panel',
    100,
    ARRAY['career', 'panel', 'advice'],
    true
);

-- =============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- =============================================

-- View for project statistics
CREATE VIEW project_stats AS
SELECT 
    p.id,
    p.title,
    p.status,
    p.difficulty_level,
    p.current_participants,
    p.max_participants,
    COUNT(a.id) as application_count,
    p.mentor_id,
    m.first_name || ' ' || m.last_name as mentor_name
FROM projects p
LEFT JOIN applications a ON p.id = a.project_id AND a.status = 'pending'
LEFT JOIN profiles m ON p.mentor_id = m.id
GROUP BY p.id, m.first_name, m.last_name;

-- View for user profiles with skill counts
CREATE VIEW user_profiles_with_skills AS
SELECT 
    p.*,
    COUNT(us.skill_id) as skill_count,
    COUNT(pp.project_id) as project_count,
    COUNT(ua.achievement_id) as achievement_count
FROM profiles p
LEFT JOIN user_skills us ON p.id = us.user_id
LEFT JOIN project_participants pp ON p.id = pp.user_id
LEFT JOIN user_achievements ua ON p.id = ua.user_id
GROUP BY p.id;

-- View for upcoming events
CREATE VIEW upcoming_events AS
SELECT 
    e.*,
    COUNT(er.user_id) as registered_count,
    o.first_name || ' ' || o.last_name as organizer_name
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
LEFT JOIN profiles o ON e.organizer_id = o.id
WHERE e.start_time > NOW() AND e.is_published = true
GROUP BY e.id, o.first_name, o.last_name
ORDER BY e.start_time;
