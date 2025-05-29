import React from "react";
import { getAuthUser } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

// === Custom hook to fetch and provide the authenticated user's data ===
const useAuthUser = () => {
    // Fetch the authenticated user using react-query
    const authUser = useQuery({
        queryKey: ["authUser"], // unique key for caching
        queryFn: getAuthUser, // function to fetch user data
    });

    // Return loading state and user data (if available)
    return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};

export default useAuthUser;