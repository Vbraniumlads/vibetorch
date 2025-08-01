import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TwentyFirstToolbar } from "@21st-extension/toolbar-react";
import { ReactPlugin } from "@21st-extension/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { initGA, pageview } from "./lib/analytics";

const queryClient = new QueryClient();

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TwentyFirstToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      />
      <BrowserRouter>
        <Analytics />
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
