import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from "@mui/material";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <AppBar position="fixed" sx={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", boxShadow: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          onClick={() => navigate("/")}
          sx={{
            fontFamily: "'Georgia', serif",
            fontWeight: "bold",
            letterSpacing: 3,
            cursor: "pointer",
            background: "linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 40%, #ffffff 60%, #b0b0b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          FreshStart
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/")} size="small" sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
            Feed
          </Button>
          <Button variant="outlined" onClick={() => navigate("/search")} size="small" sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
            AI Search
          </Button>
          <Button variant="outlined" onClick={logout} size="small" sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
            Logout
          </Button>
          <Box
            onClick={() => navigate(`/profile/${user.username}`)}
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
          >
            <Avatar
              src={user.profileImage ? `${import.meta.env.VITE_API_URL}${user.profileImage}` : undefined}
              sx={{ width: 32, height: 32, bgcolor: "#56ab2f" }}
            >
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography color="white" variant="body2">{user.username}</Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Box sx={{ pt: 8 }}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <FeedPage /> : <Navigate to="/login" />} />
          <Route path="/profile/:username" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/login" />} />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="256571597475-0gjseanrd5ultr83t1m5c052kunideuh.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}