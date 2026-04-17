import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Calendar, 
  Users,
  GraduationCap
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isPublicPage = ["/", "/login", "/register"].includes(location);

  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col font-body bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-lg text-white group-hover:bg-primary/90 transition-colors">
                <BookOpen size={24} />
              </div>
              <span className="font-display font-bold text-xl text-slate-900 tracking-tight">TutorLink</span>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-semibold text-slate-600 hover:text-primary hover:bg-slate-100">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Sidebar navigation items based on role
  const navItems = [
    { 
      label: "Dashboard", 
      href: user?.role === "admin" ? "/admin" : user?.role === "tutor" ? "/tutor" : "/dashboard",
      icon: LayoutDashboard 
    },
    ...(user?.role === "student" ? [
      { label: "Find Tutors", href: "/dashboard/tutors", icon: GraduationCap },
      { label: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    ] : []),
    ...(user?.role === "tutor" ? [
      { label: "My Profile", href: "/tutor/profile", icon: User },
      { label: "Requests", href: "/tutor/requests", icon: Calendar },
    ] : []),
    ...(user?.role === "admin" ? [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "All Bookings", href: "/admin/bookings", icon: Calendar },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <Link 
            href={user?.role === "admin" ? "/admin" : user?.role === "tutor" ? "/tutor" : "/dashboard"} 
            className="flex items-center gap-2 mb-8"
          >
            <div className="p-1.5 bg-primary rounded-md text-white">
              <BookOpen size={20} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">TutorLink</span>
          </Link>
          
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                    ${isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/25 font-medium" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            onClick={() => logout()}
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 md:hidden">
          <Link href={user?.role === "admin" ? "/admin" : user?.role === "tutor" ? "/tutor" : "/dashboard"} className="flex items-center gap-2 mr-auto">
            <div className="p-1.5 bg-primary rounded-md text-white">
              <BookOpen size={20} />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">TutorLink</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut size={20} />
          </Button>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
