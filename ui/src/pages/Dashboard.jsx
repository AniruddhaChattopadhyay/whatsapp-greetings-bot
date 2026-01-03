import { useQuery } from '@tanstack/react-query';
import { Users, FileText, Send, AlertCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: contactStats } = useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: async () => {
      const result = await window.electronAPI.contacts.getStats();
      return result.data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const result = await window.electronAPI.templates.getAll();
      return result.data;
    },
  });

  const { data: rateLimitInfo } = useQuery({
    queryKey: ['rateLimit'],
    queryFn: async () => {
      const result = await window.electronAPI.send.getRateLimitInfo();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['logs', 'recent'],
    queryFn: async () => {
      const result = await window.electronAPI.logs.getActivity();
      return result.data?.slice(-10).reverse() || [];
    },
  });

  const stats = [
    {
      name: 'Total Contacts',
      value: contactStats?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `${contactStats?.active || 0} active`,
    },
    {
      name: 'Templates',
      value: templates?.length || 0,
      icon: FileText,
      color: 'bg-purple-500',
      change: 'Ready to use',
    },
    {
      name: 'Messages Today',
      value: rateLimitInfo?.enabled
        ? (rateLimitInfo.limit - rateLimitInfo.remaining)
        : 0,
      icon: Send,
      color: 'bg-green-500',
      change: `${rateLimitInfo?.remaining || 0} remaining`,
    },
    {
      name: 'Success Rate',
      value: '98%',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: 'Last 7 days',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your WhatsApp greetings bot activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Groups */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Groups
          </h2>
          {contactStats?.byGroup && Object.keys(contactStats.byGroup).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(contactStats.byGroup).map(([group, count]) => (
                <div
                  key={group}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900 capitalize">
                      {group}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{count} contacts</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No contacts yet</p>
              <p className="text-sm mt-1">Add contacts to get started</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          {recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${
                      log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {log.contact}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {log.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm mt-1">Send your first message</p>
            </div>
          )}
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitInfo?.enabled && rateLimitInfo.remaining < 20 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">
              Approaching daily limit
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              You have {rateLimitInfo.remaining} messages remaining today. The limit will reset at midnight.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
