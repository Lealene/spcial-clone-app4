"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser({ email, username, password });
      router.push("/"); // go to feed after register
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #1e293b, #0f172a)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "10px",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "#cbd5e1" }}>Join SocialClone today</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {[
            {
              label: "Email",
              type: "email",
              value: email,
              setter: setEmail,
              placeholder: "Enter email",
            },
            {
              label: "Username",
              type: "text",
              value: username,
              setter: setUsername,
              placeholder: "Choose a username",
            },
            {
              label: "Password",
              type: "password",
              value: password,
              setter: setPassword,
              placeholder: "Create a password",
            },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label style={{ color: "white", fontSize: "14px" }}>
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "white",
                  outline: "none",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", color: "#cbd5e1" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
