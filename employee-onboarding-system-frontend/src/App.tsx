import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import type { AuthUser } from './types/auth';
import './App.css';
import NotificationsCenter from './components/notifications/NotificationsCenter';
import ProfilePage from './pages/ProfilePage';
import type { UserProfile } from './types/profile';
import ResetPassword from './pages/ResetPassword';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [activePage, setActivePage] = useState<'dashboard' | 'admin' | 'profile'>('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedUser: AuthUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
    setActivePage('dashboard');
  };

  const handleProfileUpdated = (profile: UserProfile) => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      fullName: profile.fullName,
      role: profile.role,
      profileImageUrl: profile.profileImageUrl,
    };

    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) {
      return '';
    }

    return url.startsWith('http')
      ? url
      : `http://localhost:8080${url}`;
  };

  const handleOpenCreateRequest = () => {
    const confirmed = window.confirm(
      'Are you sure you want to create a new onboarding request?'
    );

    if (confirmed) {
      setIsCreateFormVisible(true);
    }
  };

  const refreshDashboard = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!user && showRegister) {
    return (
      <Register
        onRegister={() => setShowRegister(false)}
        onGoToLogin={() => setShowRegister(false)}
      />
    );
  }

  const isResetPasswordPage = window.location.pathname === '/reset-password';

  if (isResetPasswordPage) {
    return (
      <ResetPassword/>
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app-page">
      <header className="app-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.profileImageUrl ? (
              <img
                src={getImageUrl(user.profileImageUrl)}
                alt={user.fullName}
                className="navbar-avatar-image"
              />
            ) : (
              user.fullName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <p className="user-label">Logged in as</p>
            <p className="user-name">
              {user.fullName}
              <span className={`role-badge role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </p>
          </div>
        </div>

        <div className="app-header-actions">
          {activePage !== 'dashboard' && (
            <button
              className="nav-button"
              onClick={() => setActivePage('dashboard')}
            >
              Dashboard
            </button>
          )}

          {user.role === 'ADMIN' && activePage !== 'admin' && (
            <button
              className="nav-button"
              onClick={() => setActivePage('admin')}
            >
              Admin Panel
            </button>
          )}

          <NotificationsCenter role={user.role} />

          {activePage !== 'profile' && (
            <button
              className="nav-button"
              onClick={() => setActivePage('profile')}
            >
              Profile
            </button>
          )}

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {activePage === 'profile' && (
        <ProfilePage user={user} onProfileUpdated={handleProfileUpdated} />
      )}

      {activePage === 'dashboard' && (
        <>
          <Dashboard
            key={refreshKey}
            role={user.role}
            user={user}
            onCreateRequest={
              user.role === 'HR' ? handleOpenCreateRequest : undefined
            }
          />

          {user.role === 'HR' && (
            <CreateRequest
              role={user.role}
              onCreated={refreshDashboard}
              isFormVisible={isCreateFormVisible}
              setIsFormVisible={setIsCreateFormVisible}
            />
          )}
        </>
      )}

      {activePage === 'admin' && user.role === 'ADMIN' && <AdminPanel />}
    </div>
  );
}

export default App;