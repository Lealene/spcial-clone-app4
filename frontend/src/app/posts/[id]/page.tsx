"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type User = {
  id: string;
  username: string;
  email: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author?: User;
  user?: User;
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author?: User;
  user?: User;
  comments: Comment[];
  likes: number;
  likedByMe: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadPost = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/posts/${id}`);

      if (!res.ok) {
        throw new Error("Failed to load post");
      }

      const data = await res.json();

      console.log("POST DATA:", data);

      setPost(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const toggleLike = async () => {
    const token = localStorage.getItem("token");

    if (!token || !post) return;

    try {
      const res = await fetch(`${API}/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: data.likes,
              likedByMe: data.liked,
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async () => {
    const token = localStorage.getItem("token");

    if (!token || !comment.trim()) return;

    try {
      setPosting(true);

      await fetch(`${API}/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: comment,
        }),
      });

      setComment("");
      await loadPost();
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20, color: "white" }}>Loading...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: 20, color: "white" }}>Failed to load post.</div>
    );
  }

  const username =
    post.user?.username || post.author?.username || "Unknown User";

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 20,
        color: "white",
      }}
    >
      <Link href="/">← Back</Link>

      <div
        style={{
          background: "#111827",
          padding: 20,
          borderRadius: 10,
          marginTop: 15,
        }}
      >
        <p>@{username}</p>

        <p>{post.content}</p>

        <button
          onClick={toggleLike}
          style={{
            marginTop: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: post.likedByMe ? "red" : "white",
            fontSize: 18,
          }}
        >
          {post.likedByMe ? "❤️" : "🤍"} {post.likes}
        </button>
      </div>

      <h3 style={{ marginTop: 25 }}>Add Comment</h3>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        style={{
          width: "100%",
          minHeight: 100,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <button
        onClick={submitComment}
        disabled={posting}
        style={{
          marginTop: 10,
          padding: "10px 20px",
        }}
      >
        {posting ? "Posting..." : "Post Comment"}
      </button>

      <h3 style={{ marginTop: 30 }}>Comments ({post.comments?.length || 0})</h3>

      {post.comments?.map((c) => {
        const commentUser =
          c.user?.username || c.author?.username || "Unknown User";

        return (
          <div
            key={c.id}
            style={{
              background: "#1f2937",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <p style={{ color: "#60a5fa" }}>@{commentUser}</p>

            <p>{c.content}</p>
          </div>
        );
      })}
    </div>
  );
}
