import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { homeDir, sep } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { invoke } from "@tauri-apps/api";
import {
  always,
  dropLast,
  endsWith,
  equals,
  ifElse,
  isNil,
  join,
  prepend,
  split,
} from "ramda";
import { fromNullable, getOrElse } from "fp-ts/Option";
import { Entries } from "./types";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { FileExplorer } from "./components";

const mdTheme = createTheme();

const App: React.FC = () => {
  const [src, setSrc] = useState<string | null>(null);
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const [dirHist, setDirHist] = useState<string[] | null>(null);
  const [player, setPlayer] = useState<JSX.Element | null>(null);
  const [entries, setEntries] = useState<Entries | null>(null);
  const [open, setOpen] = useState<boolean>(true);
  const toggleDrawer: () => void = () => {
    setOpen(!open);
  };

  useEffect(() => {
    void (async () => {
      const home = await homeDir();
      const splitBySep = split(sep)(home);
      const endsWithSep = endsWith([""])(splitBySep);
      const pathComponents = endsWithSep ? dropLast(1)(splitBySep) : splitBySep;
      setCurrentDir(join(sep)(pathComponents));
    })();
  }, []);

  useEffect(() => {
    void (() => {
      if (isNil(src)) {
        return;
      }
      const url = convertFileSrc(src);
      const player = <ReactPlayer url={url} controls={true} />;
      setPlayer(player);
    })();
  }, [src]);

  useEffect(() => {
    void (async () => {
      if (isNil(currentDir)) {
        return;
      }
      try {
        const entries = await invoke<Entries>("get_entries", {
          path: currentDir,
          sortOrder: { type: "asc" },
        });
        setEntries(entries);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [currentDir]);

  const entryList: JSX.Element | null =
    entries != null ? (
      <ul>
        {entries.map((entry): JSX.Element => {
          return ifElse(
            equals("dir"),
            always(
              <li
                key={entry.path}
                onClick={() =>
                  setCurrentDir((prevDir) => {
                    if (!isNil(prevDir)) {
                      setDirHist((prevHist) => {
                        const xs = getOrElse(() => [""])(
                          fromNullable(prevHist)
                        );
                        return prepend(prevDir)(xs);
                      });
                    }
                    return entry.path;
                  })
                }
              >
                {entry.name}
              </li>
            ),
            always(
              <li key={entry.path} onClick={() => setSrc(entry.path)}>
                {entry.name}
              </li>
            )
          )(entry.type);
        })}
      </ul>
    ) : null;

  const drawerWidth = 240;

  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open === true && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
      position: "relative",
      whiteSpace: "nowrap",
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: "border-box",
      ...(open === false && {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up("sm")]: {
          width: theme.spacing(9),
        },
      }),
    },
  }));

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {/* TODO: srcがnullならそれ用のメッセージを、nonNullならそのパスを表示 */}
              {}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <FileExplorer
            currentDir={currentDir}
            entries={entries}
            dirHist={dirHist}
            setCurrentDir={setCurrentDir}
            setDirHist={setDirHist}
            setSrc={setSrc}
          />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
              }}
            >
              {/* TODO: ビデオファイルの再生 */}
              {/* // https://github.com/anotherhollow1125/TauriReactPlayer/blob/main/src/MainContent.tsx */}
              {"video player area"}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
