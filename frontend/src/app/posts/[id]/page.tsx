"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

const MAX_CHARS = 500;

type PostForm = {
  content: string;
};

export default function NewPostPage() {
  const router = useRouter();

  const { register, handleSubmit, watch, reset } = useForm<PostForm>({
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const createPostMutation = useMutation({
    mutationFn: async (data: PostForm) => {
      return apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    onSuccess: () => {
      reset();
      router.push("/");
    },

    onError: (error: any) => {
      alert(error?.message || "Failed to create post");
    },
  });

  const onSubmit = (data: PostForm) => {
    if (!data.content.trim()) {
      alert("Post cannot be empty");
      return;
    }

    if (data.content.length > MAX_CHARS) {
      alert(`Max ${MAX_CHARS} characters`);
      return;
    }

    createPostMutation.mutate(data);
  };

  const content = watch("content") || "";

  const remaining = MAX_CHARS - content.length;
  const overLimit = remaining < 0;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Post</h1>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={{ position: "relative" }}>
            <textarea
              placeholder="What's on your mind?"
              {...register("content")}
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
            disabled={
              createPostMutation.isPending || overLimit || !content.trim()
            }
            style={{
              ...styles.button,
              opacity:
                createPostMutation.isPending || overLimit || !content.trim()
                  ? 0.6
                  : 1,
            }}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
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

  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

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
