"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],

      queryFn: async ({ pageParam = 1 }) => {
        const res = await fetch(`${API}/posts?page=${pageParam}`);

        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }

        return res.json();
      },

      initialPageParam: 1,

      getNextPageParam: (lastPage, pages) => {
        return lastPage.hasMore ? pages.length + 1 : undefined;
      },
    });

  const posts: Post[] = data?.pages.flatMap((page) => page.posts) ?? [];

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token = localStorage.getItem("token");

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
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={styles.card}>
              <p>@{post.user.username}</p>

              <p>{post.content}</p>

              <div style={styles.row}>
                <span>💬 {post._count.comments}</span>

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
  },
};
