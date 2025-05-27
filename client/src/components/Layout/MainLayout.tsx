import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  QrCode, 
  Users, 
  BarChart2, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  Home 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/documents', label: 'Documents', icon: <FileText size={20} /> },
    { path: '/qr-codes', label: 'QR Codes', icon: <QrCode size={20} /> },
    { path: '/users', label: 'Users', icon: <Users size={20} />, adminOnly: true },
    { path: '/reports', label: 'Reports', icon: <BarChart2 size={20} />, supervisorOnly: true }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) return user?.role === 'admin';
    if (item.supervisorOnly) return user?.role === 'admin' || user?.role === 'supervisor';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center">
            <button 
              onClick={toggleMobileSidebar} 
              className="mr-3 text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-blue-800" />
              <span className="text-xl font-bold text-gray-900">QRLocker</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center">
              <div className="hidden md:block mr-4">
                <div className="text-sm text-gray-700">{user?.username}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role === 'user' ? 'employee' : user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
        <aside 
          className={`hidden lg:block bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="h-full flex flex-col justify-between py-6">
            <div>
              <button 
                onClick={toggleSidebar} 
                className="mb-6 mx-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              
              <nav className="px-3 space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center px-3 py-3 rounded-md transition-colors duration-150 ease-in-out
                      ${location.pathname === item.path 
                        ? 'bg-blue-50 text-blue-800' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-50"
              onClick={toggleMobileSidebar}
            ></div>
            <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-2">
                  <QrCode className="h-6 w-6 text-blue-800" />
                  <span className="text-lg font-bold text-gray-900">QRLocker</span>
                </Link>
                <button 
                  onClick={toggleMobileSidebar}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-2 py-4">
                <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role === 'user' ? 'employee' : user?.role}</div>
                </div>
                
                <nav className="space-y-1">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={toggleMobileSidebar}
                      className={`
                        flex items-center px-3 py-3 rounded-md transition-colors duration-150 ease-in-out
                        ${location.pathname === item.path 
                          ? 'bg-blue-50 text-blue-800' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;