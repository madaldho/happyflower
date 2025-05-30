
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import CheckoutPage from "./pages/CheckoutPage";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import NotFound from "./pages/NotFound";
import { StagewiseToolbarWrapper } from "./components/StagewiseToolbarWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      
      {import.meta.env.DEV && <StagewiseToolbarWrapper tools={[]} onToolSelect={() => {}} />}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
