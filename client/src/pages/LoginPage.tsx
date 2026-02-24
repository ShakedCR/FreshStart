import { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography,
  Divider, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { login as loginService, googleLogin } from "../services/auth.service";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const data = await googleLogin(tokenResponse.access_token);
        login(data.user, data.accessToken, data.refreshToken);
        navigate("/");
      } catch (err: any) {
        setError(err.message);
      }
    },
    onError: () => setError("Google login failed")
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await loginService(username, password);
      login(data.user, data.accessToken, data.refreshToken);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <Box sx={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 4,
        p: 4,
        pb: 6,
        width: 400,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
      }}>
        <Typography
          variant="h3"
          textAlign="center"
          mb={1}
          sx={{
            fontFamily: "'Georgia', serif",
            fontWeight: "bold",
            letterSpacing: 4,
            background: "linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 40%, #ffffff 60%, #b0b0b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}
        >
          FreshStart
        </Typography>
        <Typography variant="body2" textAlign="center" mb={3} color="rgba(255,255,255,0.6)">
          Your journey to a smoke-free life
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
              }
            }}
            InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
              }
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              background: "linear-gradient(135deg, #56ab2f, #a8e063)",
              color: "white",
              fontWeight: "bold",
              borderRadius: 2,
              "&:hover": { background: "linear-gradient(135deg, #a8e063, #56ab2f)" }
            }}
          >
            Login
          </Button>
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>or</Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          sx={{
            borderRadius: 2,
            mb: 2,
            borderColor: "rgba(255,255,255,0.3)",
            color: "white",
            "&:hover": { borderColor: "white", background: "rgba(255,255,255,0.08)" }
          }}
          onClick={() => handleGoogleLogin()}
          startIcon={<img src="https://www.google.com/favicon.ico" width={20} height={20} />}
        >
          Continue with Google
        </Button>

        <Typography textAlign="center" variant="body2" color="rgba(255,255,255,0.6)">
          Don't have an account?{" "}
          <Button variant="text" onClick={() => navigate("/register")} sx={{ color: "#a8e063" }}>
            Sign up
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}