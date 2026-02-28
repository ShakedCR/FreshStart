import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress } from "@mui/material";
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
import PostCard, { type Post } from "../components/PostCard";
import CommentsDialog, { type Comment } from "../components/CommentsDialog";

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

  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");

  const loaderRef = useRef<HTMLDivElement | null>(null);

  async function loadFeed(cursor?: string) {
    setLoading(true);
    try {
      const data = await getFeed(cursor);
      if (cursor) setPosts((prev) => [...prev, ...data.posts]);
      else setPosts(data.posts);
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

  async function handleDeletePost(id: string) {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveEdit(postId: string, newText: string, imageArg?: File | null) {
    try {
      const updated = await editPost(postId, newText, imageArg);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, text: updated.text, imagePath: updated.imagePath, isLiked: updated.isLiked } : p))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleLike(postId: string, isLiked: boolean) {
    try {
      if (isLiked) {
        await unlikePost(postId);
        setPosts((prev) => prev.map((p) => 
          p._id === postId ? { ...p, likesCount: p.likesCount - 1, isLiked: false } : p
        ));
      } else {
        await likePost(postId);
        setPosts((prev) => prev.map((p) => 
          p._id === postId ? { ...p, likesCount: p.likesCount + 1, isLiked: true } : p
        ));
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
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    try {
      await deleteComment(commentId);
      setComments((prev) => ({ ...prev, [postId]: prev[postId].filter((c) => c._id !== commentId) }));
    } catch (err) {
      console.error(err);
    }
  }

  const open = !!commentsPostId;
  const activeComments = commentsPostId ? comments[commentsPostId] || [] : [];

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
            <PostCard
              key={post._id}
              post={post}
              isLiked={post.isLiked || false}
              currentUsername={user?.username}
              onNavigateToProfile={(username) => navigate(`/profile/${username}`)}
              onDelete={handleDeletePost}
              onSaveEdit={handleSaveEdit}
              onToggleLike={handleToggleLike}
              onOpenComments={handleOpenComments}
              formatDateTime={formatDateTime}
            />
          ))}

          <Box ref={loaderRef} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            {loading && <CircularProgress sx={{ color: "#a8e063" }} />}
          </Box>
        </Box>
      </Box>

      <CommentsDialog
        open={open}
        postId={commentsPostId}
        comments={activeComments}
        commentText={commentText}
        onChangeCommentText={setCommentText}
        currentUsername={user?.username}
        onClose={() => setCommentsPostId(null)}
        onSend={handleAddComment}
        onDeleteComment={handleDeleteComment}
        formatDateTime={formatDateTime}
      />
    </Box>
  );
}