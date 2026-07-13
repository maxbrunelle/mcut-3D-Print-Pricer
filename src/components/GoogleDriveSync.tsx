import React, { useEffect, useState } from 'react';
import { googleSignIn, initAuth, logout, saveToDrive, loadFromDrive } from '../lib/drive';
import { useAppContext } from '../lib/store';
import { Cloud, CloudUpload, CloudDownload, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

export function GoogleDriveSync() {
  const { state, updateState } = useAppContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => setUser(u),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
      }
    } catch (e) {
      alert('Failed to sign in to Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  const handleSave = async () => {
    setSyncing(true);
    try {
      await saveToDrive(state);
      alert('State successfully saved to Google Drive!');
    } catch (e) {
      alert('Failed to save to Google Drive.');
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoad = async () => {
    setSyncing(true);
    try {
      const data = await loadFromDrive();
      if (data) {
        updateState(data);
        alert('State successfully loaded from Google Drive!');
      } else {
        alert('No backup found on Google Drive.');
      }
    } catch (e) {
      alert('Failed to load from Google Drive.');
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-2 rounded-xl shadow-sm border border-slate-200">
        <div className="text-sm text-slate-600 mr-2 flex items-center gap-2">
          {user.photoURL && <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />}
          <span className="hidden sm:inline-block">{user.email}</span>
        </div>
        <button
          onClick={handleSave}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          title="Backup to Google Drive"
        >
          <CloudUpload className="w-4 h-4" />
          <span className="hidden sm:inline-block">Backup</span>
        </button>
        <button
          onClick={handleLoad}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 disabled:opacity-50 transition-colors"
          title="Restore from Google Drive"
        >
          <CloudDownload className="w-4 h-4" />
          <span className="hidden sm:inline-block">Restore</span>
        </button>
        <button
          onClick={handleSignOut}
          className="p-1.5 text-slate-500 hover:text-slate-700 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-sm border border-slate-200 transition-colors"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
      {loading ? 'Signing in...' : 'Sign in to Sync'}
    </button>
  );
}
