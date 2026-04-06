import React, { createContext, useContext, useState } from "react";
import OrganizationProfileModal from "../../pages/components/OrganizationProfileModal";

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [userRole, setUserRole] = useState("candidate");
    const [currentPage, setCurrentPage] = useState("login");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [orgModal, setOrgModal] = useState(null); // { companyName, opportunityId? }

    const toggleDarkMode = () => setDarkMode((d) => !d);
    const openOrgModal = (companyName, opportunityId = null) => setOrgModal({ companyName, opportunityId });
    const closeOrgModal = () => setOrgModal(null);

    return (
        <AppContext.Provider
            value={{
                userRole, setUserRole,
                currentPage, setCurrentPage,
                isLoggedIn, setIsLoggedIn,
                sidebarCollapsed, setSidebarCollapsed,
                darkMode, toggleDarkMode,
                openOrgModal,
            }}
        >
            {children}
            {orgModal && (
                <OrganizationProfileModal
                    companyName={orgModal.companyName}
                    opportunityId={orgModal.opportunityId}
                    onClose={closeOrgModal}
                />
            )}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used inside AppProvider");
    return context;
}