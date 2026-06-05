"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "@/providers/AuthProvider";

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

type CommentForm = {
  content: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<CommentForm>();

  const {
    data: post,
    isLoading,
    refetch,
  } = useQuery<Post>({
    queryKey: ["post", id],

    queryFn: async () => {
      const res = await fetch(`${API}/posts/${id}`);

      if (!res.ok) {
        throw new Error("Failed to load post");
      }

      return res.json();
    },

    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.json();
    },

    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      return res.json();
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CommentForm) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to comment");
      }

      return res.json();
    },

    onSuccess: () => {
      reset();
      refetch();
    },
  });

  const onSubmit = (data: CommentForm) => {
    commentMutation.mutate(data);
  };

  if (isLoading) {
    return <div style={{ padding: 20, color: "white" }}>Loading...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: 20, color: "white" }}>Failed to load post.</div>
    );
  }

  const username =
    post.user?.username || post.author?.username || "Unknown User";

  const isOwner =
    user?.id && (post.user?.id === user.id || post.author?.id === user.id);

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

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <button
            onClick={() => likeMutation.mutate()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: post.likedByMe ? "red" : "white",
              fontSize: 18,
            }}
          >
            {post.likedByMe ? "❤️" : "🤍"} {post.likes}
          </button>

          {isOwner && (
            <button
              onClick={() => deleteMutation.mutate()}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid #ef4444",
                borderRadius: 8,
                color: "#fecaca",
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              Delete Post
            </button>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 25 }}>Add Comment</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          {...register("content", {
            required: true,
          })}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 10,
            borderRadius: 8,
          }}
        />

        <button
          type="submit"
          disabled={commentMutation.isPending}
          style={{
            marginTop: 10,
            padding: "10px 20px",
          }}
        >
          {commentMutation.isPending ? "Posting..." : "Post Comment"}
        </button>
      </form>

      <h3 style={{ marginTop: 30 }}>Comments ({post.comments.length})</h3>

      {post.comments.map((c) => {
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
