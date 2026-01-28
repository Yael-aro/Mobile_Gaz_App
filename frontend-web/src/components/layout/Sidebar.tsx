import { NavLink, useLocation } from 'react-router-dom';
import { Truck } from 'lucide-react'; 
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ArrowLeftRight, 
  FileBarChart, 
  Settings,
  LogOut,
  Fuel,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'cantinier', 'client'] },
  { name: 'Bouteilles', href: '/bottles', icon: Package, roles: ['admin', 'cantinier'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'cantinier'] },
  { name: 'Mouvements', href: '/movements', icon: ArrowLeftRight, roles: ['admin', 'cantinier'] },
  { name: 'Cantiniers', href: '/cantiniers', icon: Truck, roles: ['admin'] }, // ← AJOUTE CETTE LIGNE
  { name: 'Rapports', href: '/reports', icon: FileBarChart, roles: ['admin'] },
  { name: 'Paramètres', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavigation = navigation.filter(
    item => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Fuel className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-lg text-sidebar-foreground">Eluxtan</h1>
                <p className="text-xs text-sidebar-foreground/60">Gestion Gaz</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="animate-fade-in">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-sidebar-border">
          {user && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50",
              collapsed && "justify-center"
            )}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
                </div>
              )}
            </div>
          )}
   
        </div>
      </aside>

      {/* Spacer for content */}
      <div className={cn(
        "hidden lg:block transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )} />
    </>
  );
}
