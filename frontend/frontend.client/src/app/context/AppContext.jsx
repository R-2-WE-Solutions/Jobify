import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [userRole, setUserRole] = useState("candidate");
    const [currentPage, setCurrentPage] = useState("login");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => setDarkMode((d) => !d);

    return (
        <AppContext.Provider
            value={{
                userRole,
                setUserRole,
                currentPage,
                setCurrentPage,
                isLoggedIn,
                setIsLoggedIn,
                sidebarCollapsed,
                setSidebarCollapsed,
                darkMode,
                toggleDarkMode,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used inside AppProvider");
    }
    return context;
}
