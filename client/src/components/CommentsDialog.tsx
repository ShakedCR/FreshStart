import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

export type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  authorId: {
    _id: string;
    username: string;
    profileImage?: string;
  };
};

type Props = {
  open: boolean;
  postId: string | null;
  comments: Comment[];
  commentText: string;
  onChangeCommentText: (value: string) => void;
  currentUsername?: string;
  onClose: () => void;
  onSend: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  formatDateTime: (value: string) => string;
};

export default function CommentsDialog({
  open,
  postId,
  comments,
  commentText,
  onChangeCommentText,
  currentUsername,
  onClose,
  onSend,
  onDeleteComment,
  formatDateTime
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
        {comments.length === 0 && (
          <Typography color="rgba(255,255,255,0.4)" textAlign="center">
            No comments yet
          </Typography>
        )}

        {comments.map((comment) => (
          <Box key={comment._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Avatar
                src={comment.authorId?.profileImage ? `http://localhost:3000${comment.authorId.profileImage}` : undefined}
                sx={{ width: 28, height: 28, bgcolor: "#56ab2f", fontSize: 12 }}
              >
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

            {currentUsername && currentUsername === comment.authorId?.username && postId && (
              <IconButton
                onClick={() => onDeleteComment(postId, comment._id)}
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
          onChange={(e) => onChangeCommentText(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }
            }
          }}
        />

        <Button
          variant="contained"
          disabled={!postId}
          onClick={() => postId && onSend(postId)}
          sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)", whiteSpace: "nowrap" }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}