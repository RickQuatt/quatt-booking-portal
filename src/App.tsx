import { useState, useEffect } from "react";
import { Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loader } from "@/components/shared/Loader";
import { Toaster } from "@/components/ui/Sonner";
import { PartnersPage } from "./pages/partners/page";
import { PartnerDetailPage } from "./pages/partners/[id]/page";
import { CallsPage } from "./pages/calls/page";
import { DashboardPage } from "./pages/dashboard/page";
import { ScorecardPage } from "./pages/scorecard/page";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verify auth via /api/me -- the session cookie is HttpOnly so JS can't read it directly.
    // In production, Cloudflare middleware blocks unauthenticated users before they reach this app.
    // This check handles dev mode and confirms the session is valid.
    fetch("/api/me")
      .then((r) => {
        if (r.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Not Authenticated</h1>
          <p className="text-muted-foreground">
            Run with{" "}
            <code className="bg-muted px-2 py-1 rounded">
              npm run dev:with-auth
            </code>{" "}
            to enable authentication, or deploy to Cloudflare Pages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto md:ml-0 mt-14 md:mt-0 p-4 md:p-6">
          <Route path="/">
            <Redirect to="/partners" />
          </Route>
          <Route path="/partners" component={PartnersPage} />
          <Route path="/partners/:id" component={PartnerDetailPage} />
          <Route path="/calls" component={CallsPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/scorecard" component={ScorecardPage} />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
