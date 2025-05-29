import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

// === Custom hook for signup mutation and state ===
const useSignUp = () => {
    // Get the query client to manage cache
    const queryClient = useQueryClient();

    // Setup mutation for signup API call
    const { mutate, isPending, error } = useMutation({
        mutationFn: signup, // function to call for mutation

        // On success: refresh auth user data
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    });

    // Return mutation state and function
    return { isPending, error, signupMutation: mutate };
};

export default useSignUp;
