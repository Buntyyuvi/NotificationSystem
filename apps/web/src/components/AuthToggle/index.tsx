import { useState, type FormEvent } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import styles from './styles.module.css';

export default function AuthToggle() {
  const { user, loading, login, register, logout } = useAuthContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Authentication failed');
    }
  };

  if (loading) {
    return (
      <div className={styles.authToggle}>
        <p className={styles.status}>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className={styles.authToggle}>
        <p id="status" className={styles.status}>
          Signed in as {user.email}
        </p>
        <span id="badge" className={styles.badge}>Online</span>
        <button id="logout-btn" className={styles.logoutBtn} onClick={logout}>
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className={styles.authToggle}>
      <p id="status" className={styles.status}>
        {mode === 'login' ? 'Please log in' : 'Create an account'}
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button id="login-btn" className={styles.loginBtn} type="submit">
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.switchBtn}
        onClick={() => setMode(m => (m === 'login' ? 'register' : 'login'))}
      >
        {mode === 'login'
          ? 'Need an account? Sign up'
          : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
