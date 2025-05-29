import React from "react";
// Use react-router-dom for routing in web apps
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";

const Sidebar = () => {
    // === Get authenticated user info ===
    const { authUser } = useAuthUser();

    // === Get current route path for active link highlighting ===
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        // === Sidebar container, only visible on large screens (lg and up) ===
        <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
            {/* === Logo Section === */}
            <div className="p-5 border-b border-base-300">
                <Link to="/" className="flex items-center gap-2.5">
                    <ShipWheelIcon className="size-9 text-primary" />
                    <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                        Streamify
                    </span>
                </Link>
            </div>

            {/* === Navigation Links === */}
            <nav className="flex-1 p-4 space-y-1">
                {/* Home Link */}
                <Link
                    to="/"
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                        currentPath === "/" ? "btn-active" : ""
                    }`}>
                    <HomeIcon className="size-5 text-base-content opacity-70" />
                    <span>Home</span>
                </Link>

                {/* Friends Link */}
                <Link
                    to="/friends"
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                        currentPath === "/friends" ? "btn-active" : ""
                    }`}>
                    <UsersIcon className="size-5 text-base-content opacity-70" />
                    <span>Friends</span>
                </Link>

                {/* Notifications Link */}
                <Link
                    to="/notifications"
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                        currentPath === "/notifications" ? "btn-active" : ""
                    }`}>
                    <BellIcon className="size-5 text-base-content opacity-70" />
                    <span>Notifications</span>
                </Link>
            </nav>

            {/* === User Profile Section at the bottom === */}
            <div className="p-4 border-t border-base-300 mt-auto">
                <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img src={authUser?.profilePic} alt="User Avatar" />
                        </div>
                    </div>
                    {/* User Info */}
                    <div className="flex-1">
                        <p className="font-semibold text-sm">
                            {authUser?.fullName}
                        </p>
                        <p className="text-xs text-success flex items-center gap-1">
                            <span className="size-2 rounded-full bg-success inline-block" />
                            Online
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
