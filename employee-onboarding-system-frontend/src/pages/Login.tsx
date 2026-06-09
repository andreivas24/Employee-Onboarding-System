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

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

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

  const handleForgotPassword = async () => {
    try {
      await authApi.forgotPassword({ email: forgotEmail });
      setForgotMessage('If the email exists, a reset link has been sent.');
    } catch {
      setForgotMessage('Failed to request password reset.');
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

          <button
            type="button"
            className="link-button"
            onClick={() => setShowForgotModal(true)}
          >
            Forgot password?
          </button>
        </form>

        <button className="link-button" onClick={onGoToRegister}>
          Create an account
        </button>
      </section>

      {showForgotModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card">
            <h2>Reset Password</h2>
            <p>Enter your email and we will send you a reset link.</p>

            {forgotMessage && <p className="auth-info-message">{forgotMessage}</p>}

            <div className="login-form">
              <label>Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
              />

              <button type="button" onClick={handleForgotPassword}>
                Send Reset Link
              </button>

              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail('');
                  setForgotMessage('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;