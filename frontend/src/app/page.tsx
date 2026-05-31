"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type Post = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  _count: {
    comments: number;
  };
  likes: number;
  likedByMe: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      if (loading) return;

      setLoading(true);

      try {
        const res = await fetch(`${API}/posts?page=${pageNum}`);

        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();

        setPosts((prev) => {
          const merged: Post[] =
            pageNum === 1 ? data.posts : [...prev, ...data.posts];

          const seen = new Set<string>();

          return merged.filter((post) => {
            if (seen.has(post.id)) {
              return false;
            }

            seen.add(post.id);
            return true;
          });
        });

        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    fetchPosts(1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        fetchPosts(next);
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPosts]);

  const toggleLike = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );

    try {
      const res = await fetch(`${API}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: data.likes,
                likedByMe: data.liked,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  console.log(
    "POST IDS:",
    posts.map((p) => p.id),
  );

  return (
    <div style={styles.page}>
      <div style={styles.feed}>
        <h1>Latest Posts</h1>

        {posts.map((post, index) => (
          <Link
            key={`${post.id}-${index}`}
            href={`/posts/${post.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={styles.card}>
              <p>@{post.user.username}</p>

              <p>{post.content}</p>

              {/* ACTION ROW */}
              <div style={styles.row}>
                {/* COMMENT */}
                <span>💬 {post._count.comments}</span>

                {/* LIKE */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLike(post.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: post.likedByMe ? "red" : "gray",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {post.likedByMe ? "❤️" : "🤍"}
                  <span>{post.likes}</span>
                </button>
              </div>
            </div>
          </Link>
        ))}

        <div ref={loaderRef} />

        {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    background: "#4c5874",
    color: "white",
    minHeight: "100vh",
  },

  feed: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 20,
  },

  card: {
    background: "#3b5691",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
};
