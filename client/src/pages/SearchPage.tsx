import { useState } from "react";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import { searchPosts } from "../services/post.service";
import PostCard, { type Post } from "../components/PostCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export default function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await searchPosts(query);
      setResults(data);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || "Search failed");
    }
    setLoading(false);
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <Box sx={{ background: "rgba(0,0,0,0.6)", minHeight: "100vh", py: 4 }}>
        <Box sx={{ maxWidth: 600, mx: "auto", px: 2 }}>

          <Typography variant="h5" color="white" mb={3} fontWeight="bold">
            🔍 AI Search
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search posts... e.g. 'struggling with cravings'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)", whiteSpace: "nowrap" }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Search"}
            </Button>
          </Box>

          {error && (
            <Typography color="error" mb={2}>{error}</Typography>
          )}

          {searched && results.length === 0 && !loading && (
            <Typography color="rgba(255,255,255,0.5)" textAlign="center">
              No relevant posts found
            </Typography>
          )}

          {results.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isLiked={false}
              currentUsername={user?.username}
              onNavigateToProfile={(username) => navigate(`/profile/${username}`)}
              onDelete={() => {}}
              onSaveEdit={() => {}}
              onToggleLike={() => {}}
              onOpenComments={() => {}}
              formatDateTime={formatDateTime}
            />
          ))}

        </Box>
      </Box>
    </Box>
  );
}