"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const MAX_CHARS = 500;

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return alert("Post cannot be empty");
    if (content.length > MAX_CHARS) return alert(`Max ${MAX_CHARS} characters`);

    setLoading(true);
    try {
      await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      router.push("/");
    } catch (err: any) {
      alert(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_CHARS - content.length;
  const overLimit = remaining < 0;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Post</h1>

        <form onSubmit={submit} style={styles.form}>
          <div style={{ position: "relative" }}>
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                ...styles.textarea,
                borderColor: overLimit ? "#ef4444" : "#334155",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 12,
                right: 14,
                fontSize: 12,
                color: overLimit
                  ? "#ef4444"
                  : remaining < 50
                    ? "#f59e0b"
                    : "#64748b",
              }}
            >
              {remaining}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || overLimit || !content.trim()}
            style={{
              ...styles.button,
              opacity: loading || overLimit || !content.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#111827",
    padding: 32,
    borderRadius: 16,
    border: "1px solid #1f2937",
  },
  title: { color: "white", fontSize: 22, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  textarea: {
    width: "100%",
    height: 160,
    padding: "14px 14px 32px",
    borderRadius: 10,
    border: "1px solid",
    background: "#0f172a",
    color: "white",
    fontSize: 15,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    padding: 14,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
