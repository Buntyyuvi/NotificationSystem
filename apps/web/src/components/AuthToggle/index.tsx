import { useState } from 'react';
import styles from './styles.module.css';

export default function AuthToggle() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <div className={styles.authToggle}>
      <p id="status" className={styles.status}>
        {isLoggedIn ? 'Welcome back!' : 'Please log in'}
      </p>

      {isLoggedIn ? (
        <>
          <button id="logout-btn" className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
          <span id="badge" className={styles.badge}>Online</span>
        </>
      ) : (
        <button id="login-btn" className={styles.loginBtn} onClick={handleLogin}>
          Log In
        </button>
      )}
    </div>
  );
}