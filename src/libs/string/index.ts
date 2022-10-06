import { endsWith, size, slice } from "fp-ts/string";
import { pipe } from "fp-ts/function";

const normalize = (sep: string, s: string): string => {
  const dropLast = (s: string): string => {
    const len = size(s);
    return slice(0, len - 1)(s);
  };
  return pipe(s, endsWith(sep)) ? dropLast(s) : s;
};

export { normalize };
