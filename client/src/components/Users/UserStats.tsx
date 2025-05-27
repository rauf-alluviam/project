import React from 'react';
import { Users, Shield, UserCheck, Clock } from 'lucide-react';

interface UserStatsProps {
  stats: {
    totalUsers: number;
    recentUsers: number;
    roleStats: Record<string, number>;
    departmentStats: Record<string, number>;
  } | null;
  loading: boolean;
}

const UserStats: React.FC<UserStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-200 rounded-md p-3 w-12 h-12"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
    {
      title: 'Admins',
      value: stats.roleStats.admin || 0,
      icon: Shield,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-700'
    },
    {
      title: 'Supervisors',
      value: stats.roleStats.supervisor || 0,
      icon: UserCheck,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-700'
    },
    {
      title: 'Recent (30 days)',
      value: stats.recentUsers,
      icon: Clock,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserStats;
