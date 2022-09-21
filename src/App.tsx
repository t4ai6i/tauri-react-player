import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { homeDir } from "@tauri-apps/api/path";
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
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  const [src, setSrc] = useState<string | null>(null);
  const [dir, setDir] = useState<string | null>(null);
  const [dirHist, setDirHist] = useState<string[] | null>(null);
  const [player, setPlayer] = useState<JSX.Element | null>(null);
  const [entries, setEntries] = useState<Entries | null>(null);

  useEffect(() => {
    void (async () => {
      const home = await homeDir();
      const splitBySlash = split("/")(home);
      const endsWithSlash = endsWith([""])(splitBySlash);
      const pathComponents = endsWithSlash
        ? dropLast(1)(splitBySlash)
        : splitBySlash;
      setDir(join("/")(pathComponents));
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
      if (isNil(dir)) {
        return;
      }
      try {
        const entries = await invoke<Entries>("get_entries", {
          path: dir,
          sortOrder: { type: "asc" },
        });
        setEntries(entries);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [dir]);

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
                  setDir((prevDir) => {
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

  return (
    <Box>
      <Navbar dir={dir} />
      {player}
      <br />
      src: {src ?? "(not selected)"}
      <br />
      prevDir: {dirHist ?? ""}
      <br />
      {entryList}
    </Box>
  );
};

export default App;
