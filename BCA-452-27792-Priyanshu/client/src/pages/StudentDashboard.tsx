import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { useTutors } from "@/hooks/use-tutors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Calendar, Clock, BookOpen } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { BookingDialog } from "@/components/BookingDialog";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-slate-500">Find a tutor or check your upcoming sessions.</p>
        </div>
        <div className="flex gap-2">
           {/* Actions if needed */}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TutorFinder />
        </div>
        <div className="lg:col-span-1">
          <MyBookings />
        </div>
      </div>
    </div>
  );
}

function TutorFinder() {
  const [search, setSearch] = useState("");
  const { data: tutors, isLoading } = useTutors(search);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Search className="text-slate-400 w-5 h-5" />
        <Input 
          className="border-none shadow-none focus-visible:ring-0 text-base"
          placeholder="Search by subject (e.g. Math, Physics)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))
        ) : tutors?.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            No tutors found for "{search}"
          </div>
        ) : (
          tutors?.map((tutor) => (
            <motion.div 
              key={tutor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{tutor.user.name}</h3>
                    <p className="text-sm text-slate-500">{tutor.experience} years experience</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold">
                    ₹{tutor.hourlyRate}/hr
                  </Badge>
                </div>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{tutor.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {tutor.subjects.map((sub, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <BookingDialog tutorId={tutor.id} tutorName={tutor.user.name} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function MyBookings() {
  const { data: bookings, isLoading } = useBookings();

  if (isLoading) return <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />;

  const sortedBookings = bookings?.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-xl">My Sessions</CardTitle>
        <CardDescription>Track your learning schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedBookings?.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>No bookings yet</p>
          </div>
        ) : (
          sortedBookings?.map((booking) => (
            <div key={booking.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between group hover:bg-white hover:border-blue-100 hover:shadow-md transition-all">
              <div>
                <div className="font-semibold text-slate-900 mb-1">
                  {booking.tutor?.user.name}
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-2 mb-2">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(booking.date), "MMM d, yyyy")}
                  <Clock className="w-3 h-3 ml-1" />
                  {format(new Date(booking.date), "h:mm a")}
                </div>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
  };
  
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}
