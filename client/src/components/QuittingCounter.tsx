import { useState, useEffect } from "react";
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../context/AuthContext";

type QuittingCounterProps = {
  isOwnProfile: boolean;
  userId?: string;
};

export function QuittingCounter({ isOwnProfile, userId }: QuittingCounterProps) {
  const { quittingStats, startQuitting, stopQuitting, updateQuittingDate, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [publicStats, setPublicStats] = useState<any>(null);
  const [displayTime, setDisplayTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [error, setError] = useState("");

  // Get current stats (own or public)
  const stats = isOwnProfile ? quittingStats : publicStats;

  // For viewing other user's stats - clear and refetch when userId changes
  useEffect(() => {
    if (!isOwnProfile && userId) {
      setPublicStats(null); // Clear old stats first
      fetchPublicStats();
    } else if (isOwnProfile) {
      setPublicStats(null); // Clear when viewing own profile
    }
  }, [userId, isOwnProfile]);

  async function fetchPublicStats() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/quitting/${userId}/stats`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched public stats:", data); // Debug log
        setPublicStats(data);
      } else {
        setPublicStats(null);
      }
    } catch (err) {
      console.error("Failed to fetch public quitting stats:", err);
      setPublicStats(null);
    }
  }

  // Timer to update counter every second - calculates on-the-fly
  useEffect(() => {
    if (!stats?.isActive || !stats?.startDate) {
      setDisplayTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateTime = () => {
      const startDate = new Date(stats.startDate);
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setDisplayTime({ days, hours, minutes, seconds });
    };

    // Update immediately
    updateTime();

    // Then update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [stats?.isActive, stats?.startDate]);

  const handleStartQuitting = async () => {
    setLoading(true);
    setError("");
    try {
      await startQuitting();
    } catch (err: any) {
      setError(err.message || "Failed to start");
      console.error("Failed to start quitting:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopQuitting = async () => {
    setLoading(true);
    setError("");
    try {
      await stopQuitting();
    } catch (err: any) {
      setError(err.message || "Failed to stop");
      console.error("Failed to stop quitting:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDate = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError("");
    try {
      await updateQuittingDate(new Date(selectedDate));
      setOpenDateDialog(false);
      setSelectedDate("");
      // Force refresh of stats
      setTimeout(() => {
        if (isOwnProfile && quittingStats) {
          // Stats will update automatically via useEffect
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to update date");
      console.error("Failed to update date:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // If no stats exist and it's own profile, show start option
  if (!stats && isOwnProfile) {
    return (
      <Box
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 3,
          textAlign: "center",
          mb: 3
        }}
      >
        <LocalFireDepartmentIcon sx={{ fontSize: 48, color: "#a8e063", mb: 1 }} />
        <Typography variant="h6" color="white" mb={1}>
          Start Your Smoke-Free Journey
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.6)" mb={2}>
          Track your progress and celebrate your success
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleStartQuitting}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #56ab2f, #a8e063)",
            color: "white",
            fontWeight: "bold",
            px: 3
          }}
        >
          {loading ? "Starting..." : "Start Now"}
        </Button>
        {error && <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>{error}</Typography>}
      </Box>
    );
  }

  // If no stats and viewing other profile, show nothing
  if (!stats) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 3,
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        borderRadius: 3,
        mb: 3
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <LocalFireDepartmentIcon sx={{ fontSize: 32, color: "#a8e063", mr: 1 }} />
        <Typography variant="h6" color="white" sx={{ fontWeight: "bold" }}>
          Days Smoke-Free
        </Typography>
      </Box>

      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "white",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          fontSize: { xs: "2.5rem", sm: "3.5rem" },
          fontFamily: "monospace"
        }}
      >
        {displayTime.days}d {displayTime.hours}h {displayTime.minutes}m {displayTime.seconds}s
      </Typography>

      {stats.isActive && stats.startDate && (
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, color: "rgba(255,255,255,0.8)" }}>
          Started: {new Date(stats.startDate).toLocaleDateString()}
        </Typography>
      )}

      {!stats.isActive && (
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, color: "rgba(255,255,255,0.6)" }}>
          No active attempt
        </Typography>
      )}

      {isOwnProfile && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {!stats.isActive ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleStartQuitting}
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #56ab2f, #a8e063)",
                color: "white",
                fontWeight: "bold"
              }}
            >
              {loading ? "Starting..." : "Start Attempt"}
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={handleStopQuitting}
                disabled={loading}
                sx={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  "&:hover": { background: "rgba(255,255,255,0.25)" }
                }}
              >
                {loading ? "Stopping..." : "Stop Attempt"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setOpenDateDialog(true)}
                disabled={loading}
                sx={{
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "white",
                  "&:hover": { borderColor: "rgba(255,255,255,0.6)" }
                }}
              >
                Edit Date
              </Button>
            </>
          )}
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Date Edit Dialog */}
      <Dialog open={openDateDialog} onClose={() => setOpenDateDialog(false)}>
        <DialogTitle sx={{ color: "white", background: "rgba(20,20,20,0.95)" }}>
          Update Start Date
        </DialogTitle>
        <DialogContent
          sx={{
            minWidth: 400,
            pt: 2,
            background: "rgba(20,20,20,0.95)",
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }
            }
          }}
        >
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            fullWidth
            inputProps={{
              max: new Date().toISOString().split("T")[0]
            }}
          />
        </DialogContent>
        <DialogActions sx={{ background: "rgba(20,20,20,0.95)" }}>
          <Button onClick={() => setOpenDateDialog(false)} sx={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDate}
            disabled={!selectedDate || loading}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)" }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
