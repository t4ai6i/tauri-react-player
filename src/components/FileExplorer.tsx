import React, { Dispatch, SetStateAction } from "react";
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
import { Entries, Entry } from "../types";
import { generateArray } from "../libs/array";

interface Props {
  currentDir: string | null;
  entries: Entries | null;
  dirHist: string[] | null;
  setCurrentDir: Dispatch<SetStateAction<string | null>>;
  setDirHist: Dispatch<SetStateAction<string[] | null>>;
  setSrc: Dispatch<SetStateAction<string | null>>;
}

const FileExplorer: React.FC<Props> = ({
  currentDir,
  entries,
  dirHist,
  setCurrentDir,
  setDirHist,
  setSrc,
}) => {
  const backDirOnClickHandler: (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => void = (_event) => {
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

  const dirOnClickHandler: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
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

  const videoOnClickHandler: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    const path = event.currentTarget.getAttribute("data-item");
    console.log(path);
    // TODO: setSrcにビデオファイルのパスをセット
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
