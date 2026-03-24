import React, { useState, useEffect } from "react";
import {
  ClipboardPenLine,
  User,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  Loader,
  BookOpenCheck,
  MessageSquareText,
  Menu,
  X,
  Map,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../../firebase";
import { useSidebar } from "../context/SidebarContext";

const SidebarItem = ({
  icon: Icon,
  text,
  active,
  onClick,
  isMobile,
  collapsed,
}) => (
  <li
    className={`
      flex items-center p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200
      ${
        active
          ? "bg-gray-700 text-white"
          : "text-gray-400 hover:bg-gray-700 hover:text-white"
      }
      ${isMobile ? "justify-start" : ""}
      ${collapsed && !isMobile ? "justify-center" : ""}
    `}
    onClick={onClick}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {(!collapsed || isMobile) && (
      <span className="ml-3 font-medium">{text}</span>
    )}
  </li>
);

const ProfileSection = ({
  userData,
  loading,
  isMobile,
  collapsed,
  onProfileClick,
  showEmail,
  onLogout,
}) => {
  if (collapsed && !isMobile) {
    return (
      <div className="p-4 border-t border-gray-700">
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={userData?.photoURL || "https://github.com/shadcn.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={onProfileClick}
              onError={(e) => {
                e.currentTarget.src = "https://github.com/shadcn.png";
              }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 border-t border-gray-700 ${isMobile ? "mt-auto" : ""} cursor-pointer`}
      onClick={onProfileClick}
    >
      {loading ? (
        <div className="flex justify-center">
          <Loader className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={userData?.photoURL || "https://github.com/shadcn.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = "https://github.com/shadcn.png";
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
            </div>
            <div className="ml-3 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {userData?.name || "User"}
              </h3>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>

          {showEmail && userData?.email && (
            <div className="mt-2 text-sm text-gray-300 truncate">
              {userData.email}
            </div>
          )}

          {showEmail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="mt-3 w-full py-1.5 px-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export function Sidebar() {
  const { isOpen, toggleSidebar, setIsOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserData(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleProfileDetails = () => {
    setShowProfileDetails(!showProfileDetails);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const docRef = doc(db, "profiles", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  const navItems = [
    // { icon: Home, text: "Home", path: "/" },
    {
      icon: LayoutDashboard,
      text: "Dashboard",
      path: userData ? `/dashboard/${auth.currentUser?.uid}` : "/auth",
    },
    { icon: BookOpenCheck, text: "Learn", path: "/learn" },
    {
      icon: ClipboardPenLine,
      text: "Interview Practice",
      path: userData ? `/interview` : "/auth",
    },
    { icon: MessageSquareText, text: "Internships", path: "/internships" },
    { icon: Map, text: "Career Path", path: "/career-path" },
    { icon: User, text: "Profile", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Enhanced Mobile Header */}
      {isMobile && (
        <header className="bg-gray-800 text-white p-3 flex items-center justify-between md:hidden fixed top-0 left-0 right-0 z-50 shadow-lg border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={22} className="text-purple-400" />
              ) : (
                <Menu size={22} className="text-purple-400" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-lg font-bold text-purple-400">DevHub</span>
            </div>
          </div>
          {userData && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400 hidden xs:inline">
                Online
              </span>
              <div className="relative">
                <img
                  src={userData?.photoURL || "https://github.com/shadcn.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-600"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-800"></span>
              </div>
            </div>
          )}
        </header>
      )}

      <aside
        className={`
          bg-gray-900 text-white transition-all duration-300 flex flex-col fixed top-0 left-0 h-full z-50
          ${
            isMobile
              ? `transform ${isOpen ? "translate-x-0" : "-translate-x-full"} w-64 shadow-xl`
              : `${isOpen ? "w-64" : "w-16"}`
          }
        `}
      >
        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex justify-between items-center p-4">
            {isOpen ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse flex-shrink-0" />
                <span className="text-xl font-bold text-purple-400">
                  DevHub
                </span>
              </div>
            ) : (
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse flex-shrink-0 mx-auto" />
            )}

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-white"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        )}

        {/* Mobile Header inside sidebar */}
        {isMobile && isOpen && (
          <div className="flex items-center gap-2 p-4 mt-2">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-xl font-bold text-purple-400">DevHub</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  text={item.text}
                  active={isActive}
                  onClick={() => {
                    if (loading && item.text === "Dashboard") return;
                    navigate(item.path);
                    if (isMobile) setIsOpen(false);
                  }}
                  isMobile={isMobile}
                  collapsed={!isOpen && !isMobile}
                />
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <ProfileSection
          userData={userData}
          loading={loading}
          isMobile={isMobile}
          collapsed={!isOpen && !isMobile}
          onProfileClick={toggleProfileDetails}
          showEmail={showProfileDetails}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
