import { useAuth } from "@/hooks/use-auth";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useUpdateTutorProfile } from "@/hooks/use-tutors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTutorSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { Check, X, Clock, Briefcase, BookOpen } from "lucide-react";

export default function TutorDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Tutor Dashboard</h1>
        <p className="text-slate-500">Manage your profile and session requests.</p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-xl mb-8">
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Requests & Schedule</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Edit Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <BookingRequests />
        </TabsContent>
        
        <TabsContent value="profile">
          <ProfileEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingRequests() {
  const { data: bookings, isLoading } = useBookings();
  const { mutate: updateStatus } = useUpdateBookingStatus();

  if (isLoading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;

  const pending = bookings?.filter(b => b.status === "pending") || [];
  const upcoming = bookings?.filter(b => b.status === "accepted") || [];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Pending Requests */}
      <Card className="border-slate-200 shadow-sm h-fit">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100 rounded-t-xl">
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No pending requests.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{booking.student?.name}</h4>
                      <p className="text-sm text-slate-500">
                        {format(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700 mb-4 italic">
                      "{booking.notes}"
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus({ id: booking.id, status: "accepted" })}
                    >
                      <Check className="w-4 h-4 mr-2" /> Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => updateStatus({ id: booking.id, status: "rejected" })}
                    >
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      <Card className="border-slate-200 shadow-sm h-fit">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No upcoming sessions.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map((booking) => (
                <div key={booking.id} className="p-6 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-900">{booking.student?.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(booking.date), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-slate-400 hover:text-green-600 hover:bg-green-50"
                    onClick={() => updateStatus({ id: booking.id, status: "completed" })}
                  >
                    Mark Complete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileEditor() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateTutorProfile();
  
  const profileFormSchema = insertTutorSchema.omit({ subjects: true }).extend({
    bio: z.string().min(1, "Bio is required"),
    experience: z.coerce.number().int().min(0, "Must be 0 or more"),
    hourlyRate: z.coerce.number().int().min(1, "Must be at least ₹1"),
  });

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: user?.tutorProfile?.bio || "",
      experience: user?.tutorProfile?.experience || 0,
      hourlyRate: user?.tutorProfile?.hourlyRate || 500,
    },
  });

  const [subjectInput, setSubjectInput] = useState(
    user?.tutorProfile?.subjects?.join(", ") || ""
  );

  useEffect(() => {
    if (user?.tutorProfile) {
      form.reset({
        bio: user.tutorProfile.bio || "",
        experience: user.tutorProfile.experience || 0,
        hourlyRate: user.tutorProfile.hourlyRate || 500,
      });
      setSubjectInput(user.tutorProfile.subjects?.join(", ") || "");
    }
  }, [user?.tutorProfile]);

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    const subjectsArray = subjectInput.split(",").map(s => s.trim()).filter(Boolean);
    if (subjectsArray.length === 0) {
      return;
    }
    updateProfile({ ...values, subjects: subjectsArray });
  }

  return (
    <Card className="max-w-2xl mx-auto border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
        <CardDescription>Keep your profile updated to attract more students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell students about your teaching style and background..." 
                      className="resize-none h-32"
                      data-testid="input-bio"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="pl-9"
                          data-testid="input-experience"
                          {...field} 
                          onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground font-medium text-sm">₹</span>
                        <Input 
                          type="number" 
                          className="pl-7"
                          data-testid="input-hourly-rate"
                          {...field} 
                          onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Subjects (Comma separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Math, Physics, Chemistry" 
                  value={subjectInput}
                  data-testid="input-subjects"
                  onChange={(e) => setSubjectInput(e.target.value)}
                />
              </FormControl>
              <p className="text-xs text-slate-500">Example: Algebra, Calculus, Physics</p>
            </FormItem>

            <Button type="submit" className="w-full" data-testid="button-save-profile" disabled={isPending}>
              {isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
