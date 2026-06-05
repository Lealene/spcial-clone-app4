"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/auth";
import { useAuth } from "@/providers/AuthProvider";

type LoginForm = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const { register, handleSubmit } = useForm<LoginForm>();

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => loginUser(data.username, data.password),

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      router.push("/");
    },
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit((d) => loginMutation.mutate(d))}
          style={styles.form}
        >
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              placeholder="Username"
              {...register("username")}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              style={styles.input}
            />
          </div>

          {loginMutation.isError && (
            <div style={styles.errorBox}>
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Login failed"}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={styles.button}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #1e293b, #0f172a)",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },
  header: { textAlign: "center", marginBottom: "30px" },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "white",
    margin: "0 0 8px",
  },
  subtitle: { color: "#cbd5e1", margin: 0 },
  errorBox: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid #ef4444",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#fca5a5",
    fontSize: "14px",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "white", fontSize: "14px" },
  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
    width: "100%",
  },
  button: {
    marginTop: "6px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    color: "#cbd5e1",
    fontSize: "14px",
  },
  link: { color: "#60a5fa", textDecoration: "none", fontWeight: "bold" },
};
