import React, { Dispatch, SetStateAction } from "react";
import { always, equals, ifElse, isEmpty, isNil, map, prepend } from "ramda";
import { fromNullable, getOrElse } from "fp-ts/Option";
import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Entries, Entry } from "../types";

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
  const dirOnClickHandler: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    const path = event.currentTarget.getAttribute("data-item");
    setCurrentDir((prevDir) => {
      if (!isNil(prevDir)) {
        setDirHist((prevHist) => {
          return prepend(prevDir)(
            getOrElse(() => {
              const ret: string[] = [];
              return ret;
            })(fromNullable(prevHist))
          );
        });
      }
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
            {ifElse(
              isEmpty,
              always(
                <>
                  <HomeIcon sx={{ mr: 1 }} />
                  {currentDir}
                </>
              ),
              always(
                <Button>
                  {/* TODO: dirHistがNonEmptyなら一つ前に戻るイベントを実装する */}
                  <ArrowBackIcon />
                  {currentDir}
                </Button>
              )
            )(
              getOrElse(() => {
                const ret: string[] = [];
                return ret;
              })(fromNullable(dirHist))
            )}
          </Stack>
        </ListSubheader>
        <Divider />
        {!isNil(entries) ? (
          <>
            {map((entry: Entry) => {
              return ifElse(
                equals("dir"),
                always(
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
                ),
                always(
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
              )(entry.type);
            })(entries)}
          </>
        ) : (
          <></>
        )}
      </List>
    </>
  );
};

export default FileExplorer;
