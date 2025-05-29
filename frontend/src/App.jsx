import React from "react";
// Import routing components from react-router-dom (should not be "react-router")
import { Route, Routes, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";

// === Page Components ===
import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnBoardingPage from "./pages/OnBoardingPage.jsx";

// === Utility Components and Hooks ===
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

function App() {
    // === Fetch authentication state and user info ===
    const { isLoading, authUser } = useAuthUser();

    const { theme } = useThemeStore();

    // === Determine authentication and onboarding status ===
    const isAuthenticated = Boolean(authUser);
    const isOnboarded = authUser?.isOnboarded;

    // === Show loading spinner while fetching user data ===
    if (isLoading) return <PageLoader />;

    return (
        <div className="h-screen" data-theme={theme}>
            <Routes>
                {/* === Home Route: Only for authenticated and onboarded users === */}
                <Route
                    path="/"
                    element={
                        isAuthenticated && isOnboarded ? (
                            <Layout showSidebar={true}>
                                <HomePage />
                            </Layout>
                        ) : (
                            <Navigate
                                to={isAuthenticated ? "/onboarding" : "/login"}
                            />
                        )
                    }
                />
                {/* === Signup Route: Only for unauthenticated users === */}
                <Route
                    path="/signup"
                    element={
                        !isAuthenticated ? (
                            <SignupPage />
                        ) : (
                            <Navigate to={isOnboarded ? "/" : "/onboarding"} />
                        )
                    }
                />
                {/* === Login Route: Only for unauthenticated users === */}
                <Route
                    path="/login"
                    element={
                        !isAuthenticated ? (
                            <LoginPage />
                        ) : (
                            <Navigate to={isOnboarded ? "/" : "/onboarding"} />
                        )
                    }
                />
                {/* === Notifications Route: Authenticated users only === */}
                <Route
                    path="/notifications"
                    element={
                        isAuthenticated && isOnboarded ? (
                            <Layout showSidebar={true}>
                                <NotificationsPage />
                            </Layout>
                        ) : (
                            <Navigate
                                to={!isAuthenticated ? "/login" : "/onboarding"}
                            />
                        )
                    }
                />
                {/* === Chat Route: Authenticated users only === */}
                <Route
                    path="/chat/:id"
                    element={
                        isAuthenticated && isOnboarded ? (
                            <Layout showSidebar={false}>
                                <ChatPage />
                            </Layout>
                        ) : (
                            <Navigate
                                to={!isAuthenticated ? "/login" : "/onboarding"}
                            />
                        )
                    }
                />
                {/* === Call Route: Authenticated users only === */}
                <Route
                    path="/call/:id"
                    element={
                        isAuthenticated && isOnboarded ? (
                            <CallPage />
                        ) : (
                            <Navigate
                                to={!isAuthenticated ? "/login" : "/onboarding"}
                            />
                        )
                    }
                />
                {/* === Onboarding Route: Authenticated but not yet onboarded users === */}
                <Route
                    path="/onboarding"
                    element={
                        isAuthenticated ? (
                            isOnboarded ? (
                                <Navigate to="/" />
                            ) : (
                                <OnBoardingPage />
                            )
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
            {/* === Toast notifications === */}
            <Toaster />
        </div>
    );
}

export default App;
