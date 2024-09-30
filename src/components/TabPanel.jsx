import React, { useContext } from "react";
import { Tabs, Tab, IconButton } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { TabContext } from "../context/TabContext";
import { styled } from "@mui/material/styles";



const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: "50px",
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(15),
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  margin: "0 4px",
  transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: "none",
  background: "linear-gradient(45deg, #9FCCFA 30%, #3B91F4 90%)",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    borderRadius: "8px 8px 0 0",
  },
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

// Styled CloseIcon button
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  transition: "color 0.3s",
  "&:hover": {
    color: theme.palette.error.main,
  },
}));

// Tabs container styling
const TabsContainer = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const TabPanel = () => {
  const { openTabs, handleTabClose } = useContext(TabContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = (e, path) => {
    e.stopPropagation();
    e.preventDefault();
    handleTabClose(path);

    // Redirect to another tab if the active tab is closed
    if (location.pathname === path) {
      const remainingTabs = openTabs.filter((tab) => tab !== path);
      const nextTab =
        remainingTabs.length > 0
          ? remainingTabs[remainingTabs.length - 1]
          : "/";
      navigate(nextTab, { replace: true });
    }
  };

  // Check if the current path is in openTabs, if not, set a default value
  const currentPath = openTabs.includes(location.pathname)
    ? location.pathname
    : openTabs[0];

  return (
    <TabsContainer
      value={currentPath}
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
    >
      
      {openTabs.map((path, index) => (
        <StyledTab
          key={index}
          label={
            <span style={{ display: "flex", alignItems: "center" }}>
              {path.replace("/", "") || "Home"}
              <StyledIconButton
                size="small"
                onClick={(e) => handleClose(e, path)}
                aria-label={`Close tab ${path}`}
                sx={{ marginLeft: 1 }}
              >
                <CloseIcon fontSize="small" />
              </StyledIconButton>
            </span>
          }
          value={path}
          component={Link}
          to={path}
          aria-label={`Navigate to ${path}`}
        />
      ))}
    </TabsContainer>
  );
};

export default TabPanel;
