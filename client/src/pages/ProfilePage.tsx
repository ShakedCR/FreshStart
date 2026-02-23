import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Avatar,
  Button, TextField, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, getUserPosts, likePost, unlikePost, getComments, addComment, deleteComment } from "../services/post.service";
import { QuittingCounter } from "../components/QuittingCounter";

const API_URL = import.meta.env.VITE_API_URL;

type Profile = {
  _id: string;
  username: string;
  email?: string;
  profileImage: string;
  postsCount: number;
  createdAt: string;
};

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

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  authorId: {
    _id: string;
    username: string;
  };
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [profileData, postsData] = await Promise.all([
          getProfile(username!),
          getUserPosts(username!)
        ]);
        setProfile(profileData);
        setPosts(postsData);
        setNewUsername(profileData.username);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [username]);

  async function handleUpdateProfile() {
    setError("");
    try {
      const updated = await updateProfile(
        newUsername !== profile?.username ? newUsername : undefined,
        newImage || undefined
      );
      setProfile(prev => prev ? { ...prev, username: updated.username, profileImage: updated.profileImage } : prev);

      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (token && refreshToken) {
        login({ ...user!, username: updated.username, profileImage: updated.profileImage }, token, refreshToken);
      }

      setEditing(false);
      setNewImage(null);
      if (updated.username !== username) {
        navigate(`/profile/${updated.username}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleLike(postId: string, isLiked: boolean) {
    try {
      if (isLiked) {
        await unlikePost(postId);
        setLikedPosts(prev => { const next = new Set(prev); next.delete(postId); return next; });
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: p.likesCount - 1 } : p));
      } else {
        await likePost(postId);
        setLikedPosts(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleOpenComments(postId: string) {
    try {
      const data = await getComments(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
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
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    try {
      await deleteComment(commentId);
      setComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c._id !== commentId) }));
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "rgba(0,0,0,0.8)" }}>
      <CircularProgress sx={{ color: "#a8e063" }} />
    </Box>
  );

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

          <Card sx={{ mb: 3, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 3 }}>
              <Avatar
                src={profile?.profileImage ? `${API_URL}${profile.profileImage}` : undefined}
                sx={{ width: 90, height: 90, bgcolor: "#56ab2f", fontSize: 36, mb: 2 }}
              >
                {profile?.username?.[0]?.toUpperCase()}
              </Avatar>

              {editing ? (
                <Box sx={{ width: "100%", maxWidth: 300 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } },
                      "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" }
                    }}
                  />
                  {profile?.email && (
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile.email}
                      disabled
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": { color: "rgba(255,255,255,0.4)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } },
                        "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" }
                      }}
                    />
                  )}
                  <Button variant="outlined" component="label" fullWidth sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)", mb: 2 }}>
                    {newImage ? newImage.name : "Change Profile Image"}
                    <input type="file" hidden accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
                  </Button>
                  {error && <Typography color="error" variant="body2" mb={1}>{error}</Typography>}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button fullWidth variant="contained" onClick={handleUpdateProfile}
                      sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)" }}>
                      Save
                    </Button>
                    <Button fullWidth variant="outlined" onClick={() => { setEditing(false); setError(""); }}
                      sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h5" color="white" fontWeight="bold">{profile?.username}</Typography>
                    {isOwnProfile && (
                      <IconButton onClick={() => setEditing(true)} sx={{ color: "rgba(255,255,255,0.6)" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {profile?.email && (
                    <Typography variant="body2" color="rgba(255,255,255,0.4)" mt={0.5}>{profile.email}</Typography>
                  )}
                  <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={1}>
                    {profile?.postsCount} posts · Joined {new Date(profile?.createdAt || "").toLocaleDateString()}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {profile && (
            <>
              <QuittingCounter isOwnProfile={isOwnProfile} userId={profile._id} />
              <Typography variant="h6" color="white" mt={3} mb={2}>
                Posts
              </Typography>
            </>
          )}

          {posts.map(post => (
            <Card key={post._id} sx={{ mb: 2, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3 }}>
              <CardContent>
                <Typography color="rgba(255,255,255,0.9)" mb={1}>{post.text}</Typography>
                {post.imagePath && (
                  <Box component="img"
                    src={`${API_URL}${post.imagePath}`}
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
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">{post.likesCount}</Typography>

                  <IconButton onClick={() => handleOpenComments(post._id)} sx={{ color: "rgba(255,255,255,0.5)" }}>
                    <ChatBubbleOutlineIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">{post.commentsCount}</Typography>

                  <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ ml: "auto" }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {profile && posts.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="rgba(255,255,255,0.5)">No posts yet</Typography>
            </Box>
          )}

        </Box>
      </Box>

      <Dialog
        open={!!commentsPostId}
        onClose={() => setCommentsPostId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3 }
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
            <Typography color="rgba(255,255,255,0.4)" textAlign="center">No comments yet</Typography>
          )}
          {commentsPostId && (comments[commentsPostId] || []).map(comment => (
            <Box key={comment._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#56ab2f", fontSize: 12 }}>
                  {comment.authorId?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="white" fontWeight="bold">{comment.authorId?.username}</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">{comment.text}</Typography>
                </Box>
              </Box>
              {user?.username === comment.authorId?.username && (
                <IconButton onClick={() => handleDeleteComment(commentsPostId, comment._id)} sx={{ color: "rgba(255,255,255,0.4)", p: 0.5 }}>
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
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
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