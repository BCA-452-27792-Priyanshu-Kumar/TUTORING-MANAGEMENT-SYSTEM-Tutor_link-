import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTutor } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTutors(subject?: string) {
  return useQuery({
    queryKey: [api.tutors.list.path, subject],
    queryFn: async () => {
      const url = subject 
        ? `${api.tutors.list.path}?subject=${encodeURIComponent(subject)}`
        : api.tutors.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tutors");
      return api.tutors.list.responses[200].parse(await res.json());
    },
  });
}

export function useTutor(id: number) {
  return useQuery({
    queryKey: [api.tutors.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tutors.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tutor");
      return api.tutors.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useUpdateTutorProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTutor) => {
      const res = await fetch(api.tutors.update.path, {
        method: api.tutors.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.tutors.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tutors.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Since me might return nested tutor info
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}
