export interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

export interface BookingFormErrors {
  title?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
}

export const validateBookingFormState = (
  form: BookingFormState,
): BookingFormErrors => {
  const errors: BookingFormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Title is required";
  } else if (form.title.trim().length < 2) {
    errors.title = "Title must be at least 2 characters";
  }

  if (!form.startsAt) {
    errors.startsAt = "Start time is required";
  }

  if (!form.endsAt) {
    errors.endsAt = "End time is required";
  }

  const startsAt = new Date(form.startsAt);
  const endsAt = new Date(form.endsAt);

  if (form.startsAt && Number.isNaN(startsAt.getTime())) {
    errors.startsAt = "Start time must be a valid date";
  }

  if (form.endsAt && Number.isNaN(endsAt.getTime())) {
    errors.endsAt = "End time must be a valid date";
  }

  if (
    form.startsAt &&
    form.endsAt &&
    !Number.isNaN(startsAt.getTime()) &&
    !Number.isNaN(endsAt.getTime()) &&
    startsAt >= endsAt
  ) {
    errors.startsAt = "Booking end time must be after the start time";
  }

  return errors;
};
