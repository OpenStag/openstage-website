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
  status_history?: Array<{
    id: string;
    status: string;
    created_at: string;
    notes?: string;
  }>;
}

interface DevelopmentProject {
  id: string;
  design_name: string;
  project_status: string;
  joined_at: string;
  completed_at?: string;
  role?: string;
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
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"design" | "development" | null>(
    null
  );
  const [designs, setDesigns] = useState<Design[]>([]);
  const [developmentProjects, setDevelopmentProjects] = useState<
    DevelopmentProject[]
  >([]);

  // LinkedIn sharing function
  const shareBadgeOnLinkedIn = (badge: Badge) => {
    const badgeUrl = window.location.origin + "/profile"; // Could be a dedicated badge page
    const text = `🎉 I just earned the "${badge.name}" badge on OpenStage! ${badge.description}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      badgeUrl
    )}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
  };

  useEffect(() => {
    async function fetchProfileStats() {
      setLoading(true);
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
        .select(
          `
					*,
					status_history:design_status_history(*)
				`,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setDesignCount(designCountRaw || 0);
      setDesigns(designsData || []);

      // 2. Count completed developments (projects user joined and completed)
      // NOTE: This assumes a 'development_team_members' table exists with design_id, user_id, and design status is 'completed'.
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
      setDevelopmentCount(devCountRaw || 0);

      // Transform development data
      const developmentProjects = (developmentData || []).map((item: any) => ({
        id: item.id,
        design_name: item.designs?.name || "Unknown Project",
        project_status: item.designs?.status || "unknown",
        joined_at: item.joined_at || item.created_at,
        completed_at:
          item.designs?.status === "completed" ? item.updated_at : undefined,
        role: item.role,
      }));
      setDevelopmentProjects(developmentProjects);

      // Count only completed development projects
      const completedDevCount = developmentProjects.filter(
        (p) => p.project_status === "completed"
      ).length;
      setDevelopmentCount(completedDevCount);

      // 3. Get badges/achievements
      // NOTE: This assumes a 'user_achievements' table exists with user_id, achievement_id
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
      setBadges(
        (badgeRows as BadgeRow[] | undefined)?.map((row) => ({
          id: row.achievement_id,
          name: row.achievements?.name ?? "",
          description: row.achievements?.description ?? "",
          icon_url: row.achievements?.icon_url,
          badge_color: row.achievements?.badge_color,
        })) || []
      );

      // 4. Calculate points (example: 10 per approved design, 20 per completed dev)
      // Calculate points: 10 points per page for completed designs + 20 per completed dev project
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

      // 5. Calculate level (example: every 100 points = next level)
      setLevel(Math.floor(points / 300) + 1);

      setLoading(false);
    }
    fetchProfileStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  // Find design and development completion badges by name (adjust names as needed)
  const designBadge = badges.find((b) =>
    b.name?.toLowerCase().includes("design")
  );
  const developmentBadge = badges.find(
    (b) =>
      b.name?.toLowerCase().includes("development") ||
      b.name?.toLowerCase().includes("project completer")
  );

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Earned Badges Section - Clickable for LinkedIn Sharing */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">🏆 Your Achievements</h2>
        <div className="flex flex-wrap gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:border-blue-300"
              onClick={() => shareBadgeOnLinkedIn(badge)}
              title={`Click to share "${badge.name}" on LinkedIn`}
            >
              <div className="relative">
                <img
                  src={
                    badge.icon_url ||
                    (badge.name?.toLowerCase().includes("design")
                      ? "/design-badge.png"
                      : "/development-badge.webp")
                  }
                  alt={badge.name}
                  className="w-16 h-16 mb-2"
                />
                {/* Share icon overlay */}
                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-center text-gray-700 font-medium">
                {badge.name}
              </span>
              <span className="text-xs text-center text-gray-500">
                {badge.description}
              </span>
            </div>
          ))}
          {/* Display badges for completed designs */}
          {designs
            .filter((design) => design.status === "completed")
            .map((design) => (
              <div
                key={`design-${design.id}`}
                className="flex flex-col items-center cursor-pointer transition-transform relative"
                onClick={() => {
                  // Toggle options visibility
                  const optionsDiv = document.getElementById(
                    `design-options-${design.id}`
                  );
                  if (optionsDiv) {
                    optionsDiv.classList.toggle("hidden");
                  }
                }}
                title={`Click to see options for "${design.name}"`}
              >
                <div className="relative">
                  <img
                    src="/design-badge.png"
                    alt={`Design Completed: ${design.name}`}
                    className="w-16 h-16 mb-2"
                  />
                </div>

                {/* Options popup panel */}
                <div
                  id={`design-options-${design.id}`}
                  className="hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/design-badge.png";
                      link.download = `design-badge-${design.name.replace(
                        /\s+/g,
                        "-"
                      )}.png`;
                      link.click();
                      document
                        .getElementById(`design-options-${design.id}`)
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg border-b border-gray-100"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => {
                      shareBadgeOnLinkedIn({
                        id: `design-${design.id}`,
                        name: `Design Completed: ${design.name}`,
                        description: `Successfully completed the design project "${design.name}"`,
                      });
                      document
                        .getElementById(`design-options-${design.id}`)
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          {/* Display badges for completed development projects */}
          {developmentProjects
            .filter((project) => project.project_status === "completed")
            .map((project) => (
              <div
                key={`development-${project.id}`}
                className="flex flex-col items-center cursor-pointer transition-transform relative"
                onClick={() => {
                  // Toggle options visibility
                  const optionsDiv = document.getElementById(
                    `options-${project.id}`
                  );
                  if (optionsDiv) {
                    optionsDiv.classList.toggle("hidden");
                  }
                }}
                title={`Click to see options for "${project.design_name}"`}
              >
                <div className="relative">
                  <img
                    src="/design-badge.png"
                    alt={`Development Completed: ${project.design_name}`}
                    className="w-16 h-16 mb-2"
                  />
                </div>

                {/* Options popup panel */}
                <div
                  id={`options-${project.id}`}
                  className="hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/development-badge.webp";
                      link.download = `development-badge-${project.design_name.replace(
                        /\s+/g,
                        "-"
                      )}.webp`;
                      link.click();
                      document
                        .getElementById(`options-${project.id}`)
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg border-b border-gray-100"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => {
                      shareBadgeOnLinkedIn({
                        id: `development-${project.id}`,
                        name: `Development Completed: ${project.design_name}`,
                        description: `Successfully completed the development project "${project.design_name}"`,
                      });
                      document
                        .getElementById(`options-${project.id}`)
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8 max-w-4xl">
        <div className="rounded-lg  shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {
              designs.filter(
                (design) =>
                  design.status === "completed" ||
                  design.status === "in_development" ||
                  design.status === "accepted"
              ).length
            }
          </div>
          <div className="text-white">
            Designs <br /> Completed
          </div>
        </div>
        <div className="rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {developmentCount}
          </div>
          <div className="text-white">Developments Completed</div>
        </div>
        <div className="rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {badges.length +
              designs.filter((design) => design.status === "completed").length +
              developmentProjects.filter(
                (project) => project.project_status === "completed"
              ).length}
          </div>
          <div className="text-white">Badges <br /> Earned</div>
        </div>
        <div className="rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{points}</div>
          <div className="text-white">Points</div>
        </div>
      </div>
      <div className="flex flex-row border-t border-gray-300 pt-6">
        <div className="flex flex-col gap-5 p-8 max-w-2xl border-r border-gray-300 pr-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => setActiveView("design")}
          >
            Design Project
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            onClick={() => setActiveView("development")}
          >
            Development Project
          </button>
        </div>
        <div className="flex-1 p-8 rounded-lg">
          {activeView === "design" && (
            <div className="text-white px-4 py-2 rounded">
              {designs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    You haven&apos;t submitted any designs yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Submit your first design using the form above!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {designs.map((design: Design) => (
                    <div
                      key={design.id}
                      className="border border-gray-200 rounded-lg p-2"
                    >
                      {/* Design Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-white flex items-center">
                            {design.name}
                            {design.status === "completed" && (
                              <img
                                src="/design-badge.png"
                                alt="Design Completed Badge"
                                title="Design Completed Badge"
                                className="w-7 h-7 ml-2 inline-block align-middle drop-shadow-md"
                              />
                            )}
                          </h3>
                        </div>
                        <div className="mt-3 sm:mt-0">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              STATUS_COLORS[
                                design.status as keyof typeof STATUS_COLORS
                              ] || "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {design.status === "completed" ||
                            design.status === "in_development" ||
                            design.status === "accepted"
                              ? "Complete"
                              : design.status === "pending" ||
                                design.status === "rejected"
                              ? "Pending"
                              : STATUS_LABELS[
                                  design.status as keyof typeof STATUS_LABELS
                                ] || design.status}
                          </span>
                        </div>
                      </div>{" "}
                      {/* Figma Link */}
                      {design.figma_link && (
                        <div className="mb-2">
                          <a
                            href={design.figma_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M15.5 2H8.4c-1.9 0-3.4 1.5-3.4 3.4v13.1c0 1.9 1.5 3.4 3.4 3.4h.9c1.9 0 3.4-1.5 3.4-3.4V16h3.3c3.7 0 6.7-3 6.7-6.7S19.7 2.6 16 2.6L15.5 2zm0 9.3H12v3.4c0 .9-.7 1.7-1.7 1.7h-.9c-.9 0-1.7-.7-1.7-1.7V5.4c0-.9.7-1.7 1.7-1.7h7.1c2.8 0 5 2.2 5 5S18.3 11.3 15.5 11.3z" />
                            </svg>
                            View Figma Design
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeView === "development" && (
            <div className="text-white px-4 py-2 rounded">
              {/* Development Projects Timeline */}
              {developmentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    You haven&apos;t joined any development projects yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Join a development team to start earning badges!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {developmentProjects.map((project: DevelopmentProject) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-white flex items-center">
                          {project.design_name}
                          {project.project_status === "completed" && (
                            <img
                              src="/development-badge.webp"
                              alt="Development Completed Badge"
                              title="Development Completed Badge"
                              className="w-7 h-7 ml-2 inline-block align-middle drop-shadow-md"
                            />
                          )}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            project.project_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.project_status === "in_development"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {STATUS_LABELS[
                            project.project_status as keyof typeof STATUS_LABELS
                          ] || project.project_status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Joined: {formatDate(project.joined_at)}</p>
                        {project.role && <p>Role: {project.role}</p>}
                        {project.completed_at && (
                          <p>Completed: {formatDate(project.completed_at)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!activeView && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a category</h2>
              <p className="text-gray-600">
                Click on Design Project or Development Project to view details.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* TODO: Add more profile info, recent activity, etc. */}
    </div>
  );
}
