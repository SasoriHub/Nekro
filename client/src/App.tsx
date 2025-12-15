import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ContentDetail from "@/pages/ContentDetail";
import Watch from "@/pages/Watch";
import Profile from "@/pages/Profile";
import Top from "@/pages/Top";
import Ongoing from "@/pages/Ongoing";
import Search from "@/pages/Search";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      
      <Route path="/anime" component={() => <Catalog type="anime" />} />
      <Route path="/manga" component={() => <Catalog type="manga" />} />
      <Route path="/manhwa" component={() => <Catalog type="manhwa" />} />
      
      <Route path="/anime/:id" component={ContentDetail} />
      <Route path="/manga/:id" component={ContentDetail} />
      <Route path="/manhwa/:id" component={ContentDetail} />
      
      <Route path="/anime/:id/watch/:episodeId" component={Watch} />
      
      <Route path="/profile" component={Profile} />
      <Route path="/top" component={Top} />
      <Route path="/ongoing" component={Ongoing} />
      <Route path="/search" component={Search} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
