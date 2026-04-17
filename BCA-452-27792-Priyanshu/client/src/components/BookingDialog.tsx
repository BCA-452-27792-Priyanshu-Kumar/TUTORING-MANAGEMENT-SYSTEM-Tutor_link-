import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateBooking } from "@/hooks/use-bookings";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";

// Frontend specific schema extension for the form
const bookingFormSchema = insertBookingSchema.extend({
  dateString: z.string().min(1, "Date is required"),
}).omit({ date: true, tutorId: true });

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingDialogProps {
  tutorId: number;
  tutorName: string;
}

export function BookingDialog({ tutorId, tutorName }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      notes: "",
      dateString: "",
    },
  });

  // Compute minimum datetime string (now, rounded up to nearest minute)
  const minDateTime = (() => {
    const now = new Date();
    now.setSeconds(0, 0);
    // Format as YYYY-MM-DDThh:mm (local time, required by datetime-local input)
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  })();

  function onSubmit(values: BookingFormValues) {
    const selectedDate = new Date(values.dateString);
    if (selectedDate <= new Date()) {
      form.setError("dateString", { message: "Please select a future date and time" });
      return;
    }
    createBooking(
      {
        tutorId,
        notes: values.notes,
        date: selectedDate,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
          Book Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a Session with {tutorName}</DialogTitle>
          <DialogDescription>
            Choose a date and time for your tutoring session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dateString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        className="pl-10"
                        min={minDateTime}
                        data-testid="input-booking-datetime"
                      />
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What topics would you like to cover?"
                      className="resize-none h-24"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
