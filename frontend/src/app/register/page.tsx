"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/lib/auth";
import { useAuth } from "@/providers/AuthProvider";

type RegisterForm = {
  email: string;
  username: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const registerMutation = useMutation({
    mutationFn: registerUser,

    onSuccess: (data) => {
      setUser(data.user);
      router.push("/");
    },

    onError: (error) => {
      console.error("Register Error:", error);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    console.log("Submitting:", data);
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
        <h1
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "30px",
          }}
        >
          Create Account
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
              })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
              }}
            />

            {errors.email && (
              <p style={{ color: "red" }}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
              })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
              }}
            />

            {errors.username && (
              <p style={{ color: "red" }}>{errors.username.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
              }}
            />

            {errors.password && (
              <p style={{ color: "red" }}>{errors.password.message}</p>
            )}
          </div>

          {registerMutation.isError && (
            <div
              style={{
                color: "red",
              }}
            >
              {(registerMutation.error as Error).message}
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            {registerMutation.isPending ? "Creating account..." : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#cbd5e1",
          }}
        >
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
