declare interface Entry {
  type: "dir" | "file";
  name: string;
  path: string;
}

declare type Entries = Entry[];
