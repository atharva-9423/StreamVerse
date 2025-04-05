import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/use-auth';
import BackButton from '@/components/BackButton';
import DownloadManager from '@/components/DownloadManager';
import Logo from '@/components/Logo';
import { 
  Search, 
  Menu, 
  Bell, 
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Download
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize state
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchValue)}`;
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 w-full z-50 py-4 transition-all duration-300',
        isScrolled ? 'bg-background' : 'transparent-navbar'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <BackButton className="mr-1" />
              <Logo href="/" size="md" />
            </div>
            <div className="hidden md:flex items-center ml-10 space-x-6">
              <Link 
                href="/" 
                className={`hover:text-primary font-medium transition ${location === '/' ? 'text-primary' : 'text-foreground'}`}
              >
                Home
              </Link>
              <Link 
                href="/anime" 
                className={`hover:text-primary font-medium transition ${location === '/anime' ? 'text-primary' : 'text-foreground'}`}
              >
                All Anime
              </Link>
              <Link 
                href="/trending" 
                className={`hover:text-primary font-medium transition ${location === '/trending' ? 'text-primary' : 'text-foreground'}`}
              >
                Trending
              </Link>
              <Link 
                href="/new" 
                className="text-foreground hover:text-primary font-medium transition"
              >
                New
              </Link>
              <Link 
                href="/my-list" 
                className="text-foreground hover:text-primary font-medium transition"
              >
                My List
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search anime titles..."
                className="bg-muted text-foreground border border-border rounded-full py-2 pl-4 pr-10 w-40 lg:w-64 focus:outline-none focus:border-primary"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <Link href="/search">
                <Search className="h-5 w-5 text-foreground" />
              </Link>
            </Button>
            
            {/* Theme toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background border-r border-border">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <Logo href="/" size="sm" />
                    {/* Theme toggle in mobile menu */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="text-foreground"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <Link 
                      href="/"
                      className="block text-lg font-medium hover:text-primary transition"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/anime"
                      className="block text-lg font-medium hover:text-primary transition"
                    >
                      All Anime
                    </Link>
                    <Link 
                      href="/trending"
                      className="block text-lg font-medium hover:text-primary transition"
                    >
                      Trending
                    </Link>
                    <Link 
                      href="/new"
                      className="block text-lg font-medium hover:text-primary transition"
                    >
                      New
                    </Link>
                    <Link 
                      href="/my-list"
                      className="block text-lg font-medium hover:text-primary transition"
                    >
                      My List
                    </Link>
                    <Link 
                      href="/search"
                      className="block text-lg font-medium hover:text-primary transition"
                    >
                      Search
                    </Link>
                    
                    {/* Mobile menu authentication */}
                    {!user ? (
                      <Link 
                        href="/auth"
                        className="block text-lg font-medium text-primary hover:opacity-80 transition"
                      >
                        Login / Register
                      </Link>
                    ) : (
                      <>
                        <div className="pt-4 mt-4 border-t border-border">
                          <div className="flex items-center mb-4">
                            <div className="flex h-10 w-10 rounded-full bg-primary text-primary-foreground items-center justify-center font-medium">
                              {user.username[0]?.toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">{user.username}</p>
                            </div>
                          </div>
                          <Link 
                            href="/profile"
                            className="flex items-center text-lg font-medium hover:text-primary transition py-2"
                          >
                            <User className="mr-3 h-5 w-5" />
                            Profile
                          </Link>
                          <Link 
                            href="/settings"
                            className="flex items-center text-lg font-medium hover:text-primary transition py-2"
                          >
                            <Settings className="mr-3 h-5 w-5" />
                            Settings
                          </Link>
                          <button
                            onClick={() => logoutMutation.mutate()}
                            disabled={logoutMutation.isPending}
                            className="flex items-center w-full text-left text-lg font-medium text-red-500 hover:text-red-600 transition py-2"
                          >
                            <LogOut className="mr-3 h-5 w-5" />
                            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Download manager */}
            {user && <DownloadManager />}

            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Bell className="h-5 w-5 text-foreground" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hidden md:flex h-8 w-8 rounded-full bg-primary text-primary-foreground items-center justify-center font-medium cursor-pointer">
                    {user.username[0]?.toUpperCase() || 'U'}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-8 w-8 rounded-full bg-primary text-primary-foreground items-center justify-center font-medium">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
                <Link href="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
