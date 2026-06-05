"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/lib/auth";

type RegisterForm = {
  email: string;
  username: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const registerMutation = useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      router.push("/");
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Registration failed";

      alert(message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
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
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Email */}
          <div>
            <label style={{ color: "white", fontSize: "14px" }}>Email</label>

            <input
              type="email"
              placeholder="Enter email"
              {...register("email", {
                required: "Email is required",
              })}
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

            {errors.email && (
              <p
                style={{ color: "#ef4444", fontSize: "13px", marginTop: "5px" }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label style={{ color: "white", fontSize: "14px" }}>Username</label>

            <input
              type="text"
              placeholder="Choose a username"
              {...register("username", {
                required: "Username is required",
              })}
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

            {errors.username && (
              <p
                style={{ color: "#ef4444", fontSize: "13px", marginTop: "5px" }}
              >
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label style={{ color: "white", fontSize: "14px" }}>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
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

            {errors.password && (
              <p
                style={{ color: "#ef4444", fontSize: "13px", marginTop: "5px" }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server Error */}
          {registerMutation.isError && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid #ef4444",
                borderRadius: "10px",
                padding: "12px",
                color: "#fca5a5",
              }}
            >
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : "Registration failed"}
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              marginTop: "10px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: registerMutation.isPending ? "not-allowed" : "pointer",
              opacity: registerMutation.isPending ? 0.8 : 1,
            }}
          >
            {registerMutation.isPending ? "Creating account..." : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#cbd5e1",
          }}
        >
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
