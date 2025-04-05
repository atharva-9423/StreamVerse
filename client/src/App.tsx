import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Anime from "@/pages/Anime";
import DetailPage from "@/pages/DetailPage";
import WatchPage from "@/pages/WatchPage";
import MyList from "@/pages/MyList";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import EpisodesPage from "@/pages/EpisodesPage";

function Router() {
  const [location] = useLocation();
  
  // Select appropriate transition variant based on route
  const getTransitionVariant = (path: string): "fade" | "slide" | "scale" | "slideUp" | "zoomFade" => {
    if (path.includes('/watch/')) return 'fade';
    if (path.includes('/auth')) return 'zoomFade';
    if (path.includes('/search')) return 'slideUp';
    if (path.includes('/content/')) return 'slide';
    if (path.includes('/anime')) return 'slideUp';
    if (path.includes('/trending')) return 'slideUp';
    if (path.includes('/my-list')) return 'slideUp';
    if (path.includes('/profile')) return 'slide';
    return 'zoomFade'; // default
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition 
        key={location} 
        variant={getTransitionVariant(location)}
        className="w-full"
      >
        <Switch location={location}>
          <Route path="/">
            {() => <Home />}
          </Route>
          <Route path="/movies">
            {() => <Redirect to="/anime" />}
          </Route>
          <Route path="/anime">
            {() => <Anime />}
          </Route>
          <Route path="/trending">
            {() => <Anime />}
          </Route>
          <Route path="/search">
            {() => <SearchPage />}
          </Route>
          <Route path="/watch/:id">
            {() => <WatchPage />}
          </Route>
          <Route path="/content/:id">
            {() => <DetailPage />}
          </Route>
          <Route path="/anime/:animeId/episodes">
            {() => <EpisodesPage />}
          </Route>
          <Route path="/watch/:animeId/:episodeId">
            {() => <WatchPage />}
          </Route>
          <ProtectedRoute path="/my-list" component={MyList} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <Route path="/auth">
            {() => <AuthPage />}
          </Route>
          <Route>
            {() => <NotFound />}
          </Route>
        </Switch>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
