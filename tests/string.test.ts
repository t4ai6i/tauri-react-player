import { normalize } from "../src/libs/string";

test("endsWith /", () => {
  const testData = "/path/to/";
  const expected = "/path/to";
  const actual = normalize("/", testData);
  expect(actual).toBe(expected);
});

test("endsWith non /", () => {
  const testData = "/path/to";
  const expected = "/path/to";
  const actual = normalize("/", testData);
  expect(actual).toBe(expected);
});
