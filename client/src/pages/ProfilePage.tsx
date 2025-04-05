import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Movie, WatchHistory } from "@shared/schema";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Clock, 
  Film, 
  LogOut, 
  Settings, 
  User as UserIcon,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTime, formatRemainingTime } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderImage } from "@/lib/utils";

// Define the extended watch history item type that includes content details
type WatchHistoryWithContent = WatchHistory & {
  content?: Movie;
};

const ProfilePage = () => {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch watch history
  const { 
    data: watchHistory,
    isLoading: isLoadingHistory
  } = useQuery<WatchHistoryWithContent[]>({
    queryKey: ["/api/user/history"],
    enabled: !!user,
  });

  // Sort watch history by last watched date (most recent first)
  const sortedWatchHistory = watchHistory
    ? [...watchHistory].sort((a, b) => {
        return new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime();
      })
    : [];
  
  // Group watch history by date (Today, Yesterday, This Week, This Month, Older)
  const groupedWatchHistory = sortedWatchHistory.reduce<Record<string, WatchHistoryWithContent[]>>(
    (groups, item) => {
      const lastWatched = new Date(item.lastWatched);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let group = "Older";
      
      if (lastWatched.toDateString() === today.toDateString()) {
        group = "Today";
      } else if (lastWatched.toDateString() === yesterday.toDateString()) {
        group = "Yesterday";
      } else if (today.getTime() - lastWatched.getTime() < 7 * 24 * 60 * 60 * 1000) {
        group = "This Week";
      } else if (today.getMonth() === lastWatched.getMonth() && today.getFullYear() === lastWatched.getFullYear()) {
        group = "This Month";
      }
      
      if (!groups[group]) {
        groups[group] = [];
      }
      
      groups[group].push(item);
      return groups;
    },
    {}
  );

  // Calculate total watch time
  const totalWatchTime = sortedWatchHistory.reduce((total, item) => {
    return total + (item.watchedTime || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-2xl font-semibold mb-4">Please log in to view your profile</h1>
            <Link href="/auth">
              <Button>Log In</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-6 text-primary">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
                  <p className="text-muted-foreground">
                    Member since {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-current mr-2" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Logout
                </Button>
              </div>
            </div>

            {/* Profile Content */}
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-grid md:grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="watch-history">Watch History</TabsTrigger>
                <TabsTrigger value="watchlist">My List</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats Card */}
                  <div className="col-span-2 bg-card rounded-lg border shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                        <Clock className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xl font-bold">{formatTime(totalWatchTime)}</span>
                        <span className="text-sm text-muted-foreground">Total Watch Time</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                        <Film className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xl font-bold">{sortedWatchHistory.length}</span>
                        <span className="text-sm text-muted-foreground">Titles Watched</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                        <UserIcon className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xl font-bold">{user.watchlist?.length || 0}</span>
                        <span className="text-sm text-muted-foreground">Watchlist Items</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Continue Watching Card */}
                  <div className="col-span-1 bg-card rounded-lg border shadow-sm p-6 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">Continue Watching</h2>
                    
                    {isLoadingHistory ? (
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-md" />
                        <Skeleton className="h-24 w-full rounded-md" />
                      </div>
                    ) : sortedWatchHistory && sortedWatchHistory.length > 0 ? (
                      <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="space-y-3">
                          {sortedWatchHistory.slice(0, 3).map((item) => (
                            <Link key={item.id} href={`/watch/${item.contentId}`}>
                              <div className="flex gap-3 p-2 hover:bg-accent rounded-md cursor-pointer">
                                <div className="relative w-24 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                  <img 
                                    src={item.content?.posterPath || getPlaceholderImage('poster')} 
                                    alt={item.content?.title || "Content thumbnail"} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Play className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                  <h3 className="font-medium truncate">{item.content?.title || "Unknown Title"}</h3>
                                  <div className="flex justify-between items-center mt-1">
                                    <div className="w-full max-w-32">
                                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary" 
                                          style={{ width: `${item.percentComplete}%` }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {formatRemainingTime((item.totalTime || 0) - (item.watchedTime || 0))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        
                        {sortedWatchHistory.length > 3 && (
                          <div className="mt-4 text-center">
                            <Button 
                              variant="link" 
                              onClick={() => setActiveTab("watch-history")}
                              className="text-primary"
                            >
                              See all
                            </Button>
                          </div>
                        )}
                      </ScrollArea>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Film className="h-10 w-10 mb-2 opacity-20" />
                        <p>Your watch history will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Watch History Tab */}
              <TabsContent value="watch-history" className="space-y-4">
                <div className="bg-card rounded-lg border shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Watch History</h2>
                  
                  {isLoadingHistory ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-md" />
                      ))}
                    </div>
                  ) : sortedWatchHistory && sortedWatchHistory.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupedWatchHistory).map(([group, items]) => (
                        <div key={group}>
                          <h3 className="text-lg font-medium mb-3">{group}</h3>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <Link key={item.id} href={`/watch/${item.contentId}`}>
                                <div className="flex gap-4 p-3 hover:bg-accent rounded-md cursor-pointer">
                                  <div className="relative w-32 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                    <img 
                                      src={item.content?.posterPath || getPlaceholderImage('poster')} 
                                      alt={item.content?.title || "Content thumbnail"} 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <Play className="h-8 w-8 text-white" />
                                    </div>
                                  </div>
                                  <div className="flex flex-col justify-center flex-1">
                                    <div className="flex items-center">
                                      <h3 className="font-medium">{item.content?.title || "Unknown Title"}</h3>
                                      {item.content?.type && (
                                        <Badge variant="outline" className="ml-2">
                                          {item.content.type}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                      <span>{item.content?.releaseYear || "Unknown year"}</span>
                                      {item.episode && (
                                        <>
                                          <span className="mx-2">•</span>
                                          <span>S{item.season || 1} E{item.episode}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="w-full max-w-60">
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-primary" 
                                            style={{ width: `${item.percentComplete}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center ml-4">
                                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {formatTime(item.watchedTime || 0)} / {formatTime(item.totalTime || 0)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                      <Film className="h-16 w-16 mb-4 opacity-20" />
                      <h3 className="text-lg font-medium">No watch history yet</h3>
                      <p className="mt-1 max-w-md">Start watching movies and TV shows to build your history</p>
                      <Link href="/">
                        <Button className="mt-4">Browse Content</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Watchlist Tab */}
              <TabsContent value="watchlist">
                <div className="bg-card rounded-lg border shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">My List</h2>
                  
                  <div className="text-center py-12">
                    <Film className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Your watchlist content</h3>
                    <p className="mt-1 text-muted-foreground">
                      This tab will show the movies and shows you've saved to your list
                    </p>
                    <Link href="/my-list">
                      <Button className="mt-4">Go to My List</Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;