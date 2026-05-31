"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

 
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      router.push("/login");
      return;
    }

    const parsed: User = JSON.parse(stored);

    setUser(parsed);
    setUsername(parsed.username);
    setBio(parsed.bio || "");
    setLoading(false);
  }, [router]);

  const saveChanges = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updated = await res.json();

      
      localStorage.setItem("user", JSON.stringify(updated));

      alert("Profile updated!");

      router.push(`/profile/${updated.username}`);
    } catch (err) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 80, color: "white" }}>Loading settings...</div>
    );
  }

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1>Settings</h1>

      
      <div style={styles.field}>
        <label>Email</label>
        <input value={user.email} disabled style={styles.inputDisabled} />
      </div>

      
      <div style={styles.field}>
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
      </div>

     
      <div style={styles.field}>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={styles.textarea}
        />
      </div>

      <button onClick={saveChanges} style={styles.button}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
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
