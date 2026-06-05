"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div style={styles.nav}>
      <Link href="/" style={styles.brand}>
        SocialClone
      </Link>

      <div style={styles.links}>
        <Link href="/" style={styles.link}>
          Home
        </Link>

        {user ? (
          <>
            <Link href="/new" style={{ ...styles.link, ...styles.postBtn }}>
              + Post
            </Link>
            <Link href={user ? `/profile/${user.username}` : "/login"}>
              @{user?.username}
            </Link>
            <Link href="/settings" style={styles.link}>
              Settings
            </Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={styles.link}>
              Login
            </Link>
            <Link href="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "#576075",
    borderBottom: "1px solid #244470",
    padding: "0 20px",
    height: "56px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    color: "white",
    fontWeight: "700",
    fontSize: "18px",
    textDecoration: "none",
  },
  links: { display: "flex", gap: "12px", alignItems: "center" },
  link: { color: "#cbd5e1", textDecoration: "none", fontSize: "14px" },
  postBtn: {
    background: "#273450",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "600",
  },
  logoutBtn: {
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
  },
};
