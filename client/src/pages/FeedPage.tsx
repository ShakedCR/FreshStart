import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";
import {
  getFeed,
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  getComments,
  addComment,
  deleteComment
} from "../services/post.service";

type Post = {
  _id: string;
  text: string;
  imagePath: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  liked?: boolean;
  authorId: {
    _id: string;
    username: string;
    profileImage: string;
  };
};

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  authorId: {
    _id: string;
    username: string;
    profileImage?: string;
  };
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  async function loadFeed(cursor?: string) {
    setLoading(true);
    try {
      const data = await getFeed(cursor);
      if (cursor) {
        setPosts((prev) => [...prev, ...data.posts]);
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
      setPosts((prev) => [post, ...prev]);
      setText("");
      setImage(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEdit(id: string) {
    try {
      const updated = await editPost(id, editText, removeImage ? null : editImage || undefined);
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, text: updated.text, imagePath: updated.imagePath } : p))
      );
      setEditingId(null);
      setEditText("");
      setEditImage(null);
      setRemoveImage(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLike(postId: string, isLiked: boolean) {
    try {
      if (isLiked) {
        await unlikePost(postId);
        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likesCount: p.likesCount - 1 } : p)));
      } else {
        await likePost(postId);
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likesCount: p.likesCount + 1 } : p)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleOpenComments(postId: string) {
    try {
      const data = await getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: data }));
      setCommentsPostId(postId);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddComment(postId: string) {
    if (!commentText.trim()) return;
    try {
      const comment = await addComment(postId, commentText);
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)));
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    try {
      await deleteComment(commentId);
      setComments((prev) => ({ ...prev, [postId]: prev[postId].filter((c) => c._id !== commentId) }));
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p)));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <Box sx={{ background: "rgba(0,0,0,0.6)", minHeight: "100vh", py: 4 }}>
        <Box sx={{ maxWidth: 600, mx: "auto", px: 2 }}>
          <Card
            sx={{
              mb: 3,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 3
            }}
          >
            <CardContent>
              <Typography variant="h6" color="white" mb={2}>
                Share your progress 🌱
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="How are you feeling today?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" }
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

          {posts.map((post) => (
            <Card
              key={post._id}
              sx={{
                mb: 2,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={post.authorId?.profileImage ? `http://localhost:3000${post.authorId.profileImage}` : undefined}
                      onClick={() => navigate(`/profile/${post.authorId?.username}`)}
                      sx={{ width: 36, height: 36, bgcolor: "#56ab2f", cursor: "pointer" }}
                    >
                      {post.authorId?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography
                      color="white"
                      fontWeight="bold"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${post.authorId?.username}`)}
                    >
                      {post.authorId?.username}
                    </Typography>
                  </Box>
                  {user?.username === post.authorId?.username && (
                    <Box>
                      <IconButton
                        onClick={() => {
                          setEditingId(post._id);
                          setEditText(post.text);
                          setEditImage(null);
                          setRemoveImage(false);
                        }}
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
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
                          "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }
                        }
                      }}
                    />
                    {post.imagePath && !removeImage && (
                      <Box sx={{ mb: 1 }}>
                        <Box
                          component="img"
                          src={`http://localhost:3000${post.imagePath}`}
                          sx={{ width: "100%", borderRadius: 2, mb: 1 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setRemoveImage(true)}
                          sx={{ color: "#e57373", borderColor: "#e57373" }}
                        >
                          Remove Image
                        </Button>
                      </Box>
                    )}
                    {!post.imagePath || removeImage ? (
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)", mb: 1 }}
                      >
                        {editImage ? editImage.name : "Add Image"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            setEditImage(e.target.files?.[0] || null);
                            setRemoveImage(false);
                          }}
                        />
                      </Button>
                    ) : null}
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEdit(post._id)}
                        sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)" }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setEditingId(null);
                          setEditImage(null);
                          setRemoveImage(false);
                        }}
                        sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="rgba(255,255,255,0.9)" mb={1}>
                    {post.text}
                  </Typography>
                )}

                {post.imagePath && editingId !== post._id && (
                  <Box
                    component="img"
                    src={`http://localhost:3000${post.imagePath}`}
                    sx={{ width: "100%", borderRadius: 2, mt: 1 }}
                  />
                )}

                <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
                  <IconButton
                    onClick={() => handleLike(post._id, likedPosts.has(post._id))}
                    sx={{ color: likedPosts.has(post._id) ? "#e57373" : "rgba(255,255,255,0.5)" }}
                  >
                    {likedPosts.has(post._id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">
                    {post.likesCount}
                  </Typography>

                  <IconButton onClick={() => handleOpenComments(post._id)} sx={{ color: "rgba(255,255,255,0.5)" }}>
                    <ChatBubbleOutlineIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">
                    {post.commentsCount}
                  </Typography>

                  <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ ml: "auto" }}>
                    {formatDateTime(post.createdAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box ref={loaderRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            {loading && <CircularProgress sx={{ color: "#a8e063" }} />}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={!!commentsPostId}
        onClose={() => setCommentsPostId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(20,20,20,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
          Comments
          <IconButton onClick={() => setCommentsPostId(null)} sx={{ color: "rgba(255,255,255,0.6)" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {commentsPostId && (comments[commentsPostId] || []).length === 0 && (
            <Typography color="rgba(255,255,255,0.4)" textAlign="center">
              No comments yet
            </Typography>
          )}
          {commentsPostId &&
            (comments[commentsPostId] || []).map((comment) => (
              <Box key={comment._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#56ab2f", fontSize: 12 }}>
                    {comment.authorId?.username?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="white" fontWeight="bold">
                      {comment.authorId?.username}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                      {formatDateTime(comment.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      {comment.text}
                    </Typography>
                  </Box>
                </Box>
                {user?.username === comment.authorId?.username && (
                  <IconButton
                    onClick={() => handleDeleteComment(commentsPostId!, comment._id)}
                    sx={{ color: "rgba(255,255,255,0.4)", p: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => commentsPostId && handleAddComment(commentsPostId)}
            sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)", whiteSpace: "nowrap" }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}