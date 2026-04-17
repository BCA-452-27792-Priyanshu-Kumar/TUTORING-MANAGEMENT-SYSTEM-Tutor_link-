import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import StudentDashboard from "@/pages/StudentDashboard";
import TutorDashboard from "@/pages/TutorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function PrivateRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Redirect to="/admin" />;
    else if (user.role === 'tutor') return <Redirect to="/tutor" />;
    else return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/login" component={AuthPage} />
        <Route path="/register" component={AuthPage} />
        
        {/* Public Tutor List (Optional feature to browse before login) */}
        <Route path="/tutors" component={AuthPage} /> {/* Redirect to login for now */}

        {/* Protected Routes */}
        
        {/* Student Routes */}
        <Route path="/dashboard">
          <PrivateRoute component={StudentDashboard} allowedRoles={['student']} />
        </Route>
        <Route path="/dashboard/tutors">
          <PrivateRoute component={StudentDashboard} allowedRoles={['student']} />
        </Route>
        <Route path="/dashboard/bookings">
          <PrivateRoute component={StudentDashboard} allowedRoles={['student']} />
        </Route>

        {/* Tutor Routes */}
        <Route path="/tutor">
          <PrivateRoute component={TutorDashboard} allowedRoles={['tutor']} />
        </Route>
        <Route path="/tutor/profile">
          <PrivateRoute component={TutorDashboard} allowedRoles={['tutor']} />
        </Route>
        <Route path="/tutor/requests">
          <PrivateRoute component={TutorDashboard} allowedRoles={['tutor']} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <PrivateRoute component={AdminDashboard} allowedRoles={['admin']} />
        </Route>
        <Route path="/admin/users">
          <PrivateRoute component={AdminDashboard} allowedRoles={['admin']} />
        </Route>
        <Route path="/admin/bookings">
          <PrivateRoute component={AdminDashboard} allowedRoles={['admin']} />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
