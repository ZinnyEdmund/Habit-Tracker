'use client';

import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, saveSession, saveUsers } from '@/data/storage';
import Link from 'next/link';
import Image from 'next/image';

const Logo = '/icons/icon-192.png';
const SliderImg = '/images/img1.jpg';

const styles: Record<string, CSSProperties> = {
  container: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    background:
      "linear-gradient(135deg, var(--light-200) 0%, var(--light-200) 50%, var(--light-200) 100%)",
  },
  noiseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: 0,
    pointerEvents: "none",
    filter: "url(#noiseFilter)",
    opacity: 0.2,
  },
  main: {
    display: "flex",
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--light-200)",
    padding: "20px 0 50px",
    gap: 20
  },
  logoWrapper: { 
    display: "flex", 
    justifyContent: "center",
    marginBottom: 10
  },
  logo: {
    borderRadius: "8px"
  },
  paper: {
    backgroundColor: "transparent",
    boxShadow: "none",
    width: "70%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  title: { 
    fontSize: 25,
    fontWeight: 500, 
    color: "var(--dark-100)", 
    textAlign: "center" ,
    marginBottom: -5
  },
  subtitle: { 
    fontSize: 11,
    fontWeight: 450, 
    color: "var(--dark-200)", 
    textAlign: "center", 
    marginBottom: 30
  },
  footerWrapper: { 
    fontSize: 11,
    fontWeight: 450, 
    color: "var(--dark-200)", 
    textAlign: "center", 
    marginTop: 20
  },
  footerLink: { 
    fontSize: 11,
    fontWeight: 450, 
    color: "var(--dark-100)", 
    textDecoration: "none", 
    cursor: "pointer", 
    transition: "opacity 0.2s", 
    marginLeft: 4
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "var(--dark-300)",
  },
  inputWrapper: { 
    display: "flex", 
    flexDirection: "column", 
    width: "100%" 
  },
  label: { 
    fontSize: 11, 
    fontWeight: 450, 
    marginBottom: 8, 
    color: "var(--dark-200)" 
  },
  input: {
    width: "100%",
    padding: "9px 14px",
    fontSize: 10,
    fontWeight: 450, 
    borderRadius: 8,
    border: "1px solid var(--dark-300)",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "var(--light-100)",
    color: "var(--dark-100)",
  },
  button: { 
    fontSize: 11,
    fontWeight: 450, 
    color: "var(--light-100)", 
    backgroundColor: "var(--dark-200)", 
    borderRadius: 8,
    height: 34, 
    marginTop: 5, 
    cursor: "pointer",
    width: "100%",
  },
  errorText: { 
    fontSize: 11,
    fontWeight: 450, 
    color: "#b42318",
  },
};

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    const users = getUsers();
    const duplicateUser = users.find((user) => user.email === normalizedEmail);

    if (duplicateUser) {
      setError('User already exists');
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    saveSession({
      userId: newUser.id,
      email: newUser.email,
    });

    setError(null);
    router.replace('/dashboard');
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <svg style={{ display: "none" }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
        </filter>
      </svg>

      <div style={styles.noiseOverlay} />  

      <div style={styles.main}>
        <div style={styles.leftPanel}>
          <section style={styles.paper}>
            <div style={styles.logoWrapper}>
              <Image
                src={Logo}
                alt="Logo"
                width={30}
                height={30}
                priority
                style={styles.logo}
              />
            </div>

            <h1 style={styles.title}>Get Started</h1>
            <p style={styles.subtitle}>
              Your habits, progress and consistency - all in one place.
            </p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={styles.inputWrapper}>
                  <label htmlFor="signup-email" style={styles.label}>
                    Email
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    data-testid="auth-signup-email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputWrapper}>
                  <label htmlFor="signup-password" style={styles.label}>
                    Password
                  </label>

                  <input
                    id="signup-password"
                    type="password"
                    data-testid="auth-signup-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    style={styles.input}
                  />
                </div>

                {error ? (
                  <p style={styles.errorText}>
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  data-testid="auth-signup-submit"
                  style={styles.button}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </section>

          <p style={styles.footerWrapper}>
            Already have an account?
            <Link href="/login" style={styles.footerLink}>
              Log in here.
            </Link>
          </p>
        </div>

        {!isMobile && (
          <div style={styles.rightPanel}>
            <Image
              src={SliderImg}
              alt="Hero"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "50% 35%"}}
            />
        </div>
        )}
      </div>
    </div>
  );
}