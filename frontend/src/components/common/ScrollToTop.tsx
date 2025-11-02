import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page when navigating to a new route.
 * This ensures users start at the top of the page when clicking navigation links,
 * especially footer links.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'smooth' for smooth scrolling
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
