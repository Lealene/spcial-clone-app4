"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";

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

type PostsResponse = {
  posts: Post[];
  nextCursor?: string | null;
};

type CommentFormInputs = {
  content: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function PostCommentForm({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormInputs>({
    defaultValues: { content: "" },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormInputs) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        throw new Error("Login required");
      }

      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.message || "Failed to post comment");
      }

      return res.json();
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      setError("content", {
        type: "manual",
        message:
          error?.message === "Login required"
            ? "Login to post a comment."
            : error?.message || "Unable to post comment.",
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!data.content.trim()) {
      setError("content", {
        type: "required",
        message: "Comment cannot be empty.",
      });
      return;
    }

    commentMutation.mutate({ content: data.content.trim() });
  });

  const hasAuthToken =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  return (
    <form onSubmit={onSubmit} style={styles.commentBox}>
      <textarea
        {...register("content", {
          required: "Comment cannot be empty.",
        })}
        placeholder={hasAuthToken ? "Write a comment..." : "Login to comment"}
        style={styles.textarea}
        disabled={!hasAuthToken || isSubmitting}
        rows={3}
      />

      {errors.content && <p style={styles.error}>{errors.content.message}</p>}

      <button
        type="submit"
        disabled={!hasAuthToken || isSubmitting}
        style={styles.submitButton}
      >
        {isSubmitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}

export default function HomePage() {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(
    null,
  );

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API}/posts/${postId}`, {
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setActiveCommentPostId(null);
    },
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PostsResponse, Error>({
      queryKey: ["posts"],

      queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
        const cursor = typeof pageParam === "string" ? pageParam : "";
        const url = cursor ? `${API}/posts?cursor=${cursor}` : `${API}/posts`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }

        return res.json();
      },

      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: "",
    });

  const posts: Post[] = data?.pages.flatMap((page) => page.posts) ?? [];

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to like post");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  const toggleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return (
    <div style={styles.page}>
      <div style={styles.feed}>
        <h1>Latest Posts</h1>

        {isLoading && <p style={{ textAlign: "center" }}>Loading posts...</p>}

        {posts.map((post) => (
          <div key={post.id} style={styles.card}>
            <Link
              href={`/posts/${post.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div>
                <p>@{post.user.username}</p>
                <p>{post.content}</p>
              </div>
            </Link>

            <div style={styles.row}>
              <span>💬 {post._count.comments}</span>

              <div style={styles.actions}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCommentPostId((prev) =>
                      prev === post.id ? null : post.id,
                    );
                  }}
                  style={styles.actionButton}
                >
                  Comment
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLike(post.id);
                  }}
                  style={{
                    ...styles.actionButton,
                    color: post.likedByMe ? "red" : "gray",
                  }}
                >
                  {post.likedByMe ? "❤️" : "🤍"} {post.likes}
                </button>

                {user?.id === post.user.id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteMutation.mutate(post.id);
                    }}
                    style={{
                      ...styles.actionButton,
                      background: "rgba(239,68,68,0.15)",
                      color: "#fecaca",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {activeCommentPostId === post.id && (
              <PostCommentForm postId={post.id} />
            )}
          </div>
        ))}

        <div ref={loaderRef} />

        {isFetchingNextPage && (
          <p style={{ textAlign: "center" }}>Loading more...</p>
        )}
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
    gap: 12,
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  actionButton: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 8,
    color: "white",
    padding: "8px 12px",
    cursor: "pointer",
  },

  commentBox: {
    marginTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    height: "auto",
    resize: "vertical",
    padding: 10,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "#2c3e72",
    color: "white",
    overflow: "auto",
  },

  submitButton: {
    alignSelf: "flex-start",
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },

  error: {
    color: "#fca5a5",
    margin: 0,
  },
};
