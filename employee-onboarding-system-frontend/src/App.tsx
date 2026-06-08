import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import type { AuthUser } from './types/auth';
import './App.css';
import NotificationsCenter from './components/NotificationsCenter';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [activePage, setActivePage] = useState<'dashboard' | 'admin'>('dashboard');

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
        onRegister={handleLogin}
        onGoToLogin={() => setShowRegister(false)}
      />
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
            {user.fullName.charAt(0).toUpperCase()}
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
          {user.role === 'ADMIN' && (
            <button
              className="nav-button"
              onClick={() =>
                setActivePage(activePage === 'dashboard' ? 'admin' : 'dashboard')
              }
            >
              {activePage === 'dashboard' ? 'Admin Panel' : 'Dashboard'}
            </button>
          )}

          <NotificationsCenter role={user.role} />

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {activePage === 'dashboard' && (
        <>
          <Dashboard
            key={refreshKey}
            role={user.role}
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

      {activePage === 'admin' && user.role === 'ADMIN' && (
        <AdminPanel role={user.role} />
      )}
    </div>
  );
}

export default App;