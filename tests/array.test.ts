import { dropRight, fromOption, match as matchA } from "fp-ts/Array";
import { identity, pipe } from "fp-ts/function";
import { fromNullable, match as matchO, none } from "fp-ts/Option";
import { generateArray } from "../src/libs";

test("generateArray empty list with string[]", () => {
  const testData = null;
  const expected: string[] = [];
  expect(expected).toEqual(generateArray(testData));
});

test("generateArray empty list with number[]", () => {
  const testData = null;
  const expected: number[] = [];
  expect(expected).toEqual(generateArray(testData));
});

test("generateArray non empty list with string[]", () => {
  const testData = ["a"];
  const expected: string[] = ["a"];
  expect(expected).toEqual(generateArray(testData));
});

test("generateArray non empty list with number[]", () => {
  const testData = [0];
  const expected: number[] = [0];
  expect(expected).toEqual(generateArray(testData));
});

test("dropRight non empty list", () => {
  const testData: string[] = ["a", "b", "c"];
  const expected: string[] = ["a", "b"];
  expect(expected).toEqual(dropRight(1)(testData));
});

test("dropRight empty list", () => {
  const testData: string[] = [];
  const expected: string[] = [];
  expect(expected).toEqual(dropRight(1)(testData));
});

test("match with option some", () => {
  const expected: string[] = ["a", "b"];
  const testData: string[] = ["a", "b", "c"];
  const list1 = pipe(
    fromNullable(testData),
    matchO(() => pipe(none, fromOption), identity)
  );
  const actual = matchA(
    () => pipe(none, fromOption),
    (xs) => {
      return dropRight(1)(xs);
    }
  )(list1);
  expect(expected).toEqual(actual);
});
