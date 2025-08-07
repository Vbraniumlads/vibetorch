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
import OAuthCallback from "./pages/OAuthCallback";
import RepositoryDetail from "./pages/RepositoryDetail";
import { TokenExpiryNotification } from "./components/TokenExpiryNotification";
import { initGA, pageview } from "./lib/analytics";
import { useDarkMode } from "./hooks/use-dark-mode";
import { AuthProvider } from "./contexts/AuthContext";

// 개발 환경에서만 auth 테스트 유틸리티 로드
if (import.meta.env.DEV) {
  import("./utils/auth-test");
}

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

const AppContent = () => {
  // 다크모드 초기화
  useDarkMode();
  
  return (
    <>
      <Toaster />
      <Sonner />
      <TwentyFirstToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      />
      <BrowserRouter>
        <Analytics />
        <TokenExpiryNotification />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Index />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/repository/:owner/:repo" element={<RepositoryDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
