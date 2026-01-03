import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  ScrollText,
  Settings,
  MessageCircle
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Contacts', to: '/contacts', icon: Users },
  { name: 'Templates', to: '/templates', icon: FileText },
  { name: 'Send', to: '/send', icon: Send },
  { name: 'Logs', to: '/logs', icon: ScrollText },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <MessageCircle className="w-8 h-8 text-primary-600" />
          <span className="ml-3 text-lg font-semibold text-gray-900">
            Greetings Bot
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected to WhatsApp
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
