import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import toast from "react-hot-toast";

// === Custom hook for onboarding mutation and state ===
const useOnboarding = () => {
    // Get the query client to manage cache
    const queryClient = useQueryClient();

    // Setup mutation for onboarding API call
    const { mutate, isPending, error } = useMutation({
        mutationFn: completeOnboarding, // function to call for mutation

        // On success: show toast and refresh auth user data
        onSuccess: () => {
            toast.success("Profile onboarded successfully");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },

        // On error: show error toast
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Onboarding failed.");
        },
    });

    // Return mutation state and function
    return { isPending, error, onboardingMutation: mutate };
};

export default useOnboarding;