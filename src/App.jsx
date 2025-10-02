import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import "./assets/Styles/Style.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import BasicInputs from "./Pages/BasicInputs";
import FormValidation from "./Pages/FormValidation";
import DataTable from "./Pages/Datatable";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import UserAccount from "./Pages/UserAccount";
import Login from "./Pages/Login";
import CertificateList from "./Pages/CertificateList.jsx";
import { userManager } from "./api";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = userManager.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = userManager.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Layout Component for authenticated pages
const AuthenticatedLayout = ({ children, isSidebarVisible, isMobile, sidebarWidth }) => {
  return (
    <>
      <Header
        setIsSidebarVisible={() => {}}
        isSidebarVisible={isSidebarVisible}
        setCollapsed={() => {}}
        collapsed={false}
        toggleFullScreen={() => {}}
        isFullScreen={false}
      />
      <Sidebar
        setIsSidebarVisible={() => {}}
        isSidebarVisible={isSidebarVisible}
        setCollapsed={() => {}}
        collapsed={false}
        isMobile={isMobile}
        ref={useRef(null)}
      />
      <div
        className="main-content d-flex justify-content-center align-items-start pt-3"
        style={{
          marginTop: "60px",
          marginLeft: isSidebarVisible && !isMobile ? `${sidebarWidth}px` : "0",
          marginBottom: isMobile ? "60px" : "0",
          transition: "margin-left 0.3s ease",
          width: isSidebarVisible && !isMobile ? `calc(100% - ${sidebarWidth}px)` : "100%",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {children}
      </div>
    </>
  );
};

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(userManager.isAuthenticated());
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = userManager.isAuthenticated();
      setIsAuthenticated(authStatus);
      setLoading(false);
    };

    checkAuth();

    // Optional: Set up interval to check auth status periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // This function just toggles the state, doesn't actually request fullscreen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate sidebar width for margin adjustment
  const sidebarWidth = collapsed ? 80 : 250;

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div
        className={`content-wrapper overflow-y-auto vh-100 ${
          isFullScreen ? "fullscreen-content" : "container-fluid"
        } p-0`}
      >
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <Home />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <Home />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/certificate-list" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <CertificateList />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Other protected routes */}
            <Route 
              path="/basicinputs" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <BasicInputs />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/validation" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <FormValidation />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/datatable" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <DataTable />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/useraccount" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout 
                    isSidebarVisible={isSidebarVisible}
                    isMobile={isMobile}
                    sidebarWidth={sidebarWidth}
                  >
                    <UserAccount />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to home if authenticated, else to login */}
            <Route 
              path="*" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;