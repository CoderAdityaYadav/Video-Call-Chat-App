import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api.js"; // Corrected import path

// === Custom hook for logout mutation and state ===
const useLogout = () => {
    // Get the query client to manage cache
    const queryClient = useQueryClient();

    // Setup mutation for logout API call
    const { mutate, isPending, error } = useMutation({
        mutationFn: logout, // function to call for mutation
        // On success: refresh auth user data
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    });

    // Return mutation state and function
    return { isPending, logoutMutation: mutate, error };
};

export default useLogout;