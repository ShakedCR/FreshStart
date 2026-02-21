import { useState, useEffect, useRef } from "react";
import {
  Box, Card, CardContent, Typography, Avatar,
  Button, TextField, IconButton, CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../context/AuthContext";
import { getFeed, createPost, editPost, deletePost } from "../services/post.service";

type Post = {
  _id: string;
  text: string;
  imagePath: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  authorId: {
    _id: string;
    username: string;
    profileImage: string;
  };
};

export default function FeedPage() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  async function loadFeed(cursor?: string) {
    setLoading(true);
    try {
      const data = await getFeed(cursor);
      if (cursor) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && nextCursor && !loading) {
        loadFeed(nextCursor);
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loading]);

  async function handleCreatePost() {
    if (!text.trim()) return;
    try {
      const post = await createPost(text, image || undefined);
      setPosts(prev => [post, ...prev]);
      setText("");
      setImage(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEdit(id: string) {
    try {
      const updated = await editPost(id, editText);
      setPosts(prev => prev.map(p => p._id === id ? { ...p, text: updated.text } : p));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      <Box sx={{ background: "rgba(0,0,0,0.6)", minHeight: "100vh", py: 4 }}>

        <Box sx={{ maxWidth: 600, mx: "auto", px: 2 }}>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" sx={{
              fontFamily: "'Georgia', serif",
              fontWeight: "bold",
              letterSpacing: 3,
              background: "linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 40%, #ffffff 60%, #b0b0b0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              FreshStart
            </Typography>
            <Button variant="outlined" onClick={logout} sx={{ color: "white", borderColor: "white" }}>
              Logout
            </Button>
          </Box>

          <Card sx={{ mb: 3, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" color="white" mb={2}>Share your progress 🌱</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="How are you feeling today?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  }
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Button variant="outlined" component="label" sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                  {image ? image.name : "Add Image"}
                  <input type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreatePost}
                  sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)", fontWeight: "bold" }}
                >
                  Post
                </Button>
              </Box>
            </CardContent>
          </Card>

          {posts.map(post => (
            <Card key={post._id} sx={{ mb: 2, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "#56ab2f" }}>
                      {post.authorId?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography color="white" fontWeight="bold">{post.authorId?.username}</Typography>
                  </Box>
                  {user?.username === post.authorId?.username && (
                    <Box>
                      <IconButton onClick={() => { setEditingId(post._id); setEditText(post.text); }} sx={{ color: "rgba(255,255,255,0.6)" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(post._id)} sx={{ color: "rgba(255,255,255,0.6)" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {editingId === post._id ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                        }
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" variant="contained" onClick={() => handleEdit(post._id)}
                        sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)" }}>
                        Save
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => setEditingId(null)}
                        sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="rgba(255,255,255,0.9)" mb={1}>{post.text}</Typography>
                )}

                {post.imagePath && (
                  <Box component="img"
                    src={`http://localhost:3000${post.imagePath}`}
                    sx={{ width: "100%", borderRadius: 2, mt: 1 }}
                  />
                )}

                <Typography variant="caption" color="rgba(255,255,255,0.4)">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}

          <Box ref={loaderRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            {loading && <CircularProgress sx={{ color: "#a8e063" }} />}
          </Box>

        </Box>
      </Box>
    </Box>
  );
}