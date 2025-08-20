'use client';

import { useEffect, useState } from 'react';

export default function SimpleThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('openstage-theme');
    let currentTheme = savedTheme;
    
    // If no saved theme, use system preference
    if (!currentTheme) {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Set state and apply theme
    const isDarkMode = currentTheme === 'dark';
    setIsDark(isDarkMode);
    applyTheme(currentTheme);
  }, []);

  const applyTheme = (theme: string) => {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light'); 
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    
    // Also set a data attribute for additional styling if needed
    html.setAttribute('data-theme', theme);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    const newIsDark = !isDark;
    
    setIsDark(newIsDark);
    applyTheme(newTheme);
    
    // Save preference to localStorage
    localStorage.setItem('openstage-theme', newTheme);
    
    console.log('Theme changed to:', newTheme); // Debug log
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Currently ${isDark ? 'dark' : 'light'} mode. Click to switch.`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <svg 
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        
        {/* Moon Icon */}
        <svg 
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </button>
  );
}
