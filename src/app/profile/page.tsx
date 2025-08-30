"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  badge_color?: string;
}

interface Design {
  id: string;
  name: string;
  description?: string;
  type: string;
  pages_count: number;
  figma_link?: string;
  status: string;
  created_at: string;
}

interface DevelopmentProject {
  id: string;
  design_name: string;
  project_status: string;
  joined_at: string;
  completed_at?: string;
  role?: string;
}

interface DevelopmentTeamMemberData {
  id: string;
  user_id: string;
  design_id: string;
  role?: string;
  joined_at: string;
  created_at: string;
  updated_at?: string;
  designs?: {
    name?: string;
    status?: string;
  } | null;
}

const TYPE_LABELS = {
  website: "Website",
  web_application: "Web Application",
  landing_page: "Landing Page",
};

const STATUS_LABELS = {
  pending: "Under Review",
  accepted: "Accepted",
  in_development: "In Development",
  completed: "Completed",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-blue-100 text-blue-800 border-blue-200",
  in_development: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const [designCount, setDesignCount] = useState(0);
  const [developmentCount, setDevelopmentCount] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"design" | "development" | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [developmentProjects, setDevelopmentProjects] = useState<DevelopmentProject[]>([]);

  // LinkedIn sharing function
  const shareBadgeOnLinkedIn = (badge: Badge) => {
    const badgeUrl = window.location.origin + "/profile";
    const text = `🎉 I just earned the "${badge.name}" badge on OpenStage! ${badge.description}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      badgeUrl
    )}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
  };

  useEffect(() => {
    async function fetchProfileStats() {
      setLoading(true);
      try {
        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) return setLoading(false);
        const userId = user.id;

        // 1. Count designs made by user and get design data
        const { count: designCountRaw, data: designsData } = await supabase
          .from("designs")
          .select("*", { count: "exact" })
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        setDesignCount(designCountRaw || 0);
        setDesigns(designsData || []);

        // 2. Count completed developments (projects user joined and completed)
        const { count: devCountRaw, data: developmentData } = await supabase
          .from("development_team_members")
          .select(
            `
            *,
            designs!inner(name, status)
          `,
            { count: "exact" }
          )
          .eq("user_id", userId)
          .order("joined_at", { ascending: false });

        // Transform development data
        const developmentProjects = (developmentData || []).map(
          (item: DevelopmentTeamMemberData) => ({
            id: item.id,
            design_name: item.designs?.name || "Unknown Project",
            project_status: item.designs?.status || "unknown",
            joined_at: item.joined_at || item.created_at,
            completed_at:
              item.designs?.status === "completed" ? item.updated_at : undefined,
            role: item.role,
          })
        );
        setDevelopmentProjects(developmentProjects);

        // Count only completed development projects
        const completedDevCount = developmentProjects.filter(
          (p) => p.project_status === "completed"
        ).length;
        setDevelopmentCount(completedDevCount);

        // 3. Get badges/achievements
        const { data: badgeRows } = await supabase
          .from("user_achievements")
          .select(
            "achievement_id, achievements:achievement_id(name, description, icon_url, badge_color)"
          )
          .eq("user_id", userId);
        
        type BadgeRow = {
          achievement_id: string;
          achievements: {
            name?: string;
            description?: string;
            icon_url?: string;
            badge_color?: string;
          } | null;
        };
        
        // Convert badge data and add automatic "New Member" badge
        const userBadges = (badgeRows as BadgeRow[] | undefined)?.map((row) => ({
          id: row.achievement_id,
          name: row.achievements?.name ?? "",
          description: row.achievements?.description ?? "",
          icon_url: row.achievements?.icon_url,
          badge_color: row.achievements?.badge_color,
        })) || [];

        // Add "New Member" badge for all registered users
        const newMemberBadge: Badge = {
          id: "new-member",
          name: "New Member",
          description: "Welcome to OpenStage! Ready to start your journey.",
          icon_url: "/memBadge.png",
          badge_color: "#22c55e"
        };

        // Combine all badges with New Member badge first
        setBadges([newMemberBadge, ...userBadges]);

        // 4. Calculate points
        const completedDesigns =
          designsData?.filter(
            (design) =>
              design.status === "completed" ||
              design.status === "in_development" ||
              design.status === "accepted"
          ) || [];
        const designPoints = completedDesigns.reduce(
          (total, design) => total + design.pages_count * 10,
          0
        );
        const devPoints = completedDevCount * 30;
        const totalPoints = designPoints + devPoints;
        setPoints(totalPoints);

      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Mobile-first responsive container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            
            {/* Profile Info & Stats */}
            <div className="flex-1 w-full">
              {/* User Avatar & Basic Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                  U
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Your Profile</h1>
                  <p className="text-slate-400">OpenStage Community Member</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {designs.filter(d => ['completed','in_development','accepted'].includes(d.status)).length}
                  </div>
                  <div className="text-sm text-slate-400">Designs</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{developmentCount}</div>
                  <div className="text-sm text-slate-400">Dev Projects</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {badges.length + designs.filter(d => d.status === 'completed').length + developmentProjects.filter(p => p.project_status === 'completed').length}
                  </div>
                  <div className="text-sm text-slate-400">Badges</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{points}</div>
                  <div className="text-sm text-slate-400">Points</div>
                </div>
              </div>
            </div>

            {/* Right side image - hidden on mobile */}
            <div className="hidden lg:block flex-shrink-0">
              
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">🏆 Achievements</h2>
            <span className="text-sm text-slate-400">Tap badges to share</span>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2 min-w-max">
              {/* User badges (including automatic New Member badge) */}
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => shareBadgeOnLinkedIn(badge)}
                >
                  <img
                    src={badge.icon_url || "/desBadge.png"}
                    alt={badge.name}
                    className="w-25 h-25 mx-auto mb-2"
                  />
                </div>
              ))}

              {/* Design badges */}
              {designs.filter(d => ['completed','accepted','in_development'].includes(d.status)).map((design) => (
                <div
                  key={`design-${design.id}`}
                  onClick={() => shareBadgeOnLinkedIn({
                    id: `design-${design.id}`,
                    name: `Design: ${design.name}`,
                    description: `Completed design project with ${design.pages_count} pages`
                  })}
                >
                  <img
                    src="/desBadge.png"
                    alt={design.name}
                    className="w-25 h-25 mx-auto mb-2"
                  />
                </div>
              ))}

              {/* Development badges */}
              {developmentProjects.filter(p => p.project_status === 'completed').map((project) => (
                <div
                  key={`dev-${project.id}`}
                  onClick={() => shareBadgeOnLinkedIn({
                    id: `dev-${project.id}`,
                    name: `Development: ${project.design_name}`,
                    description: `Completed development project`
                  })}
                >
                  <img
                    src="/devBadge.png"
                    alt={project.design_name}
                    className="w-25 h-25 mx-auto mb-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveView("design")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeView === "design"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              Design Projects
            </button>
            <button
              onClick={() => setActiveView("development")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeView === "development"
                  ? "bg-green-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              Development Projects
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeView === "design" && (
              <div>
                {designs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-slate-300 text-lg">No designs yet</p>
                    <p className="text-slate-500">Submit your first design to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {designs.map((design) => (
                      <div key={design.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-white mb-1">{design.name}</h3>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              STATUS_COLORS[design.status as keyof typeof STATUS_COLORS] || 
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {STATUS_LABELS[design.status as keyof typeof STATUS_LABELS] || design.status}
                            </span>
                          </div>
                          {design.status === "completed" && (
                            <img src="/desBadge.png" alt="Completed" className="w-8 h-8" />
                          )}
                        </div>
                        
                        <div className="text-sm text-slate-400 space-y-1">
                          <p>Created: {formatDate(design.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === "development" && (
              <div>
                {developmentProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-300 text-lg">No development projects yet</p>
                    <p className="text-slate-500">Join a development team to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {developmentProjects.map((project) => (
                      <div key={project.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-white mb-1">{project.design_name}</h3>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              project.project_status === "completed"
                                ? "bg-green-100 text-green-800"
                                : project.project_status === "in_development"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {STATUS_LABELS[project.project_status as keyof typeof STATUS_LABELS] || project.project_status}
                            </span>
                          </div>
                          {project.project_status === "completed" && (
                            <img src="/devBadge.png" alt="Completed" className="w-8 h-8" />
                          )}
                        </div>
                        
                        <div className="text-sm text-slate-400 space-y-1">
                          <p>Joined: {formatDate(project.joined_at)}</p>
                          {project.role && <p>Role: {project.role}</p>}
                          {project.completed_at && <p>Completed: {formatDate(project.completed_at)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!activeView && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">Select a tab above to view your projects</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
