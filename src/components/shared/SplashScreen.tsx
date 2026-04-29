"use client";

import { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";

const Logo = "/icons/icon-192.png";

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: {
    borderRadius: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--dark-100)",
    textAlign: "center",
  },
};

export function SplashScreen() {
  return (
    <main
      data-testid="splash-screen"
      style={styles.container}
    >
      <div style={styles.content}>
        <Image
          src={Logo}
          alt="Logo"
          width={22}
          height={22}
          priority
          style={styles.logo}
        />
        <h1 style={styles.title}>Habit Tracker</h1>
      </div>
    </main>
  );
}