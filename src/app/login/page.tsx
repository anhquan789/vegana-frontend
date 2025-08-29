'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement authentication logic
    console.log('Login attempt:', { email, password });
    
    // Simulate API call and redirect to dashboard
    setTimeout(() => {
      setIsLoading(false);
      // For now, redirect to dashboard after any login attempt
      // Later this should only happen after successful authentication
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Đăng nhập</h1>
          <p>Chào mừng bạn trở lại với Vegana</p>
        </div>
        
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          
          <div className={styles.loginOptions}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" />
              <span className={styles.checkmark}></span>
              Ghi nhớ tôi
            </label>
            
            <a href="#" className={styles.forgotPassword}>
              Quên mật khẩu?
            </a>
          </div>
          
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className={styles.loginFooter}>
          <p>
            Chưa có tài khoản?{' '}
            <a href="#" className={styles.signupLink}>
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;