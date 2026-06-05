"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  _count?: {
    comments: number;
  };
};

type ProfileData = {
  user: User;
  posts: Post[];
  hasMore: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const fetchProfile = async (pageNum = 1, reset = true) => {
    if (!username) return;

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`${API}/profile/${username}?page=${pageNum}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load profile");
      }

      const result: ProfileData = await res.json();

      if (reset) {
        setData(result);
      } else {
        setData((prev) =>
          prev
            ? {
                ...prev,
                posts: [...prev.posts, ...result.posts],
                hasMore: result.hasMore,
              }
            : result,
        );
      }

      setError("");
    } catch (err) {
      console.error(err);
      setError("User not found or failed to load.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProfile(1, true);
    setPage(1);
  }, [username]);

  useEffect(() => {
    const onFocus = () => {
      fetchProfile(1, true);
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [username]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProfile(next, false);
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#94a3b8" }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#f87171" }}>{error}</p>

        <Link href="/" style={{ color: "#60a5fa" }}>
          ← Back to feed
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.username === data.user.username;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.avatar}>{data.user.username[0]?.toUpperCase()}</div>

        <div style={{ flex: 1 }}>
          <p style={{ color: "#60a5fa" }}>@{data.user.username}</p>

          <p
            style={{
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            {data.user.email}
          </p>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: 14,
            }}
          >
            {data.user.bio || "No bio yet."}
          </p>
        </div>

        {isOwner && (
          <Link href="/settings">
            <button style={styles.editBtn}>Edit Profile</button>
          </Link>
        )}
      </div>

      <h3 style={{ color: "white" }}>
        Posts ({data.posts.length}
        {data.hasMore ? "+" : ""})
      </h3>

      {data.posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          style={{
            textDecoration: "none",
          }}
        >
          <div style={styles.postCard}>
            <p style={styles.postContent}>{post.content}</p>

            <div style={styles.postMeta}>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>

              <span>💬 {post._count?.comments ?? 0}</span>
            </div>
          </div>
        </Link>
      ))}

      {data.hasMore && (
        <button onClick={loadMore} style={styles.loadMore}>
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

const styles: any = {
  page: {
    maxWidth: 700,
    margin: "0 auto",
    padding: 20,
  },

  center: {
    textAlign: "center",
    padding: 60,
    color: "white",
  },

  header: {
    background: "#111827",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #1f2937",
    display: "flex",
    gap: 20,
    marginBottom: 24,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    color: "white",
  },

  editBtn: {
    padding: "8px 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  postCard: {
    background: "#111827",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #1f2937",
    marginBottom: 10,
  },

  postContent: {
    color: "#e2e8f0",
    fontSize: 14,
    margin: 0,
  },

  postMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    color: "#64748b",
    fontSize: 12,
  },

  loadMore: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#1e293b",
    color: "white",
    border: "1px solid #334155",
    borderRadius: 8,
    cursor: "pointer",
  },
};
