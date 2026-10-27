import { expect, test } from "vitest";
import { readLowStockThresholdFormData } from "./readLowStockThresholdFormData";

test.each(["0", "5", "2147483647", " 0 ", " 5 "])(
  "accepts threshold %j and preserves its original text",
  (threshold) => {
    const formData = new FormData();
    formData.set("threshold", threshold);

    expect(readLowStockThresholdFormData(formData)).toEqual({
      values: { threshold },
      fieldErrors: {},
      message: "",
    });
  },
);

test.each(["", "   ", "-1", "1.5", "1e3", "01", "abc"])(
  "rejects invalid threshold syntax %j",
  (threshold) => {
    const formData = new FormData();
    formData.set("threshold", threshold);

    expect(readLowStockThresholdFormData(formData)).toEqual({
      values: { threshold },
      fieldErrors: {
        threshold: "Enter zero or a positive whole number.",
      },
      message: "Please correct the highlighted field.",
    });
  },
);

test.each(["2147483648", "9007199254740992"])(
  "rejects an out-of-range threshold %j",
  (threshold) => {
    const formData = new FormData();
    formData.set("threshold", threshold);

    const result = readLowStockThresholdFormData(formData);

    expect(result.values.threshold).toBe(threshold);
    expect(result.fieldErrors.threshold).toBe(
      "Threshold must not exceed 2147483647.",
    );
  },
);

test("rejects a missing threshold", () => {
  expect(readLowStockThresholdFormData(new FormData())).toEqual({
    values: { threshold: "" },
    fieldErrors: {
      threshold: "Threshold must be provided as text.",
    },
    message: "Please correct the highlighted field.",
  });
});

test("rejects a file instead of threshold text", () => {
  const formData = new FormData();
  formData.set("threshold", new File(["5"], "threshold.txt"));

  expect(readLowStockThresholdFormData(formData)).toEqual({
    values: { threshold: "" },
    fieldErrors: {
      threshold: "Threshold must be provided as text.",
    },
    message: "Please correct the highlighted field.",
  });
});