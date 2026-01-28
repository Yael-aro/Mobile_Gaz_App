import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BottleProvider } from "@/contexts/BottleContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BottlesPage from "@/pages/BottlesPage";
import ClientsPage from "@/pages/ClientsPage";
import MovementsPage from "@/pages/MovementsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import UsersPage from "@/pages/UsersPage";
import NotFoundPage from '@/pages/NotFoundPage';  
import CantinieursPage from '@/pages/CantinieursPage';
import CantinierDetailPage from '@/pages/CantinierDetailPage';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <BottleProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Admin & Cantinier Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cantinier']} />}>
                      <Route path="/bottles" element={<BottlesPage />} />
                      <Route path="/clients" element={<ClientsPage />} />
                      <Route path="/movements" element={<MovementsPage />} />
                    </Route>
                    
                    {/* Admin Only Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/cantiniers/:id" element={<CantinierDetailPage />} />  
                    </Route>
                  </Route>
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/users" element={<UsersPage />} />  {/* NOUVELLE ROUTE */}
                </Route>
                {/* Routes Admin Only */}
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/cantiniers" element={<CantinieursPage />} />
  <Route path="/reports" element={<ReportsPage />} />
  <Route path="/settings" element={<SettingsPage />} />
</Route>


                
                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </BottleProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
