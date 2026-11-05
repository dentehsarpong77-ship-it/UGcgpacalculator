import React, { useState } from 'react';
import { GraduationCap, Lock, User } from 'lucide-react';
// Removed unused import: useAuth

interface LoginViewProps {
  onLogin: (email: string, pin: string) => Promise<boolean>;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (email && pin) {
      const success = await onLogin(email, pin);
      if (!success) {
        setError('Incorrect PIN or email. Access denied.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-ugGold-100 dark:bg-ugGold-900/20 rounded-full">
            <GraduationCap className="w-10 h-10 text-ugGold-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">UG GPA Planner</h1>
        <p className="text-center text-slate-500 mb-6">Sign in with your student details</p>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Student Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ugGold-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ugGold-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-slate-900 dark:bg-ugGold-600 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
