type Props = {
  icon?: string;
  message: string;
  action?: React.ReactNode;
};

export default function EmptyState({ icon = "📭", message, action }: Props) {
  return (
    <div style={styles.box}>
      <p style={styles.icon}>{icon}</p>
      <p style={styles.message}>{message}</p>
      {action && <div style={{ marginTop: "16px" }}>{action}</div>}
    </div>
  );
}

const styles: any = {
  box: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#111827",
    borderRadius: "12px",
    border: "1px solid #1f2937",
  },
  icon: { fontSize: "48px", margin: "0 0 12px" },
  message: { color: "#94a3b8", margin: 0, fontSize: "15px" },
};
