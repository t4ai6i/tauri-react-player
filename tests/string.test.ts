import { normalize } from "../src/libs/string";

test("endsWith /", () => {
  const testData = "/path/to/";
  const actual = normalize("/", testData);
  expect("/path/to").toBe(actual);
});

test("endsWith non /", () => {
  const testData = "/path/to";
  const actual = normalize("/", testData);
  expect("/path/to").toBe(actual);
});
