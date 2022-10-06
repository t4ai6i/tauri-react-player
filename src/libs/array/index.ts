import { identity, pipe } from "fp-ts/function";
import { none, fromNullable, match as matchO } from "fp-ts/Option";
import { fromOption } from "fp-ts/Array";

const generateArray = <T>(xs: T[] | null): T[] =>
  pipe(
    fromNullable(xs),
    matchO(() => pipe(none, fromOption), identity)
  );

export { generateArray };
