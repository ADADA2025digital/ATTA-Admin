import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/Styles/Style.css";
import Logo from "../assets/Images/fav.svg";
import Profile from "../assets/Images/profile.png";
import HeaderIcon from "../Components/HeaderIcon";
import Dropdown from "../Components/Dropdown";
import Icon from "../Components/SideBarIcon";
import { authAPI, authToken, userManager } from "../api";

const Header = ({
  setIsSidebarVisible,
  setCollapsed,
  toggleFullScreen,
}) => {
  const [isEnvelopeDropdownOpen, setEnvelopeDropdownOpen] = useState(false);
  const [isBellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [isBookmarkDropdownOpen, setBookmarkDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [rotate, setRotate] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleIconRef = useRef(null);
  const bellDropdownRef = useRef(null);
  const bookmarkDropdownRef = useRef(null);
  const envelopeDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    const userData = userManager.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const toggleBellDropdown = () => {
    setBellDropdownOpen(!isBellDropdownOpen);
    setBookmarkDropdownOpen(false);
    setEnvelopeDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  const toggleBookmarkDropdown = () => {
    setBookmarkDropdownOpen(!isBookmarkDropdownOpen);
    setBellDropdownOpen(false);
    setEnvelopeDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  const toggleEnvelopeDropdown = () => {
    setEnvelopeDropdownOpen(!isEnvelopeDropdownOpen);
    setBellDropdownOpen(false);
    setBookmarkDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!isProfileDropdownOpen);
    setBellDropdownOpen(false);
    setBookmarkDropdownOpen(false);
    setEnvelopeDropdownOpen(false);
  };

  const toggleSidebar = () => {
    setRotate(true);
    setIsSidebarVisible((prev) => !prev);

    setTimeout(() => setRotate(false), 500);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(event.target) &&
        bookmarkDropdownRef.current &&
        !bookmarkDropdownRef.current.contains(event.target) &&
        envelopeDropdownRef.current &&
        !envelopeDropdownRef.current.contains(event.target) &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setBellDropdownOpen(false);
        setBookmarkDropdownOpen(false);
        setEnvelopeDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Call API logout
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage and cookies
      authToken.clear();
      userManager.clearUser();
      
      // Redirect to login
      navigate("/login");
      setIsLoading(false);
    }
  };

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
    if (toggleFullScreen) {
      toggleFullScreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenMode = !!document.fullscreenElement;
      setIsFullScreen(fullscreenMode);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      document.body.classList.toggle("dark-mode", newMode);
      localStorage.setItem("darkMode", newMode);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.body.classList.add("dark-mode");
    }
  }, []);

  return (
    <>
      {isLoading && (
        <div className="backdrop">
          <div className="spinner"></div>
        </div>
      )}
      <nav
        className={`navbar-top navbar navbar-expand-lg fixed-top d-flex align-items-center justify-content-between py-2 px-3 ${
          isFullScreen ? "fullscreen-mode" : "container-fluid"
        }`}
      >
        <div className="d-flex align-items-center justify-content-between gap-2">
          {!isMobile && (
            <Icon
              type="bi-grid"
              className={`fs-6 text-white cursor-pointer ${
                rotate ? "icon-rotate" : ""
              }`}
              onClick={() => {
                setCollapsed((prev) => !prev);
                setIsSidebarVisible(true);
                setRotate(true);
                setTimeout(() => setRotate(false), 500);
              }}
              style={{ cursor: "pointer" }}
            />
          )}
          {isMobile && (
            <Icon
              ref={toggleIconRef}
              type="bi-list"
              className={`fs-6 rounded circle text-white cursor-pointer ${
                rotate ? "icon-rotate" : ""
              }`}
              onClick={toggleSidebar}
            />
          )}
          {isMobile && <h4 className="text-white m-0">ADADA Dashboard</h4>}

          {!isMobile && (
            <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
              <img
                src={Logo}
                className="ms-3"
                alt="Brand Logo"
                style={{ height: "50px" }}
              />
              <span className="fw-bold">ADADA Digital</span>
            </Link>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-between gap-3">
          {!isMobile && (
            <HeaderIcon
              type={isFullScreen ? "bi-fullscreen-exit" : "bi-arrows-fullscreen"}
              onClick={handleFullScreenToggle}
            />
          )}

          {!isMobile && (
            <div ref={bellDropdownRef}>
              <HeaderIcon type="bi-bell" onClick={toggleBellDropdown} />
              {isBellDropdownOpen && (
                <Dropdown
                  title="Notifications"
                  style={{ left: isMobile ? "5%" : "77%", top: "100%" }}
                />
              )}
            </div>
          )}

          {!isMobile && (
            <div ref={bookmarkDropdownRef}>
              <HeaderIcon type="bi-bookmark" onClick={toggleBookmarkDropdown} />
              {isBookmarkDropdownOpen && (
                <Dropdown
                  title="Bookmarks"
                  style={{ left: isMobile ? "5%" : "80%", top: "100%" }}
                />
              )}
            </div>
          )}

          {!isMobile && (
            <div ref={envelopeDropdownRef}>
              <HeaderIcon type="bi-envelope" onClick={toggleEnvelopeDropdown} />
              {isEnvelopeDropdownOpen && (
                <Dropdown
                  title="Messages"
                  style={{ left: isMobile ? "5%" : "83%", top: "100%" }}
                />
              )}
            </div>
          )}

          {!isMobile && (
            <HeaderIcon
              type={isDarkMode ? "bi-brightness-high" : "bi-moon-stars"}
              onClick={toggleDarkMode}
            />
          )}

          <div ref={profileDropdownRef}>
            <div className="d-flex align-items-center gap-2">
              {user && (
                <span className="text-white d-none d-md-block">
                  Hello, {user.name}
                </span>
              )}
              <img
                src={Profile}
                alt="User Profile"
                className="rounded-circle"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
                onClick={toggleProfileDropdown}
              />
            </div>
            {isProfileDropdownOpen && (
              <div className="dropdown-menu top-100 position-absolute end-0 py-2 d-block shadow">
                <Link
                  to="/useraccount"
                  className="dropdown-item d-flex align-items-center"
                >
                  <i className="bi bi-person me-3"></i> Account
                </Link>
                <a
                  href="#inbox"
                  className="dropdown-item d-flex align-items-center"
                >
                  <i className="bi bi-envelope me-3"></i> Inbox
                </a>
                <a
                  href="#taskboard"
                  className="dropdown-item d-flex align-items-center"
                >
                  <i className="bi bi-kanban me-3"></i> Taskboard
                </a>
                <a
                  href="#settings"
                  className="dropdown-item d-flex align-items-center"
                >
                  <i className="bi bi-gear me-3"></i> Settings
                </a>
                <button
                  className="dropdown-item d-flex align-items-center border-0 bg-transparent w-100"
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-box-arrow-right me-3"></i> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isMobile && (
        <nav className="navbar fixed-bottom d-flex justify-content-around py-2 px-3">
          <Link to="/">
            <HeaderIcon type="bi-house" />
          </Link>
          <div ref={bellDropdownRef}>
            <HeaderIcon type="bi-bell" onClick={toggleBellDropdown} />
            {isBellDropdownOpen && (
              <Dropdown
                title="Notifications"
                style={{ left: isMobile ? "8%" : "77%", bottom: "100%" }}
              />
            )}
          </div>

          <div ref={bookmarkDropdownRef}>
            <HeaderIcon type="bi-bookmark" onClick={toggleBookmarkDropdown} />
            {isBookmarkDropdownOpen && (
              <Dropdown
                title="Bookmarks"
                style={{ left: isMobile ? "8%" : "80%", bottom: "100%" }}
              />
            )}
          </div>

          <div ref={envelopeDropdownRef}>
            <HeaderIcon type="bi-envelope" onClick={toggleEnvelopeDropdown} />
            {isEnvelopeDropdownOpen && (
              <Dropdown
                title="Messages"
                style={{ left: "8%", bottom: "100%" }}
              />
            )}
          </div>

          <HeaderIcon
            type={isDarkMode ? "bi-brightness-high" : "bi-moon-stars"}
            onClick={toggleDarkMode}
          />
        </nav>
      )}
    </>
  );
};

export default Header;