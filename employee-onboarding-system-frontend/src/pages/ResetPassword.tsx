import { useState } from 'react';
import { authApi } from '../api/authApi';
import '../styles/Login.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const token = new URLSearchParams(window.location.search).get('token') ?? '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await authApi.resetPassword({
        token,
        newPassword,
      });

      setMessage('Password reset successfully. Redirecting to login...');
      setMessageType('success');

      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.location.reload();
      }, 1800);
    } catch {
      setMessage('Failed to reset password. The link may be invalid or expired.');
      setMessageType('error');
    }
  };

  return (
    <main className="auth-page">
      <section className="login-card">
        <h1>Reset Password</h1>
        <p>Enter your new password.</p>

        {message && (
          <p className={messageType === 'success' ? 'success-message' : 'auth-error'}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />

          <button type="submit">Reset Password</button>
        </form>
      </section>
    </main>
  );
}

export default ResetPassword;