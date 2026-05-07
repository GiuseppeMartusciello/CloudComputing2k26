import React, { useEffect, useRef } from "react";
import {
  IoHomeOutline,
  IoTodayOutline,
  IoThumbsUpOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { useAuth } from "../../services/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./LeftSidebar.css";

export default function LeftSidebar({ setSidebarOpen }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const closeSidebar = () => setSidebarOpen(false);

  const goTo = (path) => {
    navigate(path);
    closeSidebar();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div ref={sidebarRef} className="left-sidebar sidebar-sticky">
      <ul className="menu">
        <li className={`menu-item ${isActive("/") ? "selected" : ""}`} onClick={() => goTo("/")}> 
          <i className="icon"><IoHomeOutline /></i>
          <span>Home</span>
        </li>
        <li className={`menu-item ${isActive("/today") ? "selected" : ""}`} onClick={() => goTo("/today")}> 
          <i className="icon"><IoTodayOutline /></i>
          <span>Post del giorno</span>
        </li>
        {isLoggedIn && (
          <li className={`menu-item ${isActive("/my-upvotes") ? "selected" : ""}`} onClick={() => goTo("/my-upvotes")}> 
            <i className="icon"><IoThumbsUpOutline /></i>
            <span>Mi Piace</span>
          </li>
        )}
        {isLoggedIn && (
          <li className={`menu-item ${isActive("/profile") ? "selected" : ""}`} onClick={() => goTo("/profile")}> 
            <i className="icon"><IoPersonOutline /></i>
            <span>Profilo</span>
          </li>
        )}
        {isLoggedIn && (
          <li className="menu-item d-md-none" onClick={logout}> 
            <i className="icon"><IoLogOutOutline /></i>
            <span>Logout</span>
          </li>
        )}
      </ul>
    </div>
  );
}
