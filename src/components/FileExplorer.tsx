import React, { Dispatch, SetStateAction } from "react";
import { always, equals, ifElse, isNil, map, prepend } from "ramda";
import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import { Entries, Entry } from "../types";

interface Props {
  currentDir: string | null;
  entries: Entries | null;
  setCurrentDir: Dispatch<SetStateAction<string | null>>;
  setDirHist: Dispatch<SetStateAction<string[] | null>>;
}

const FileExplorer: React.FC<Props> = ({
  currentDir,
  entries,
  setCurrentDir,
  setDirHist,
}) => {
  const dirOnClickHandler: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    const path = event.currentTarget.getAttribute("data-item");
    console.log(path);
    setCurrentDir((prevDir) => {
      if (!isNil(prevDir)) {
        setDirHist((prevHist) => {
          if (!isNil(prevHist)) {
            return prepend(prevDir)(prevHist);
          } else {
            return prevHist;
          }
        });
        return path;
      } else {
        return prevDir;
      }
    });
  };

  const videoOnClickHandler: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    const path = event.currentTarget.getAttribute("data-item");
    console.log(path);
  };

  return (
    <>
      <List component="nav">
        <ListSubheader>{currentDir}</ListSubheader>
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
