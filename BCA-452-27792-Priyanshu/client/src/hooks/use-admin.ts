import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  return useQuery({
    queryKey: [api.admin.users.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.responses[200].parse(await res.json());
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.deleteUser.path, { id });
      const res = await fetch(url, { method: api.admin.deleteUser.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      toast({ title: "User Deleted", description: "The user has been removed from the system." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}
