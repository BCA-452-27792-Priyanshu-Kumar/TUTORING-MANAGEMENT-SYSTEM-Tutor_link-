import { useUsers, useDeleteUser } from "@/hooks/use-admin";
import { useBookings } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Users, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: bookings, isLoading: bookingsLoading } = useBookings(); // Assuming admin can see all bookings via this endpoint for simplicity or updated endpoint
  const { mutate: deleteUser } = useDeleteUser();

  const stats = [
    { label: "Total Users", value: users?.length || 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Bookings", value: bookings?.length || 0, icon: Calendar, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Admin Portal</h1>
        <p className="text-slate-500">System overview and user management.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center p-6">
              <div className={`p-4 rounded-xl ${stat.color} text-white mr-4 shadow-lg shadow-black/5`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-xl mb-6">
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'tutor' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}</TableCell>
                        <TableCell className="text-right">
                          {user.role !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account and remove their data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => deleteUser(user.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>System Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{format(new Date(booking.date), "MMM d, yyyy HH:mm")}</TableCell>
                        <TableCell>{booking.student?.name}</TableCell>
                        <TableCell>{booking.tutor?.user.name}</TableCell>
                        <TableCell>
                          <span className="capitalize text-sm font-medium">{booking.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
