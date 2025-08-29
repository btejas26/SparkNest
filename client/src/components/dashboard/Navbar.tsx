import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Feather, Menu, Search, StickyNote, Home, Settings, LogOut, X } from "lucide-react";

interface NavbarProps {
  onShowWelcome: () => void;
  onShowNotes: () => void;
}

export default function Navbar({ onShowWelcome, onShowNotes }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const getUserInitials = () => {
    if (!user) return "U";
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and App Name */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Feather className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground hidden sm:block">SparkNest</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={onShowWelcome}
                data-testid="button-home"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={onShowNotes}
                data-testid="button-notes"
              >
                <StickyNote className="h-4 w-4" />
                All Notes
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 bg-muted hover:bg-accent rounded-lg px-3 py-2"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
                    <div className="p-3 border-b border-border">
                      <p className="font-medium" data-testid="text-username">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Button variant="ghost" className="w-full justify-start text-sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Preferences
                      </Button>
                      <hr className="my-2 border-border" />
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                        data-testid="button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden">
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border transform transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Feather className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">SparkNest</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    onShowWelcome();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Home className="mr-3 h-4 w-4" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    onShowNotes();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <StickyNote className="mr-3 h-4 w-4" />
                  All Notes
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Search className="mr-3 h-4 w-4" />
                  Search
                </Button>
                <hr className="my-4 border-border" />
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
