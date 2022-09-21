import React from "react";
import { AppBar, Stack, styled, Toolbar, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
});

interface Props {
  dir: string | null;
}

const Navbar: React.FC<Props> = ({ dir }) => {
  return (
    <AppBar position="sticky">
      <StyledToolbar>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="flex-start"
        >
          <HomeIcon sx={{ display: { xs: "block", sm: "block" } }} />
          <Typography
            variant="h6"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {dir}
          </Typography>
        </Stack>
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;
