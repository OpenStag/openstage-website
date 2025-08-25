"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS } from "@/lib/designs";
import type { Design } from "@/lib/supabase";

interface DesignWithUser extends Design {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
  };
}

// Add a type for joined count
interface DesignWithUserAndJoined extends DesignWithUser {
  joinedCount: number;
  joinedUsers?: {
    user_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    role?: string;
    joined_at?: string;
  }[];
}

export default function DevelopmentPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [acceptedDesigns, setAcceptedDesigns] = useState<
    DesignWithUserAndJoined[]
  >([]);
  const [ongoingDesigns, setOngoingDesigns] = useState<
    DesignWithUserAndJoined[]
  >([]);
  const [completedDesigns, setCompletedDesigns] = useState<
    DesignWithUserAndJoined[]
  >([]);
  const [userJoinedDesignIds, setUserJoinedDesignIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<
    "all" | "join" | "ongoing" | "completed"
  >("join");

  useEffect(() => {
    // Load designs; current user will be fetched inside loadDesigns
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try a simple query without JOIN to test if the table exists
      const { data: simpleData, error: simpleError } = await supabase
        .from("designs")
        .select("*")
        .in("status", ["accepted", "in_development", "completed"])
        .order("created_at", { ascending: false });

      if (simpleError) {
        throw new Error(
          `Database error: ${simpleError.message} (Code: ${simpleError.code})`
        );
      }

      if (!simpleData || simpleData.length === 0) {
        setAcceptedDesigns([]);
        setOngoingDesigns([]);
        setCompletedDesigns([]);
        return;
      }

      // Now try to get user information for each design
      const designsWithUsers: DesignWithUser[] = [];

      for (const design of simpleData) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("first_name, last_name, email, username")
            .eq("id", design.user_id)
            .single();

          const designWithUser: DesignWithUser = {
            ...design,
            user: userData || {
              first_name: "",
              last_name: "",
              email: "Unknown User",
              username: undefined,
            },
          };

          designsWithUsers.push(designWithUser);
        } catch (userError) {
          // Still add the design with placeholder user data
          designsWithUsers.push({
            ...design,
            user: {
              first_name: "",
              last_name: "",
              email: "Unknown User",
              username: undefined,
            },
          });
        }
      }

      // Fetch joined counts and user info for all accepted designs
      const acceptedDesignsRaw = designsWithUsers.filter(
        (d) => d.status === "accepted"
      );
      const joinedCounts: Record<string, number> = {};
      const joinedUsersMap: Record<
        string,
        {
          user_id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          username?: string;
          role?: string;
          joined_at?: string;
        }[]
      > = {};
      if (acceptedDesignsRaw.length > 0) {
        try {
          // Get all joined members for accepted designs, including user info, for ALL users
          const { data: joinedRows, error: joinedError } = await supabase
            .from("development_team_members")
            .select(
              `
              design_id, 
              user_id, 
              joined_at,
              role,
              profiles!user_id (
                email,
                first_name,
                last_name,
                username
              )
            `
            )
            .in(
              "design_id",
              acceptedDesignsRaw.map((d) => d.id)
            )
            .order("joined_at", { ascending: true });

          console.log("Joined rows for accepted designs:", joinedRows); // Debug log

          if (joinedError) {
            console.warn(
              "⚠️ Error fetching team members for accepted designs (this might be expected if table doesn't exist):",
              {
                message: joinedError.message || 'Unknown error',
                code: joinedError.code || 'NO_CODE',
                details: joinedError.details || 'No details',
                hint: joinedError.hint || 'No hint',
                table: 'development_team_members'
              }
            );
            // Continue without team data - this is not a critical error
          } else if (joinedRows && joinedRows.length > 0) {
            for (const row of joinedRows) {
              if (!joinedCounts[row.design_id]) joinedCounts[row.design_id] = 0;
              joinedCounts[row.design_id]++;
              if (!joinedUsersMap[row.design_id])
                joinedUsersMap[row.design_id] = [];

              // Handle profile data properly - it might be an array or object
              const profile = Array.isArray(row.profiles)
                ? row.profiles[0]
                : row.profiles;
              joinedUsersMap[row.design_id].push({
                user_id: row.user_id,
                email: profile?.email || "",
                first_name: profile?.first_name || "",
                last_name: profile?.last_name || "",
                username: profile?.username || "",
                role: row.role || "developer",
                joined_at: row.joined_at,
              });
            }
          } else {
            console.log("📝 No team members found for accepted designs");
          }
        } catch (teamError) {
          console.warn(
            "⚠️ Development team members functionality not available:",
            {
              error: teamError,
              message: "This might be because the development_team_members table doesn't exist",
              suggestion: "Run the development team schema setup script if you want team functionality"
            }
          );
          // Continue with empty team data - the app should still work
        }
      }
      const accepted: DesignWithUserAndJoined[] = acceptedDesignsRaw.map(
        (d) => ({
          ...d,
          joinedCount: joinedCounts[d.id] || 0,
          joinedUsers: joinedUsersMap[d.id] || [],
        })
      );

      // Separate designs by status
      const ongoingRaw = designsWithUsers.filter(
        (d) => d.status === "in_development"
      );
      const completedRaw = designsWithUsers.filter(
        (d) => d.status === "completed"
      );

      // Ensure we have the authenticated user id available for filtering
      let fetchedUserId: string | null = currentUserId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        fetchedUserId = authData?.user?.id || fetchedUserId;
        if (fetchedUserId !== currentUserId) setCurrentUserId(fetchedUserId);
      } catch (e) {
        console.warn("Could not fetch auth user inside loadDesigns", e);
      }

      console.log("🔍 Debug - All designs:", designsWithUsers);
      console.log("🔍 Debug - All design statuses:", designsWithUsers.map(d => ({ id: d.id, name: d.name, status: d.status })));
      console.log("🔍 Debug - Ongoing raw (in_development):", ongoingRaw);
      console.log("🔍 Debug - Completed raw (completed):", completedRaw);
      console.log("🔍 Debug - Accepted raw (accepted):", acceptedDesignsRaw);
      console.log("🔍 Debug - Current user ID:", currentUserId);

  // For ongoing/completed, fetch joined counts AND joined users (for filtering and display)
      const allOngoingCompleted = [...ongoingRaw, ...completedRaw];
      const joinedCountsAll: Record<string, number> = {};
      const joinedUsersMapAll: Record<
        string,
        {
          user_id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          username?: string;
          role?: string;
          joined_at?: string;
        }[]
      > = {};
      if (allOngoingCompleted.length > 0) {
        try {
          const { data: joinedRows, error: joinedError } = await supabase
            .from("development_team_members")
            .select(
              `
                design_id, 
                user_id, 
                joined_at,
                role,
                profiles!user_id (
                  email,
                  first_name,
                  last_name,
                  username
                )
              `
            )
            .in(
              "design_id",
              allOngoingCompleted.map((d) => d.id)
            )
            .order("joined_at", { ascending: true });

          console.log("Joined rows for ongoing/completed designs:", joinedRows); // Debug log

          if (joinedError) {
            console.warn(
              "⚠️ Error fetching team members (this might be expected if table doesn't exist):",
              {
                message: joinedError.message || 'Unknown error',
                code: joinedError.code || 'NO_CODE',
                details: joinedError.details || 'No details',
                hint: joinedError.hint || 'No hint',
                table: 'development_team_members'
              }
            );
            // Continue without team data - this is not a critical error
          } else if (joinedRows && joinedRows.length > 0) {
            for (const row of joinedRows) {
              if (!joinedCountsAll[row.design_id])
                joinedCountsAll[row.design_id] = 0;
              joinedCountsAll[row.design_id]++;
              if (!joinedUsersMapAll[row.design_id])
                joinedUsersMapAll[row.design_id] = [];
              const profile = Array.isArray(row.profiles)
                ? row.profiles[0]
                : row.profiles;
              joinedUsersMapAll[row.design_id].push({
                user_id: row.user_id,
                email: profile?.email || "",
                first_name: profile?.first_name || "",
                last_name: profile?.last_name || "",
                username: profile?.username || "",
                role: row.role || "developer",
                joined_at: row.joined_at,
              });
            }
          } else {
            console.log("📝 No team members found for ongoing/completed designs");
          }
        } catch (teamError) {
          console.warn(
            "⚠️ Development team members functionality not available:",
            {
              error: teamError,
              message: "This might be because the development_team_members table doesn't exist",
              suggestion: "Run the development team schema setup script if you want team functionality"
            }
          );
          // Continue with empty team data - the app should still work
        }
      }
      const ongoing: DesignWithUserAndJoined[] = ongoingRaw.map((d) => ({
        ...d,
        joinedCount: joinedCountsAll[d.id] || 0,
        joinedUsers: joinedUsersMapAll[d.id] || [],
      }));
      const completed: DesignWithUserAndJoined[] = completedRaw.map((d) => ({
        ...d,
        joinedCount: joinedCountsAll[d.id] || 0,
        joinedUsers: joinedUsersMapAll[d.id] || [],
      }));

      // Also fetch the list of designs the current user has joined directly.
      // This avoids RLS/join permission issues when trying to select all team members.
      let myJoinedIds: string[] = [];
      try {
        if (fetchedUserId) {
          const { data: myRows, error: myErr } = await supabase
            .from("development_team_members")
            .select("design_id")
            .eq("user_id", fetchedUserId);
          if (!myErr && myRows) {
            myJoinedIds = myRows.map((r: any) => r.design_id);
          }
        }
      } catch (e) {
        console.warn("Could not fetch user's joined team ids:", e);
      }

      setUserJoinedDesignIds(myJoinedIds);

      console.log("🔍 Debug - Ongoing with joined users:", ongoing);
      console.log("🔍 Debug - Completed with joined users:", completed);
      console.log("🔍 Debug - User's ongoing projects:", 
        ongoing.filter(design => 
          design.joinedUsers?.some(u => u.user_id === currentUserId)
        )
      );
      console.log("🔍 Debug - User's completed projects:", 
        completed.filter(design => 
          design.joinedUsers?.some(u => u.user_id === currentUserId)
        )
      );

      setAcceptedDesigns(accepted);
      setOngoingDesigns(ongoing);
      setCompletedDesigns(completed);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load designs. Please check your database connection.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      // Test if designs table exists and has any data
      const { data: allDesigns, error: allError } = await supabase
        .from("designs")
        .select("id, name, status")
        .limit(10);

      // Test if profiles table exists
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .limit(5);

      // Test specific statuses
      const { data: statusTest, error: statusError } = await supabase
        .from("designs")
        .select("status")
        .in("status", ["accepted", "in_development", "completed"]);
    } catch (error) {}
  };
  const getUserDisplayName = (user: DesignWithUser["user"]) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.username) {
      return user.username;
    }
    return user.email;
  };

  // Check if the current user has joined the given design.
  // We check both the joinedUsers array (if populated) and the
  // fallback userJoinedDesignIds which is populated by a direct
  // select from development_team_members for the current user.
  const isDesignJoinedByCurrentUser = (design: DesignWithUserAndJoined) => {
    if (!currentUserId) return false;
    if (design.joinedUsers?.some((u) => u.user_id === currentUserId)) return true;
    return userJoinedDesignIds.includes(design.id);
  };

  // Return true if the current user already participates in any ongoing project
  const userHasOngoingProject = () => {
    if (!currentUserId) return false;
    return ongoingDesigns.some((d) => isDesignJoinedByCurrentUser(d));
  };

  const DesignCard = ({
    design,
    showJoinButton = false,
  }: {
    design: DesignWithUserAndJoined;
    showJoinButton?: boolean;
  }) => {
    const isFull = design.joinedCount >= design.pages_count;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow max-w-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {design.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-whit mb-2">
              <span>{TYPE_LABELS[design.type]}</span>
              <span>•</span>
              <span>
                {design.pages_count} page{design.pages_count > 1 ? "s" : ""}
              </span>
            </div>
            {/* Team info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-white mb-2">
              <span>
                Total allowed: <b>{design.pages_count}</b>
              </span>
              <span>
                Joined: <b>{design.joinedCount}</b>
              </span>
              <span>
                Remaining:{" "}
                <b>{Math.max(0, design.pages_count - design.joinedCount)}</b>
              </span>
            </div>
            {/* Show joined users if any */}
            {design.joinedUsers && design.joinedUsers.length > 0 && (
              <div className="mt-2 text-xs text-white">
                <span className="font-semibold">Team Members:</span>
                <div className="mt-1 space-y-1">
                  {design.joinedUsers.map((user, index) => {
                    const displayName =
                      user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : user.first_name ||
                          user.last_name ||
                          user.username ||
                          user.email.split("@")[0];

                    return (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between bg-white/10 rounded px-2 py-1"
                      >
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {displayName}
                        </span>
                        {user.role && (
                          <span className="text-xs opacity-75 capitalize">
                            {user.role}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {design.joinedUsers.length < design.pages_count && (
                  <div className="mt-1 text-xs opacity-75">
                    💡 {design.pages_count - design.joinedUsers.length} more
                    spot
                    {design.pages_count - design.joinedUsers.length !== 1
                      ? "s"
                      : ""}{" "}
                    available
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                STATUS_COLORS[design.status]
              }`}
            >
              {STATUS_LABELS[design.status]}
            </span>
          </div>
        </div>

        {/* Description */}
        {design.description && (
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            {design.description}
          </p>
        )}

        {/* Figma Link */}
        {design.figma_link && (
          <div className="mb-4">
            <a
              href={design.figma_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 2H8.4c-1.9 0-3.4 1.5-3.4 3.4v13.1c0 1.9 1.5 3.4 3.4 3.4h.9c1.9 0 3.4-1.5 3.4-3.4V16h3.3c3.7 0 6.7-3 6.7-6.7S19.7 2.6 16 2.6L15.5 2zm0 9.3H12v3.4c0 .9-.7 1.7-1.7 1.7h-.9c-.9 0-1.7-.7-1.7-1.7V5.4c0-.9.7-1.7 1.7-1.7h7.1c2.8 0 5 2.2 5 5S18.3 11.3 15.5 11.3z" />
              </svg>
              View Design in Figma
            </a>
          </div>
        )}

        {/* Admin Notes */}
        {design.admin_notes && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Project Notes:</strong> {design.admin_notes}
            </p>
          </div>
        )}

        {/* Join Button for Accepted Designs */}
        {showJoinButton && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className={`flex-1 ${
                isFull || (userHasOngoingProject() && !isDesignJoinedByCurrentUser(design))
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200`}
              onClick={() => {
                if (isFull) return;
                if (userHasOngoingProject() && !isDesignJoinedByCurrentUser(design)) {
                  alert("You can only participate in one ongoing project at a time. Finish your current project before joining another.");
                  return;
                }
                joinDesignTeam(design.id);
              }}
              disabled={isFull || (userHasOngoingProject() && !isDesignJoinedByCurrentUser(design))}
            >
              {isFull
                ? "Team Full"
                : userHasOngoingProject() && !isDesignJoinedByCurrentUser(design)
                ? "Already in another project"
                : "Join Project"}
            </button>
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
              View Details
            </button>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({
    title,
    count,
    description,
    icon,
  }: {
    title: string;
    count: number;
    description: string;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center">
          {icon}
          <h2 className="text-2xl font-bold text-white ml-2">{title}</h2>
          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {count}
          </span>
        </div>
        <p className="text-white mt-1">{description}</p>
      </div>
    </div>
  );

  const debugTeamMembers = async () => {
    try {
      console.log("🔍 Debug: Checking development_team_members table...");

      // Get all team members with user details
      const { data: allMembers, error } = await supabase
        .from("development_team_members")
        .select(
          `
          *,
          profiles!user_id (
            email,
            first_name,
            last_name,
            username
          ),
          designs!design_id (
            name,
            status
          )
        `
        )
  ;

      console.log("All team members:", allMembers);
      if (error) console.error("Error:", error);

      alert(
        `Found ${
          allMembers?.length || 0
        } team members. Check console for details.`
      );
    } catch (error) {
      console.error("Debug error:", error);
      alert("Error checking team members. Check console.");
    }
  };

  const joinDesignTeam = async (designId: string) => {
    // Find the design object to check joinedCount and pages_count
    const design =
      acceptedDesigns.find((d) => d.id === designId) ||
      ongoingDesigns.find((d) => d.id === designId);
    if (!design) {
      alert("Project not found.");
      return;
    }
    if (design.joinedCount >= design.pages_count) {
      alert("This project team is already full.");
      return;
    }

    try {
      // Enforce rule: user can only join one ongoing project at a time.
      // Check if the user already has a joined in_development design (excluding this design)
      if (currentUserId) {
        try {
          const { data: existingRows, error: existingError } = await supabase
            .from("development_team_members")
            .select(`
              development_team_members.design_id,
              designs!development_team_members_design_id (status)
            `)
            .eq("user_id", currentUserId);

          if (!existingError && existingRows && existingRows.length > 0) {
            // We need to inspect the associated design status for each row.
            const joinedOngoing = existingRows.some((r: any) => {
              const status = r?.designs?.status || r?.development_team_members_design_id?.status || null;
              const id = r?.design_id;
              return id !== designId && status === "in_development";
            });
            if (joinedOngoing) {
              alert("You are already participating in an ongoing project. You may only join one ongoing project at a time.");
              return;
            }
          }
        } catch (e) {
          // If the check fails for some reason, allow the normal flow but warn in console.
          console.warn("Could not verify user's existing ongoing projects:", e);
        }
      }
      // First, ensure the user has a profile in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", currentUserId)
        .single();

      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { error: createProfileError } = await supabase
            .from("profiles")
            .insert({
              id: currentUserId,
              email: userData.user.email || "",
              first_name: userData.user.user_metadata?.first_name || "",
              last_name: userData.user.user_metadata?.last_name || "",
              username:
                userData.user.user_metadata?.username ||
                userData.user.email?.split("@")[0] ||
                "",
            });

          if (createProfileError) {
            alert(
              "Failed to create user profile: " + createProfileError.message
            );
            return;
          }
        }
      }

      // Now try to join the team
      const { error: insertError } = await supabase
        .from("development_team_members")
        .insert({
          design_id: designId,
          user_id: currentUserId,
          joined_at: new Date().toISOString(),
        });

      if (insertError) {
        if (insertError.code === "23505") {
          alert("You have already joined this project.");
        } else if (insertError.code === "42P01") {
          alert(
            "Development team feature is not yet available. The database table needs to be created."
          );
        } else {
          alert("Failed to join project: " + insertError.message);
        }
      } else {
        alert("You have joined the project!");
        loadDesigns(); // Refresh the data
      }
    } catch (error) {
      console.error("Error joining team:", error);
      alert("An unexpected error occurred while joining the project.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading development projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Projects
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDesigns}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900  py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Development Hub</h1>
          <p className="mt-2 text-white">
            Join development teams and explore
            completed work.
          </p>

          {/* Section Navigation Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => setSectionFilter("join")}
              className={`px-4 py-2 rounded-md transition ${
                sectionFilter === "join"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              Join Now
            </button>
            <button
              onClick={() => setSectionFilter("ongoing")}
              className={`px-4 py-2 rounded-md transition ${
                sectionFilter === "ongoing"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              Ongoing Projects
            </button>
            <button
              onClick={() => setSectionFilter("completed")}
              className={`px-4 py-2 rounded-md transition ${
                sectionFilter === "completed"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Completed Projects
            </button>
          </div>
        </div>

        {/* Join Now Section - Accepted Designs */}
        {(sectionFilter === "all" || sectionFilter === "join") && (
          <section id="join-now-section" className="mb-12">
            <SectionHeader
              title="Join Now"
              count={acceptedDesigns.length}
              description=""
              icon={
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
            />

            {acceptedDesigns.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 max-w-md border-dashed border-gray-300 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  NO project awilable
                </h3>
                <p className="text-gray-600">
                  There are currently no approved designs ready for development.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {acceptedDesigns.map((design) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    showJoinButton={true}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        {/* Ongoing Projects Section */}
        {(sectionFilter === "all" || sectionFilter === "ongoing") && (
          <section id="ongoing-section" className="mb-12">
            <SectionHeader
              title="Ongoing Projects"
              count={currentUserId ? ongoingDesigns.filter(isDesignJoinedByCurrentUser).length : 0}
              description=""
              icon={
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
            />

            {currentUserId && ongoingDesigns.filter(isDesignJoinedByCurrentUser).length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 max-w-md border-dashed border-gray-300 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Ongoing Projects
                </h3>
                <p className="text-gray-600">
                  You have not joined any ongoing projects yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ongoingDesigns.filter(isDesignJoinedByCurrentUser).map((design) => (
                    <DesignCard key={design.id} design={design} />
                  ))}
              </div>
            )}
          </section>
        )}
        {/* Completed Projects Section */}
        {(sectionFilter === "all" || sectionFilter === "completed") && (
          <section id="completed-section">
            <SectionHeader
              title="Completed Projects"
              count={currentUserId ? completedDesigns.filter(isDesignJoinedByCurrentUser).length : 0}
              description=""
              icon={
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
            />

            {currentUserId && completedDesigns.filter(isDesignJoinedByCurrentUser).length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 max-w-md border-dashed border-gray-300 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Completed Projects
                </h3>
                <p className="text-gray-600">
                  You have not completed any projects yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedDesigns.filter(isDesignJoinedByCurrentUser).map((design) => (
                    <DesignCard key={design.id} design={design} />
                  ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
