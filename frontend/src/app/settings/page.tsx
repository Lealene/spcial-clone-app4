"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";

type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
};

type FormData = {
  username: string;
  bio: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SettingsPage() {
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const stored = localStorage.getItem("user");

      if (!stored) {
        throw new Error("No user found");
      }

      return JSON.parse(stored) as User;
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  const updateProfile = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`${API}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      return res.json();
    },

    onSuccess: (updated) => {
      localStorage.setItem("user", JSON.stringify(updated));

      alert("Profile updated!");

      router.push(`/profile/${updated.username}`);
    },

    onError: () => {
      alert("Update failed");
    },
  });

  const onSubmit = (data: FormData) => {
    updateProfile.mutate(data);
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: 80,
          color: "white",
        }}
      >
        Loading settings...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1>Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.field}>
          <label>Email</label>
          <input value={user.email} disabled style={styles.inputDisabled} />
        </div>

        <div style={styles.field}>
          <label>Username</label>
          <input
            {...register("username", {
              required: "Username is required",
              minLength: 3,
            })}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Bio</label>
          <textarea {...register("bio")} style={styles.textarea} />
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending}
          style={styles.button}
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

const styles: any = {
  container: {
    padding: "80px 20px",
    maxWidth: 500,
    margin: "0 auto",
    color: "white",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 15,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
  },

  inputDisabled: {
    padding: 10,
    borderRadius: 8,
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
  },

  textarea: {
    padding: 10,
    borderRadius: 8,
    minHeight: 100,
    background: "#0f172a",
    color: "white",
    border: "1px solid #334155",
  },

  button: {
    marginTop: 20,
    padding: "10px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
