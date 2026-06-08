import { useState } from 'react';
import { authApi } from '../api/authApi';
import type { AuthUser } from '../types/auth';
import '../styles/Login.css';

type Props = {
  onRegister: (user: AuthUser) => void;
  onGoToLogin: () => void;
};

function Register({ onRegister, onGoToLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const user = await authApi.register({
        fullName,
        email,
        password,
      });

      localStorage.setItem('authUser', JSON.stringify(user));
      onRegister(user);
    } catch {
      setError('Registration failed. Email may already be registered.');
    }
  };

  return (
    <main className="auth-page">
      <section className="login-card">
        <h1>Create Account</h1>
        <p>Register a user for the onboarding workflow.</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

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

          <button type="submit">Register</button>
        </form>

        <button className="link-button" onClick={onGoToLogin}>
          Already have an account? Login
        </button>
      </section>
    </main>
  );
}

export default Register;