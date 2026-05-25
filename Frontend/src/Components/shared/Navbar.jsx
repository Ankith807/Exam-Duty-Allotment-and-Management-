import React, { useState, useEffect } from "react";
import sditLogo from "../../assets/sdit_brand_banner.png";
import { Menu } from "lucide-react";

const Navbar = ({ onToggleSidebar }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down (but not at the very top)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 bg-white shadow-lg border-b border-gray-200 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="relative flex items-center min-h-[60px] md:min-h-[64px]">
            {/* Toggle Button - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3"
              aria-label="Toggle sidebar"
            >
              <Menu size={22} />
            </button>

            {/* Logo - Always centered */}
            <div className="flex items-center space-x-3 mx-auto md:mx-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <img
                  src={sditLogo}
                  alt="SDIT Logo"
                  className="h-12 md:h-16 w-auto object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Examination Portal</h1>
                <p className="text-xs md:text-sm text-gray-600">Examination Duty Management</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to offset fixed navbar */}
      <div className="pt-24 md:pt-32" />
    </>
  );
};

export default Navbar;
