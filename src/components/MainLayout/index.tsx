import React, { useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from '../BottomNav';
import './style.css';

const scrollPositions = new Map<string, number>();

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const savedPosition = scrollPositions.get(location.pathname) ?? 0;
      container.scrollTop = savedPosition;
    }
  }, [location.pathname]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      scrollPositions.set(location.pathname, container.scrollTop);
    }
  };

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (container) {
        scrollPositions.set(location.pathname, container.scrollTop);
      }
    };
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <div className="status-bar-placeholder" />
      
      <main className="main-content">
        <div ref={scrollContainerRef} className="page-content page-enter">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;
