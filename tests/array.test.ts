import { dropRight, fromOption, match as matchA } from "fp-ts/Array";
import { identity, pipe } from "fp-ts/function";
import { fromNullable, match as matchO, none } from "fp-ts/Option";
import { generateArray } from "../src/libs/array";

test("generateArray empty list with string[]", () => {
  const testData = null;
  const expected: string[] = [];
  const actual = generateArray(testData);
  expect(actual).toEqual(expected);
});

test("generateArray empty list with number[]", () => {
  const testData = null;
  const expected: number[] = [];
  const actual = generateArray(testData);
  expect(actual).toEqual(expected);
});

test("generateArray non empty list with string[]", () => {
  const testData = ["a"];
  const expected: string[] = ["a"];
  const actual = generateArray(testData);
  expect(actual).toEqual(expected);
});

test("generateArray non empty list with number[]", () => {
  const testData = [0];
  const expected: number[] = [0];
  const actual = generateArray(testData);
  expect(actual).toEqual(expected);
});

test("dropRight non empty list", () => {
  const testData: string[] = ["a", "b", "c"];
  const expected: string[] = ["a", "b"];
  const actual = dropRight(1)(testData);
  expect(actual).toEqual(expected);
});

test("dropRight empty list", () => {
  const testData: string[] = [];
  const expected: string[] = [];
  const actual = dropRight(1)(testData);
  expect(actual).toEqual(expected);
});

test("match with option some", () => {
  const testData = pipe(
    fromNullable(["a", "b", "c"]),
    matchO(() => pipe(none, fromOption), identity)
  );
  const expected: string[] = ["a", "b"];
  const actual = matchA(
    () => pipe(none, fromOption),
    (xs) => {
      return dropRight(1)(xs);
    }
  )(testData);
  expect(actual).toEqual(expected);
});
