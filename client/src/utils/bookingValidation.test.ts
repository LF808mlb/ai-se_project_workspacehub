import { describe, expect, it } from "vitest";
import {
  validateBookingFormState,
  type BookingFormState,
} from "./bookingValidation";

const buildFormState = (
  overrides: Partial<BookingFormState> = {},
): BookingFormState => ({
  title: "Valid title",
  description: "Valid description",
  startsAt: "2026-07-30T10:00",
  endsAt: "2026-07-30T11:00",
  ...overrides,
});

describe("validateBookingFormState", () => {
  it("returns an error when startsAt is missing", () => {
    const result = validateBookingFormState(
      buildFormState({ startsAt: "" }),
    );

    expect(result.startsAt).toBeTruthy();
  });

  it("returns an error when endsAt is missing", () => {
    const result = validateBookingFormState(buildFormState({ endsAt: "" }));

    expect(result.endsAt).toBeTruthy();
  });

  it("returns an error when title is empty", () => {
    const result = validateBookingFormState(buildFormState({ title: "" }));

    expect(result.title).toBeTruthy();
  });

  it("returns an error when title is shorter than 2 characters", () => {
    const result = validateBookingFormState(buildFormState({ title: "A" }));

    expect(result.title).toBe("Title must be at least 2 characters");
  });

  it("does not return a title error when title has 2 or more characters", () => {
    const result = validateBookingFormState(buildFormState({ title: "AB" }));

    expect(result.title).toBeUndefined();
  });

  it("returns an error when startsAt is not a valid date", () => {
    const result = validateBookingFormState(
      buildFormState({ startsAt: "invalid-date" }),
    );

    expect(result.startsAt).toBe("Start time must be a valid date");
  });

  it("returns an error when endsAt is not a valid date", () => {
    const result = validateBookingFormState(
      buildFormState({ endsAt: "2026-13-45" }),
    );

    expect(result.endsAt).toBe("End time must be a valid date");
  });

  it("returns an error when endsAt occurs before startsAt", () => {
    const result = validateBookingFormState(
      buildFormState({
        startsAt: "2026-07-30T10:00",
        endsAt: "2026-07-30T09:00",
      }),
    );

    expect(result.startsAt).toBe("Booking end time must be after the start time");
  });

  it("returns an error when startsAt equals endsAt", () => {
    const result = validateBookingFormState(
      buildFormState({
        startsAt: "2026-07-30T10:00",
        endsAt: "2026-07-30T10:00",
      }),
    );

    expect(result.startsAt).toBe("Booking end time must be after the start time");
  });

  it("returns an empty error object when the form state is valid", () => {
    const result = validateBookingFormState(buildFormState());

    expect(result).toEqual({});
  });
});
