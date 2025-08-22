
"use client";
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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

const TYPE_LABELS = {
	website: 'Website',
	web_application: 'Web Application',
	landing_page: 'Landing Page'
};

const STATUS_LABELS = {
	pending: 'Under Review',
	accepted: 'Accepted',
	in_development: 'In Development', 
	completed: 'Completed',
	rejected: 'Rejected'
};

const STATUS_COLORS = {
	pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	accepted: 'bg-green-100 text-green-800 border-green-200',
	in_development: 'bg-blue-100 text-blue-800 border-blue-200',
	completed: 'bg-purple-100 text-purple-800 border-purple-200',
	rejected: 'bg-red-100 text-red-800 border-red-200'
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'short', 
		day: 'numeric' 
	});
}

export default function ProfilePage() {
	const [designCount, setDesignCount] = useState(0);
	const [developmentCount, setDevelopmentCount] = useState(0);
	const [badges, setBadges] = useState<Badge[]>([]);
	const [points, setPoints] = useState(0);
	const [level, setLevel] = useState(1);
	const [loading, setLoading] = useState(true);
	const [activeView, setActiveView] = useState<'design' | 'development' | null>(null);
	const [designs, setDesigns] = useState<Design[]>([]);

	// LinkedIn sharing function
	const shareBadgeOnLinkedIn = (badge: Badge) => {
		const badgeUrl = window.location.origin + '/profile'; // Could be a dedicated badge page
		const text = `🎉 I just earned the "${badge.name}" badge on OpenStage! ${badge.description}`;
		const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgeUrl)}&text=${encodeURIComponent(text)}`;
		window.open(linkedInUrl, '_blank', 'width=600,height=400');
	};

	useEffect(() => {
		async function fetchProfileStats() {
			setLoading(true);
			// Get current user
			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) return setLoading(false);
			const userId = user.id;

			// 1. Count designs made by user and get design data
			const { count: designCountRaw, data: designsData } = await supabase
				.from('designs')
				.select(`
					*,
					status_history:design_status_history(*)
				`, { count: 'exact' })
				.eq('user_id', userId)
				.order('created_at', { ascending: false });
			setDesignCount(designCountRaw || 0);
			setDesigns(designsData || []);

			// 2. Count completed developments (projects user joined and completed)
			// NOTE: This assumes a 'development_team_members' table exists with design_id, user_id, and design status is 'completed'.
			const { count: devCountRaw } = await supabase
				.from('development_team_members')
				.select('design_id', { count: 'exact', head: true })
				.eq('user_id', userId)
				.eq('designs.status', 'completed')
				.select('*,designs!inner(status)'); // join with designs to filter completed
			setDevelopmentCount(devCountRaw || 0);

			// 3. Get badges/achievements
			// NOTE: This assumes a 'user_achievements' table exists with user_id, achievement_id
			const { data: badgeRows } = await supabase
				.from('user_achievements')
				.select('achievement_id, achievements:achievement_id(name, description, icon_url, badge_color)')
				.eq('user_id', userId);
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
					name: row.achievements?.name ?? '',
					description: row.achievements?.description ?? '',
					icon_url: row.achievements?.icon_url,
					badge_color: row.achievements?.badge_color,
				})) || []
			);

			// 4. Calculate points (example: 10 per approved design, 20 per completed dev)
			const points = (designCountRaw || 0) * 10 + (devCountRaw || 0) * 20;
			setPoints(points);

			// 5. Calculate level (example: every 100 points = next level)
			setLevel(Math.floor(points / 100) + 1);

			setLoading(false);
		}
		fetchProfileStats();
	}, []);

	if (loading) return <div className="p-8 text-center">Loading profile...</div>;

		// Find design and development completion badges by name (adjust names as needed)
			const designBadge = badges.find(b => b.name?.toLowerCase().includes('design'));
			const developmentBadge = badges.find(b => b.name?.toLowerCase().includes('development') || b.name?.toLowerCase().includes('project completer'));

			return (
			    <div className="max-w-7xl mx-auto p-8">
					<h1 className="text-2xl font-bold mb-6">Profile Overview</h1>

					{/* Earned Badges Section - Clickable for LinkedIn Sharing */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4">🏆 Your Achievements (Click to share on LinkedIn!)</h2>
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
											src={badge.icon_url || (badge.name?.toLowerCase().includes('design') ? '/design-badge.png' : '/development-badge.webp')} 
											alt={badge.name} 
											className="w-16 h-16 mb-2" 
										/>
										{/* Share icon overlay */}
										<div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
											</svg>
										</div>
									</div>
									<span className="text-sm text-center text-gray-700 font-medium">{badge.name}</span>
									<span className="text-xs text-center text-gray-500">{badge.description}</span>
								</div>
							))}
						</div>
						{badges.length === 0 && (
							<div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
								🎯 Complete your first design or development project to earn shareable badges!
							</div>
						)}
					</div>

				  <div className="grid grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-4 text-center">
						<div className="text-3xl font-bold text-blue-600">{designCount}</div>
						<div className="text-gray-700">Designs Created</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4 text-center">
						<div className="text-3xl font-bold text-green-600">{developmentCount}</div>
						<div className="text-gray-700">Developments Completed</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4 text-center">
						<div className="text-3xl font-bold text-purple-600">{badges.length}</div>
						<div className="text-gray-700">Badges Earned</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4 text-center">
						<div className="text-3xl font-bold text-yellow-600">{points}</div>
						<div className="text-gray-700">Points</div>
					</div>
				  </div>
				<div className='flex flex-row border-t border-gray-300 pt-6'>
					<div className='flex flex-col gap-5 p-8 max-w-2xl border-r border-gray-300 pr-8'>
						<button 
							className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
							onClick={() => setActiveView('design')}
						>
							Design Project
						</button>
						<button 
							className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
							onClick={() => setActiveView('development')}
						>
							Development Project
						</button>
					</div>
					<div className='flex-1 p-8 rounded-lg'>
						{activeView === 'design' && (
							<div className="bg-blue-500 text-white px-4 py-2 rounded">
								<h2 className="text-xl font-semibold mb-4">Design Details</h2>
								{/* User's Designs Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Design Submissions</h2>
          
          {designs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-500">You haven&apos;t submitted any designs yet.</p>
              <p className="text-sm text-gray-400 mt-1">Submit your first design using the form above!</p>
            </div>
          ) : (
            <div className="space-y-6">
									{designs.map((design: Design) => (
										<div key={design.id} className="border border-gray-200 rounded-lg p-6">
											{/* Design Header */}
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
												<div>
													<h3 className="text-lg font-medium text-gray-900">{design.name}</h3>
													<div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
														<span>{TYPE_LABELS[design.type as keyof typeof TYPE_LABELS] || design.type}</span>
														<span>•</span>
														<span>{design.pages_count} page{design.pages_count > 1 ? 's' : ''}</span>
														<span>•</span>
														<span>Submitted {formatDate(design.created_at)}</span>
													</div>
												</div>
												<div className="mt-3 sm:mt-0">
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[design.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
														{STATUS_LABELS[design.status as keyof typeof STATUS_LABELS] || design.status}
													</span>
												</div>
											</div>                  {/* Description */}
                  {design.description && (
                    <p className="text-gray-600 mb-4">{design.description}</p>
                  )}

                  {/* Figma Link */}
                  {design.figma_link && (
                    <div className="mb-4">
                      <a
                        href={design.figma_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.5 2H8.4c-1.9 0-3.4 1.5-3.4 3.4v13.1c0 1.9 1.5 3.4 3.4 3.4h.9c1.9 0 3.4-1.5 3.4-3.4V16h3.3c3.7 0 6.7-3 6.7-6.7S19.7 2.6 16 2.6L15.5 2zm0 9.3H12v3.4c0 .9-.7 1.7-1.7 1.7h-.9c-.9 0-1.7-.7-1.7-1.7V5.4c0-.9.7-1.7 1.7-1.7h7.1c2.8 0 5 2.2 5 5S18.3 11.3 15.5 11.3z"/>
                        </svg>
                        View Figma Design
                      </a>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Progress Timeline</h4>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {/* Initial submission */}
                        <li>
                          <div className="relative pb-8">
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-900">Design submitted</p>
                                  <p className="text-xs text-gray-500">{formatDate(design.created_at)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>

                        {/* Status history */}
                        {design.status_history?.map((history, index) => {
                          const isLast = index === design.status_history!.length - 1
                          return (
                            <li key={history.id}>
                              <div className={`relative ${!isLast ? 'pb-8' : ''}`}>
                                {!isLast && (
                                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                )}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                      history.status === 'accepted' ? 'bg-green-500' :
                                      history.status === 'in_development' ? 'bg-blue-500' :
                                      history.status === 'completed' ? 'bg-purple-500' :
                                      history.status === 'rejected' ? 'bg-red-500' :
                                      'bg-yellow-500'
                                    }`}>
                                      {history.status === 'completed' ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      ) : history.status === 'rejected' ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5">
                                    <div>
                                      <p className="text-sm text-gray-900">{STATUS_LABELS[history.status as keyof typeof STATUS_LABELS]}</p>
                                      <p className="text-xs text-gray-500">{formatDate(history.created_at)}</p>
                                      {history.notes && (
                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
							</div>
						)}
						{activeView === 'development' && (
							<div className="bg-blue-500 text-white px-4 py-2 rounded">
								<h2 className="text-xl font-semibold mb-4">Development Details</h2>
								<div className="space-y-3">
									<p><strong>Completed Projects:</strong> {developmentCount}</p>
									<p><strong>Points from Development:</strong> {developmentCount * 20}</p>
									{developmentBadge && (
										<div className="flex items-center gap-2">
											<img src={developmentBadge.icon_url || '/development-badge.webp'} alt="Development Badge" className="w-8 h-8" />
											<span><strong>Badge:</strong> {developmentBadge.name}</span>
										</div>
									)}
									<p className="text-gray-600">{developmentBadge?.description}</p>
								</div>
							</div>
						)}
						{!activeView && (
							<div>
								<h2 className="text-xl font-semibold mb-4">Select a category</h2>
								<p className="text-gray-600">Click on Design Project or Development Project to view details.</p>
							</div>
						)}
					</div>
				</div>
				  {/* TODO: Add more profile info, recent activity, etc. */}
			    </div>
		    );
}
