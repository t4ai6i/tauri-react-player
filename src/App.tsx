import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { homeDir } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { invoke } from "@tauri-apps/api";
import "./App.css";
import { always, equals, ifElse } from "ramda";

interface Entry {
  type: "dir" | "file";
  name: string;
  path: string;
}

type Entries = Entry[];

const App: React.FC = () => {
  const [src, setSrc] = useState<string | null>(null);
  const [dir, setDir] = useState<string | null>(null);
  const [prevDir, setPrevDir] = useState<string | null>(null);
  const [player, setPlayer] = useState<JSX.Element | null>(null);
  const [entries, setEntries] = useState<Entries | null>(null);

  useEffect(() => {
    void (async () => {
      const home = await homeDir();
      setDir(home);
    })();
  }, []);

  useEffect(() => {
    void (() => {
      if (src == null) {
        return;
      }
      const url = convertFileSrc(src);
      const player = <ReactPlayer url={url} controls={true} />;
      setPlayer(player);
    })();
  }, [src]);

  useEffect(() => {
    void (async () => {
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
                  setDir((prev) => {
                    setPrevDir(prev);
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
    <>
      <h1>React Player</h1>
      {player}
      <br />
      src: {src ?? "(not selected)"}
      <br />
      dir: {dir ?? ""}
      <br />
      prevDir: {prevDir ?? ""}
      <br />
      {entryList}
    </>
  );
};

export default App;
