import Link from "next/link";

type Props = {
  id: string;
  username: string;
  content: string;
  commentCount?: number;
  createdAt?: string;
};

export default function PostCard({
  id,
  username,
  content,
  commentCount,
  createdAt,
}: Props) {
  return (
    <Link
      href={`/posts/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={styles.card}>
        <div style={styles.userRow}>
          <div style={styles.avatar}>{username[0]?.toUpperCase()}</div>
          <div>
            <p style={styles.username}>@{username}</p>
            {createdAt && (
              <span style={styles.time}>
                {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <p style={styles.content}>{content}</p>
        {commentCount !== undefined && (
          <p style={styles.comments}>💬 {commentCount} comments</p>
        )}
      </div>
    </Link>
  );
}
const styles: any = {
  card: {
    background: "#111827",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid #1f2937",
    cursor: "pointer",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "white",
    fontSize: "14px",
  },
  username: { margin: 0, fontSize: "14px", fontWeight: "bold", color: "white" },
  time: { fontSize: "12px", color: "#64748b" },
  content: {
    fontSize: "14px",
    color: "#e2e8f0",
    margin: "0 0 8px",
    lineHeight: 1.6,
  },
  comments: { fontSize: "12px", color: "#64748b", margin: 0 },
};
