import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user token/data on load
    try {
      const storedUser = localStorage.getItem('hostelx_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.token) {
          const hasSession = sessionStorage.getItem('hostelx_session_active');
          const lastActiveStr = localStorage.getItem('hostelx_last_active');
          
          if (!hasSession && lastActiveStr) {
            const lastActive = parseInt(lastActiveStr, 10);
            const now = Date.now();
            const thirtyMinutes = 30 * 60 * 1000;
            if (now - lastActive > thirtyMinutes) {
              // Expired! Clear session
              localStorage.removeItem('hostelx_user');
              localStorage.removeItem('hostelx_last_active');
              setUser(null);
              setLoading(false);
              return;
            }
          }
          
          setUser(parsed);
          sessionStorage.setItem('hostelx_session_active', 'true');
          localStorage.setItem('hostelx_last_active', Date.now().toString());
        } else {
          // Corrupted/tokenless data — clear it
          localStorage.removeItem('hostelx_user');
        }
      }
    } catch {
      localStorage.removeItem('hostelx_user');
    }
    setLoading(false);
  }, []);

  // Sync active status on user interaction
  useEffect(() => {
    if (!user) return;

    const updateLastActive = () => {
      localStorage.setItem('hostelx_last_active', Date.now().toString());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, updateLastActive));
    window.addEventListener('beforeunload', updateLastActive);

    // Initial update
    updateLastActive();

    return () => {
      events.forEach(e => window.removeEventListener(e, updateLastActive));
      window.removeEventListener('beforeunload', updateLastActive);
    };
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('hostelx_user', JSON.stringify(userData));
    sessionStorage.setItem('hostelx_session_active', 'true');
    localStorage.setItem('hostelx_last_active', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostelx_user');
    localStorage.removeItem('hostelx_last_active');
    sessionStorage.removeItem('hostelx_session_active');
  };

  const updateProfile = (updatedData) => {
    const newData = { ...user, ...updatedData };
    setUser(newData);
    localStorage.setItem('hostelx_user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

