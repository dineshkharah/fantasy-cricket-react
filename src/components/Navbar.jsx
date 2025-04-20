import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Don't show on login or signup pages
    if (location.pathname === "/login" || location.pathname === "/signup") {
        return null;
    }

    return (
        <>
            <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md w-full fixed top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link
                        to="/dashboard"
                        className="text-white hover:text-white hover:scale-105 transition-transform duration-200"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/team-selection"
                        className="text-white hover:text-white hover:scale-105 transition-transform duration-200"
                    >
                        Team Selection
                    </Link>
                </div>

                {isLoggedIn && (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md font-semibold"
                    >
                        Logout
                    </button>
                )}
            </nav>

        </>
    );
};

export default Navbar;
