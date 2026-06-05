"use client";

type Props = {
  message?: string;
};

export default function LoadingState({ message = "Loading..." }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        color: "#666",
      }}
    >
      <p>{message}</p>
    </div>
  );
}
