type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: Props) {
  return (
    <div style={styles.box}>
      <p style={styles.icon}>⚠️</p>
      <p style={styles.message}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={styles.retryBtn}>
          Try Again
        </button>
      )}
    </div>
  );
}

const styles: any = {
  box: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#1e1a2e",
    borderRadius: "12px",
    border: "1px solid #7c3aed",
  },
  icon: { fontSize: "40px", margin: "0 0 12px" },
  message: { color: "#e879f9", margin: "0 0 16px", fontSize: "15px" },
  retryBtn: {
    padding: "10px 20px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
