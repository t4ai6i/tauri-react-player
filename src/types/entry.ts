export interface Entry {
  type: "dir" | "file";
  name: string;
  path: string;
}

export type Entries = Entry[];
