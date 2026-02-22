import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export type Post = {
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

type Props = {
  post: Post;
  isLiked: boolean;
  currentUsername?: string;
  onNavigateToProfile: (username: string) => void;
  onDelete: (postId: string) => void;
  onSaveEdit: (postId: string, text: string, image?: File | null) => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
  formatDateTime: (value: string) => string;
};

export default function PostCard({
  post,
  isLiked,
  currentUsername,
  onNavigateToProfile,
  onDelete,
  onSaveEdit,
  onToggleLike,
  onOpenComments,
  formatDateTime
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  function startEdit() {
    setIsEditing(true);
    setEditText(post.text);
    setEditImage(null);
    setRemoveImage(false);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditImage(null);
    setRemoveImage(false);
    setEditText(post.text);
  }

  async function saveEdit() {
    onSaveEdit(post._id, editText, removeImage ? null : editImage || undefined);
    setIsEditing(false);
  }

  return (
    <Card
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
              onClick={() => onNavigateToProfile(post.authorId?.username)}
              sx={{ width: 36, height: 36, bgcolor: "#56ab2f", cursor: "pointer" }}
            >
              {post.authorId?.username?.[0]?.toUpperCase()}
            </Avatar>

            <Typography
              color="white"
              fontWeight="bold"
              sx={{ cursor: "pointer" }}
              onClick={() => onNavigateToProfile(post.authorId?.username)}
            >
              {post.authorId?.username}
            </Typography>
          </Box>

          {currentUsername && currentUsername === post.authorId?.username && (
            <Box>
              <IconButton onClick={startEdit} sx={{ color: "rgba(255,255,255,0.6)" }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => onDelete(post._id)} sx={{ color: "rgba(255,255,255,0.6)" }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {isEditing ? (
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
                onClick={saveEdit}
                sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)" }}
              >
                Save
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={cancelEdit}
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

        {post.imagePath && !isEditing && (
          <Box
            component="img"
            src={`http://localhost:3000${post.imagePath}`}
            sx={{ width: "100%", borderRadius: 2, mt: 1 }}
          />
        )}

        <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
          <IconButton
            onClick={() => onToggleLike(post._id, isLiked)}
            sx={{ color: isLiked ? "#e57373" : "rgba(255,255,255,0.5)" }}
          >
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>

          <Typography variant="body2" color="rgba(255,255,255,0.6)">
            {post.likesCount}
          </Typography>

          <IconButton onClick={() => onOpenComments(post._id)} sx={{ color: "rgba(255,255,255,0.5)" }}>
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
  );
}