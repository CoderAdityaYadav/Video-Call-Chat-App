import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import React from "react";

const Layout = ({children, showSidebar }) => {
    return (
        <div className="min-h-screen">
            <div className="flex">
                {showSidebar && <Sidebar />}
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 flex flex-col"> 
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
