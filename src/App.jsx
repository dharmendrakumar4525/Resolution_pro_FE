import { useContext } from "react";
import { Box } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";
import TabPanel from "./components/TabPanel";
import { TabProvider } from "./context/TabContext";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { DetailedViewProvider } from "./context/DetailedViewContext";
import UserMenu from "./components/UserMenu";
import { ThemeProvider, createTheme } from "@mui/material";
import LoginPage from "./pages/Login";
import Typography from '@mui/material/Typography';

import OtpPage from "./pages/OtpPage";
import "./index.css";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';




const theme = createTheme({
  palette: {
    primary: {
      main: "#2e3650",
    },
    secondary: {
      main: "#009688",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ffa726",
    },
    info: {
      main: "#1976d2",
    },
    success: {
      main: "#388e3c",
    },
    background: {
      default: "#2e3650",
    },
    text: {
      primary: "#333",
    },
    button: {
      primary: "#2e3650",
      secondary: "red",
    },
  },
});

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { isVerified } = useContext(AuthContext);

  return (
   
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
  {isVerified ? (
    <>
            <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "70px",
            padding: "0 20px",
            backgroundColor: "#262B3F", 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            zIndex: 10, // Ensure it is on top
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <h4 style={{ color: "#ffffff", fontWeight: "bold", margin: 0 }}>
              Resolution Pro
            </h4>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <UserMenu />
          </Box>
        </Box>


          <Box sx={{ flexGrow: 1 }}>
            <AppRoutes />
          </Box>

          <Box
          className="mt-3 "
            component="footer"
            sx={{
              backgroundColor: "#fff",
              color: "#000",
              padding: "20px 20px",
              textAlign: "right",
            }}
          >
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              © {new Date().getFullYear()} Resolution Pro. All rights reserved.
            </Typography>
            {/* <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <a href="/privacy-policy" style={{ color: "#ffffff", textDecoration: "none" }}>
                Privacy Policy
              </a>
              <a href="/terms-of-service" style={{ color: "#ffffff", textDecoration: "none" }}>
                Terms of Service
              </a>
            </Box> */}
          </Box>

        </>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <LoginPage/>
        </Box>
      )}
    </Box>
  );
};

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <DetailedViewProvider>
            <TabProvider>
              <AppContent />
            </TabProvider>
          </DetailedViewProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
