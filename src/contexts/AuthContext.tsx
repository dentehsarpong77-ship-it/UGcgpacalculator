import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  studentEmail: string | null;
  login: (email: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [studentEmail, setStudentEmail] = useState<string | null>(() => {
    const email = localStorage.getItem('authenticated_student_email');
    const lastActivity = localStorage.getItem('last_activity');

    // Simple session timeout (30 mins = 1800000ms)
    if (email && lastActivity && Date.now() - parseInt(lastActivity) > 1800000) {
      localStorage.removeItem('authenticated_student_email');
      localStorage.removeItem('last_activity');
      return null;
    }
    return email;
  });

  useEffect(() => {
    if (studentEmail) {
      localStorage.setItem('authenticated_student_email', studentEmail);
      localStorage.setItem('last_activity', Date.now().toString());
    } else {
      localStorage.removeItem('authenticated_student_email');
      localStorage.removeItem('last_activity');
    }
  }, [studentEmail]);

  const login = async (emailInput: string, pinInput: string): Promise<boolean> => {
    const email = emailInput.trim().toLowerCase();
    const pin = pinInput.trim();

    try {
      // Fake auth: store mapping of Email to PIN in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '{}');

      // Hash PIN before comparing/storing
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (!users[email]) {
        users[email] = { pin: hashedPin, name: email.split('@')[0] }; // Create new user
        localStorage.setItem('users', JSON.stringify(users));
      } else if (users[email].pin !== hashedPin) {
        return false; // Return false so components can handle incorrect PIN state
      }

      setStudentEmail(email);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const logout = () => setStudentEmail(null);

  return (
    <AuthContext.Provider value={{ studentEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};