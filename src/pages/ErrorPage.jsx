import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        p: 3,
      }}
    >
      <Typography variant="h2" color="error" sx={{ mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary">
        Go to Home
      </Button>
    </Box>
  );
};

export default ErrorPage;
