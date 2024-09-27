import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setError(e.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #00bcd4, #3f51b5)",
        padding: 2,
      }}
    >
      <Paper
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
          borderRadius: 8,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            color: "#3f51b5",
            mb: 3,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Login
        </Typography>
        {error && (
          <Typography
            color="error"
            variant="body2"
            align="center"
            sx={{ mb: 2 }}
          >
            {error}
          </Typography>
        )}
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          noValidate
        >
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              "& .MuiInputLabel-root": { color: "#3f51b5" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#3f51b5" },
                "&:hover fieldset": { borderColor: "#303f9f" },
              },
            }}
            disabled={isLoading} // Disable input while loading
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              "& .MuiInputLabel-root": { color: "#3f51b5" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#3f51b5" },
                "&:hover fieldset": { borderColor: "#303f9f" },
              },
            }}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{
              mt: 3,
              bgcolor: "#3f51b5",
              "&:hover": { bgcolor: "#303f9f" },
            }}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
