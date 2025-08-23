-- Development Team Members Table
-- Add this to your existing database schema

-- =============================================
-- DEVELOPMENT TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE public.development_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    design_id UUID REFERENCES public.designs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'developer', -- 'developer', 'lead', 'tester', etc.
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one user can only join a design project once
    UNIQUE(design_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_development_team_members_design_id ON public.development_team_members(design_id);
CREATE INDEX idx_development_team_members_user_id ON public.development_team_members(user_id);
CREATE INDEX idx_development_team_members_active ON public.development_team_members(is_active);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.development_team_members ENABLE ROW LEVEL SECURITY;

-- Users can view team members for designs they can see
CREATE POLICY "Users can view team members for visible designs" ON public.development_team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.designs 
            WHERE id = design_id 
            AND (status IN ('accepted', 'in_development', 'completed') OR user_id = auth.uid())
        )
    );

-- Users can join teams (insert their own membership)
CREATE POLICY "Users can join development teams" ON public.development_team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own team membership
CREATE POLICY "Users can update their own team membership" ON public.development_team_members
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can leave teams (soft delete by setting left_at and is_active = false)
CREATE POLICY "Users can leave development teams" ON public.development_team_members
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all team memberships
CREATE POLICY "Admins can manage team memberships" ON public.development_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'mentor')
        )
    );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_development_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_development_team_members_updated_at
    BEFORE UPDATE ON public.development_team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_development_team_members_updated_at();

-- Function to check team capacity
CREATE OR REPLACE FUNCTION public.check_team_capacity()
RETURNS TRIGGER AS $$
DECLARE
    team_count INTEGER;
    max_capacity INTEGER;
BEGIN
    -- Get current team size for this design
    SELECT COUNT(*) INTO team_count
    FROM public.development_team_members
    WHERE design_id = NEW.design_id AND is_active = true;
    
    -- Get design's page count as max capacity
    SELECT pages_count INTO max_capacity
    FROM public.designs
    WHERE id = NEW.design_id;
    
    -- Check if team is already full
    IF team_count >= max_capacity THEN
        RAISE EXCEPTION 'Team is already full. Maximum capacity: %', max_capacity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check team capacity before adding members
CREATE TRIGGER check_team_capacity_trigger
    BEFORE INSERT ON public.development_team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.check_team_capacity();
