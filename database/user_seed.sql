-- OpenStage User Tables Seed Data
-- Run this after creating the user schema

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
-- USEFUL VIEWS FOR USER DATA
-- =============================================

-- View for user profiles with skill counts
CREATE VIEW user_profiles_with_skills AS
SELECT 
    p.*,
    COUNT(us.skill_id) as skill_count,
    array_agg(s.name) FILTER (WHERE s.name IS NOT NULL) as skill_names
FROM profiles p
LEFT JOIN user_skills us ON p.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
GROUP BY p.id;

-- View for skills by category
CREATE VIEW skills_by_category AS
SELECT 
    category,
    COUNT(*) as skill_count,
    array_agg(name ORDER BY name) as skills
FROM skills
GROUP BY category
ORDER BY category;
