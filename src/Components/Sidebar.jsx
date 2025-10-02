import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import "../assets/Styles/Style.css";
import SideBarLink from "./SideBarLink";
import Icon from "./SideBarIcon";

const Sidebar = forwardRef(({
  isSidebarVisible,
  setIsSidebarVisible,
  collapsed,
  isMobile,
}, ref) => {
  const [activeSection, setActiveSection] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);

  // Combine forwarded ref with local ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(sidebarRef.current);
      } else {
        ref.current = sidebarRef.current;
      }
    }
  }, [ref]);

  const handleToggle = (label) => {
    setActiveSection(activeSection === label ? null : label);
  };

  // Close sidebar on outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, setIsSidebarVisible]);

  const handleItemClick = () => {
    if (isMobile) {
      setIsSidebarVisible(false);
    }
  };

  const handleDashboardClick = () => {
    setActiveSection(null);
    if (isMobile) {
      setIsSidebarVisible(false);
    }
  };

  // Determine if sidebar content should be shown
  const shouldShowContent = !collapsed || isHovered;

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar d-flex flex-column text-white position-fixed ${
        collapsed && !isHovered ? "collapsed" : "expanded"
      } ${isSidebarVisible ? "show-sidebar" : "hide-sidebar"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-body flex-grow-1 overflow-y-auto px-3 pt-3">
        <h4
          className={`text-start py-3 ${
            !shouldShowContent ? "d-none" : ""
          }`}
        >
          <span className="badge text-uppercase">General</span>
        </h4>

        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              className="nav-link d-flex align-items-center text-white p-0 py-2"
              to="/home"
              onClick={handleDashboardClick}
            >
              <div className="d-flex align-items-center flex-grow-1">
                <Icon type="bi-house" />
                {shouldShowContent && <span className="px-3">Dashboard</span>}
              </div>
            </Link>
          </li>
        </ul>

        <ul className="nav flex-column">
          {/* Certificate Section */}
          <SideBarLink
            iconType="bi-award"
            label="Certificate"
            isExpanded={activeSection === "Certificate"}
            onToggle={() => handleToggle("Certificate")}
            subItems={[
              // { label: "Generate Certificate", href: "/generate-certificate" },
              { label: "Certificate List", href: "/certificate-list" },
              // { label: "Verify Certificate", href: "/verify-certificate" },
            ]}
            collapsed={!shouldShowContent}
            onItemClick={handleItemClick}
          />
        </ul>
      </div>

      {shouldShowContent && (
        <div className="sidebar-footer d-flex justify-content-center align-items-center p-3">
          <p className="mb-0" style={{ fontSize: "12px" }}>
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      )}
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;