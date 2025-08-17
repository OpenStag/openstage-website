
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

export default function ProfilePage() {
	const [designCount, setDesignCount] = useState(0);
	const [developmentCount, setDevelopmentCount] = useState(0);
	const [badges, setBadges] = useState<Badge[]>([]);
	const [points, setPoints] = useState(0);
	const [level, setLevel] = useState(1);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchProfileStats() {
			setLoading(true);
			// Get current user
			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) return setLoading(false);
			const userId = user.id;

			// 1. Count designs made by user
			const { count: designCountRaw } = await supabase
				.from('designs')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', userId);
			setDesignCount(designCountRaw || 0);

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
			setBadges(
				badgeRows?.map((row: any) => ({
					id: row.achievement_id,
					...row.achievements
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

	return (
		<div className="max-w-2xl mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Profile Overview</h1>
			<div className="grid grid-cols-2 gap-6 mb-8">
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
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-2">Level {level}</h2>
				<div className="w-full bg-gray-200 rounded-full h-4 mb-2">
					<div
						className="bg-blue-500 h-4 rounded-full"
						style={{ width: `${(points % 100)}%` }}
					></div>
				</div>
				<div className="text-sm text-gray-500">{100 - (points % 100)} points to next level</div>
			</div>
			<div>
				<h2 className="text-xl font-semibold mb-4">Badges</h2>
				{badges.length === 0 ? (
					<div className="text-gray-500">No badges earned yet.</div>
				) : (
					<div className="flex flex-wrap gap-4">
						{badges.map(badge => (
							<div key={badge.id} className="flex flex-col items-center p-2 bg-gray-50 rounded shadow" style={{ borderColor: badge.badge_color || '#ccc', borderWidth: 2 }}>
								{badge.icon_url ? (
									<img src={badge.icon_url} alt={badge.name} className="w-10 h-10 mb-1" />
								) : (
									<span className="w-10 h-10 mb-1 rounded-full bg-gray-200 flex items-center justify-center text-lg" style={{ backgroundColor: badge.badge_color || '#ccc' }}>🏅</span>
								)}
								<div className="font-semibold text-sm">{badge.name}</div>
								<div className="text-xs text-gray-500">{badge.description}</div>
							</div>
						))}
					</div>
				)}
			</div>
			{/* TODO: Add more profile info, recent activity, etc. */}
		</div>
	);
}
