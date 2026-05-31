const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

let posts = [
  {
    id: 1,
    content: "Hello Social Clone 👋",
    user: { username: "admin" },
  },
  {
    id: 2,
    content: "My second post 🚀",
    user: { username: "john" },
  },
];

app.get("/api/posts", (req, res) => {
  res.json({ posts });
});

app.post("/api/posts", (req, res) => {
  const { content, username } = req.body;

  const newPost = {
    id: Date.now(),
    content,
    user: { username },
  };

  posts.unshift(newPost);

  res.json({ post: newPost });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
