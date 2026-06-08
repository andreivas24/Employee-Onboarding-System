import { useState } from 'react';
import { authApi } from '../api/authApi';
import type { AuthUser } from '../types/auth';
import '../styles/Login.css';

type Props = {
  onLogin: (user: AuthUser) => void;
  onGoToRegister: () => void;
};

function Login({ onLogin, onGoToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const user = await authApi.login({ email, password });
      localStorage.setItem('authUser', JSON.stringify(user));
      onLogin(user);
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <main className="auth-page">
      <section className="login-card">
        <h1>Employee Onboarding System</h1>
        <p>Login to continue.</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <button className="link-button" onClick={onGoToRegister}>
          Create an account
        </button>
      </section>
    </main>
  );
}

export default Login;