import React, { useState, useCallback, createContext } from 'react';
import { LandingPage } from './src/pages/LandingPage';
import { CreativeSuite } from './src/pages/CreativeSuite';
import AdminPanel from './src/pages/AdminPanel';

const AppContext = createContext();

const App = () => {
    const [currentPage, setCurrentPage] = useState('/');

    const navigate = useCallback((path) => {
        setCurrentPage(path);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case '/': return <LandingPage onNavigate={navigate} />;
            case 'dashboard': return <CreativeSuite onNavigate={navigate} />;
            case 'admin': return <AdminPanel onNavigate={navigate} />;
            default: return <LandingPage onNavigate={navigate} />;
        }
    };

    return (
        <AppContext.Provider value={{ navigate }}>
            <div className="bg-white font-sans antialiased text-neutral-900">
                {renderPage()}
            </div>
        </AppContext.Provider>
    );
};

export default App;
