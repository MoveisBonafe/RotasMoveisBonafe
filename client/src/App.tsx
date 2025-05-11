import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MockDataDebug from "@/components/MockDataDebug";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toast } = useToast();

  // Initialize the app with seed data in development mode
  useEffect(() => {
    const seedData = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          await apiRequest("POST", "/api/seed-data");
          console.log("Seed data loaded successfully");
        } catch (error) {
          console.error("Failed to load seed data:", error);
          toast({
            title: "Falha ao carregar dados iniciais",
            description: "Alguns recursos podem não estar disponíveis.",
            variant: "destructive",
          });
        }
      }
    };

    seedData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <MockDataDebug />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
