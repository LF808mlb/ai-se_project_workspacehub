export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString();
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
