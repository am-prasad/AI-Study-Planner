import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/timetable', label: 'Timetable', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">StudyAI</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`gap-2 ${isActive ? 'shadow-md' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="gradient-primary text-white">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="gradient-primary text-white text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full flex flex-col gap-1 h-auto py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
