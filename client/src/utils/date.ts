export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString();
};

/**
 * Formats an ISO-like date string into a short month and year label.
 *
 * @example
 * formatDateMonthAndYear("2026-01-18T00:00:00.000Z"); // "Jan 2026"
 */
export const formatDateMonthAndYear = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not set";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export const formatDateInput = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateTimeInput = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
};
