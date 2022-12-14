import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { homeDir, sep } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";
import { fromNullable, match as matchO } from "fp-ts/es6/Option";
import { append, dropRight, last, map, match as matchA } from "fp-ts/es6/Array";
import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { generateArray } from "../libs/array";
import { normalize } from "../libs/string";

interface Props {
  setSrc: Dispatch<SetStateAction<string | null>>;
  setName: Dispatch<SetStateAction<string | null>>;
}

const FileExplorer: React.FC<Props> = ({ setSrc, setName }) => {
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entries | null>(null);
  const [dirHist, setDirHist] = useState<string[] | null>(null);

  useEffect(() => {
    void (async () => {
      const home = await homeDir();
      const dir = normalize(sep, home);
      setCurrentDir(dir);
    })();
  }, []);

  useEffect(() => {
    void (() =>
      matchO(
        () => {
          // do nothing
        },
        async (currentDir: string) => {
          try {
            const entries = await invoke<Entries>("get_entries", {
              path: currentDir,
              sortOrder: { type: "asc" },
            });
            setEntries(entries);
          } catch (e) {
            console.error(e);
          }
        }
      )(fromNullable(currentDir)))();
  }, [currentDir]);

  const backDirOnClickHandler: React.MouseEventHandler<SVGSVGElement> = (
    _event
  ) => {
    matchA(
      () => {
        // do nothing
      },
      (dirs: string[]) => {
        matchO(
          () => {
            // do nothing
          },
          (lastDir: string) => {
            setCurrentDir(lastDir);
          }
        )(last(dirs));
        setDirHist(dropRight(1)(dirs));
      }
    )(generateArray(dirHist));
  };

  const dirOnClickHandler: React.MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    const path = event.currentTarget.getAttribute("data-item");
    setCurrentDir((prevDir) => {
      matchO(
        () => {
          // do nothing
        },
        (dir: string) =>
          setDirHist((prevHist) => append(dir)(generateArray(prevHist)))
      )(fromNullable(prevDir));
      return path;
    });
  };

  const videoOnClickHandler: React.MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    const path = event.currentTarget.getAttribute("data-item");
    setSrc(path);
    const name = event.currentTarget.getAttribute("data-item2");
    setName(name);
  };

  return (
    <>
      <List component="nav">
        <ListSubheader>
          <Stack direction="row" alignItems="center">
            {matchA(
              () => (
                <>
                  <HomeIcon sx={{ mr: 1 }} />
                  {currentDir}
                </>
              ),
              () => (
                <>
                  <ArrowBackIcon
                    sx={{ mr: 1 }}
                    onClick={backDirOnClickHandler}
                  />
                  {currentDir}
                </>
              )
            )(generateArray(dirHist))}
          </Stack>
        </ListSubheader>
        <Divider />
        {matchO(
          () => <>No resources</>,
          (entries: Entries) => (
            <>
              {map((entry: Entry) =>
                entry.type === "dir" ? (
                  <ListItem key={entry.path} disablePadding>
                    <ListItemButton
                      onClick={dirOnClickHandler}
                      data-item={entry.path}
                    >
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={entry.name} />
                    </ListItemButton>
                  </ListItem>
                ) : (
                  <ListItem key={entry.path} disablePadding>
                    <ListItemButton
                      onClick={videoOnClickHandler}
                      data-item={entry.path}
                      data-item2={entry.name}
                    >
                      <ListItemIcon>
                        <VideoFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={entry.name} />
                    </ListItemButton>
                  </ListItem>
                )
              )(entries)}
            </>
          )
        )(fromNullable(entries))}
      </List>
    </>
  );
};

export default FileExplorer;
