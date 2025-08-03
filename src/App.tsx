import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { LoginForm } from "@/components/auth/login-form";
import Dashboard from "./pages/Dashboard";
import Fields from "./pages/Fields";
import Weather from "./pages/Weather";
import Sensors from "./pages/Sensors";
import Equipment from "./pages/Equipment";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/Admin";
import AfricaFeatures from "./pages/AfricaFeatures";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Notifications from "./pages/Notifications";
import Marketplace from "./pages/Marketplace";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import "./styles/glass.css";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="agri-nexus-theme">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fields" element={<Fields />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/africa" element={<AfricaFeatures />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/support" element={<Support />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
