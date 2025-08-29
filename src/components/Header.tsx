import React, { useState } from 'react';
import { Menu, X, Sparkles, User, Settings, ChevronDown, Home, BarChart3, Brain, TrendingUp, Video, CreditCard, Shield } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigation = [
    { 
      name: 'Studio', 
      href: '/', 
      icon: Home,
      description: 'Upload & optimize listings'
    },
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3,
      description: 'View your performance'
    },
    {
      name: 'AI Tools',
      icon: Brain,
      description: 'Advanced AI features',
      dropdown: [
        { name: 'Behavioral Analysis', href: '/behavioral', icon: Brain, description: 'Understand buyer behavior' },
        { name: 'Market Intelligence', href: '/insights', icon: TrendingUp, description: 'Latest market trends' },
        { name: 'Video Studio', href: '/video-studio', icon: Video, description: 'Create product videos' }
      ]
    },
    { 
      name: 'Pricing', 
      href: '/pricing', 
      icon: CreditCard,
      description: 'View plans & billing'
    },
    { 
      name: 'Admin', 
      href: '/admin', 
      icon: Shield,
      description: 'System administration',
      adminOnly: true
    }
  ];

  const isActive = (href: string) => currentPage === href;
  const isDropdownActive = (dropdown: any[]) => dropdown.some(item => isActive(item.href));

  const handleNavigation = (href: string) => {
    setCurrentPage(href);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleClickOutside = () => {
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-8 w-8 text-orange-500" />
              <div>
                <span className="text-xl font-bold text-gray-900">EtsyStudio AI</span>
                <div className="text-xs text-gray-500 -mt-1">Powered by Claude 3</div>
              </div>
            </button>
            
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative dropdown-container">
                  {item.dropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDropdownActive(item.dropdown) || activeDropdown === item.name
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    </button>
                  ) : item.adminOnly ? (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title={item.description}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.name}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title={item.description}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  )}
                  
                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {item.dropdown.map((dropdownItem) => (
                        <button
                          key={dropdownItem.name}
                          onClick={() => handleNavigation(dropdownItem.href)}
                          className={`w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            isActive(dropdownItem.href) ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                          }`}
                        >
                          <dropdownItem.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            isActive(dropdownItem.href) ? 'text-orange-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium">{dropdownItem.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{dropdownItem.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Free Plan</span>
            </div>
            
            <button 
              onClick={() => {
                // Account functionality
                alert('Opening account settings...');
              }}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <User className="h-4 w-4" />
              <span>Account</span>
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div>
                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-500 text-sm font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.dropdown.map((dropdownItem) => (
                        <button
                          key={dropdownItem.name}
                          onClick={() => handleNavigation(dropdownItem.href)}
                          className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(dropdownItem.href)
                              ? 'text-orange-600 bg-orange-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <dropdownItem.icon className="h-4 w-4" />
                          <div className="text-left">
                            <div>{dropdownItem.name}</div>
                            <div className="text-xs text-gray-500">{dropdownItem.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="text-left">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                )}
              </div>
            ))}
            
            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-500 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free Plan • 2 listings remaining</span>
              </div>
              <button 
                onClick={() => {
                  // Mobile account functionality
                  alert('Opening account settings...');
                }}
                className="flex items-center space-x-3 px-3 py-2 w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Account Settings</div>
                  <div className="text-xs text-gray-500">Manage your profile</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;