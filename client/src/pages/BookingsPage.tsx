import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { useAuth } from "../hooks/useAuth";
import { bookingService } from "../services/bookingService";
import type { Booking } from "../types/models";
import {
  validateBookingFormState,
  type BookingFormState,
} from "../utils/bookingValidation";
import { formatDateTimeInput } from "../utils/date";
import { canDeleteResources, canEditBooking } from "../utils/permissions";

interface BookingTouchedState {
  title: boolean;
  description: boolean;
  startsAt: boolean;
  endsAt: boolean;
}

const bookingFieldNames: Array<keyof BookingFormState> = [
  "title",
  "description",
  "startsAt",
  "endsAt",
];

const createUntouchedState = (): BookingTouchedState => ({
  title: false,
  description: false,
  startsAt: false,
  endsAt: false,
});

const markAllFieldsTouched = (): BookingTouchedState => ({
  ...bookingFieldNames.reduce(
    (state, field) => ({
      ...state,
      [field]: true,
    }),
    createUntouchedState(),
  ),
});

const buildBookingFormState = (booking: Booking): BookingFormState => ({
  title: booking.title,
  description: booking.description,
  startsAt: formatDateTimeInput(booking.startsAt),
  endsAt: formatDateTimeInput(booking.endsAt),
});

export const BookingsPage = () => {
  const { isFeatureEnabled, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingEdits, setBookingEdits] = useState<
    Record<string, BookingFormState>
  >({});
  const [createTouched, setCreateTouched] = useState<BookingTouchedState>(
    createUntouchedState(),
  );
  const [editTouched, setEditTouched] = useState<
    Record<string, BookingTouchedState>
  >({});
  const [createState, setCreateState] = useState<BookingFormState>({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const loadBookings = async () => {
      if (!isFeatureEnabled("scheduling")) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setCreateError(null);

      try {
        const nextBookings = await bookingService.list();
        setBookings(nextBookings);
        setBookingEdits(
          Object.fromEntries(
            nextBookings.map((booking) => [
              booking._id,
              buildBookingFormState(booking),
            ]),
          ),
        );
      } catch (loadError) {
        setCreateError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load bookings",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [isFeatureEnabled]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateBookingFormState(createState);

    if (Object.keys(validationErrors).length > 0) {
      setCreateTouched(markAllFieldsTouched());
      return;
    }

    try {
      setCreateError(null);
      const booking = await bookingService.create(createState);
      setBookings((current) =>
        [...current, booking].sort((left, right) =>
          left.startsAt.localeCompare(right.startsAt),
        ),
      );
      setBookingEdits((current) => ({
        ...current,
        [booking._id]: buildBookingFormState(booking),
      }));
      setCreateState({
        title: "",
        description: "",
        startsAt: "",
        endsAt: "",
      });
      setCreateTouched(createUntouchedState());
    } catch (createError) {
      setCreateError(
        createError instanceof Error
          ? createError.message
          : "Unable to create booking",
      );
    }
  };

  const handleEdit = (
    bookingId: string,
    field: keyof BookingFormState,
    value: string,
  ) => {
    setBookingEdits((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        [field]: value,
      },
    }));
  };

  const handleCreateBlur = (field: keyof BookingFormState) => {
    setCreateTouched((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const handleEditBlur = (bookingId: string, field: keyof BookingFormState) => {
    setEditTouched((current) => ({
      ...current,
      [bookingId]: {
        ...(current[bookingId] ?? createUntouchedState()),
        [field]: true,
      },
    }));
  };

  const handleSave = async (bookingId: string) => {
    const formState = bookingEdits[bookingId];

    if (!formState) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]: "Unable to update booking",
      }));
      return;
    }

    const validationErrors = validateBookingFormState(formState);

    if (Object.keys(validationErrors).length > 0) {
      setEditTouched((current) => ({
        ...current,
        [bookingId]: markAllFieldsTouched(),
      }));
      return;
    }

    try {
      setBookingErrors((current) => ({ ...current, [bookingId]: "" }));
      const updatedBooking = await bookingService.update(bookingId, formState);
      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? updatedBooking : booking,
        ),
      );
      setBookingEdits((current) => ({
        ...current,
        [bookingId]: buildBookingFormState(updatedBooking),
      }));
      setEditTouched((current) => ({
        ...current,
        [bookingId]: createUntouchedState(),
      }));
    } catch (saveError) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]:
          saveError instanceof Error
            ? saveError.message
            : "Unable to update booking",
      }));
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await bookingService.delete(bookingId);
      setBookings((current) =>
        current.filter((booking) => booking._id !== bookingId),
      );
    } catch (deleteError) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]:
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete booking",
      }));
    }
  };

  if (!isFeatureEnabled("scheduling")) {
    return (
      <StatusPanel
        title="Scheduling disabled"
        message="This page is hidden by the organization feature flags."
      />
    );
  }

  if (loading) {
    return (
      <StatusPanel
        title="Loading bookings"
        message="Fetching schedule items."
      />
    );
  }

  const createErrors = validateBookingFormState(createState);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage simple shared bookings with conflict prevention on the API."
        title="Bookings"
      />
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form
          className="rounded-3xl bg-white p-6 shadow-sm"
          onSubmit={(event) => void handleCreate(event)}
        >
          <h2 className="text-xl font-semibold text-ink">Create booking</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
                onBlur={() => handleCreateBlur("title")}
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Booking title"
                value={createState.title}
              />
              {createTouched.title && createErrors.title ? (
                <p className="text-sm text-danger">{createErrors.title}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880]"
                onBlur={() => handleCreateBlur("description")}
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Booking description"
                value={createState.description}
              />
              {createTouched.description && createErrors.description ? (
                <p className="text-sm text-danger">
                  {createErrors.description}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
                onBlur={() => handleCreateBlur("startsAt")}
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    startsAt: event.target.value,
                  }))
                }
                type="datetime-local"
                value={createState.startsAt}
              />
              {createTouched.startsAt && createErrors.startsAt ? (
                <p className="text-sm text-danger">{createErrors.startsAt}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <input
                className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3"
                onBlur={() => handleCreateBlur("endsAt")}
                onChange={(event) =>
                  setCreateState((current) => ({
                    ...current,
                    endsAt: event.target.value,
                  }))
                }
                type="datetime-local"
                value={createState.endsAt}
              />
              {createTouched.endsAt && createErrors.endsAt ? (
                <p className="text-sm text-danger">{createErrors.endsAt}</p>
              ) : null}
            </div>
            {createError ? (
              <p className="text-sm text-danger">{createError}</p>
            ) : null}
            <button
              className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
            >
              Create booking
            </button>
          </div>
        </form>
        {bookings.length ? (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const canEdit = canEditBooking(user, booking);
              const formState = bookingEdits[booking._id];
              const rowState = formState ?? buildBookingFormState(booking);
              const rowErrors = validateBookingFormState(rowState);
              const rowTouched =
                editTouched[booking._id] ?? createUntouchedState();

              return (
                <li key={booking._id}>
                  <article className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <input
                          className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                          disabled={!canEdit}
                          onBlur={() => handleEditBlur(booking._id, "title")}
                          onChange={(event) =>
                            handleEdit(booking._id, "title", event.target.value)
                          }
                          value={rowState.title}
                        />
                        {rowTouched.title && rowErrors.title ? (
                          <p className="text-sm text-danger">
                            {rowErrors.title}
                          </p>
                        ) : null}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <textarea
                          className="min-h-24 rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                          disabled={!canEdit}
                          onBlur={() =>
                            handleEditBlur(booking._id, "description")
                          }
                          onChange={(event) =>
                            handleEdit(
                              booking._id,
                              "description",
                              event.target.value,
                            )
                          }
                          value={rowState.description}
                        />
                        {rowTouched.description && rowErrors.description ? (
                          <p className="text-sm text-danger">
                            {rowErrors.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <input
                          className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
                          disabled={!canEdit}
                          onBlur={() => handleEditBlur(booking._id, "startsAt")}
                          onChange={(event) =>
                            handleEdit(
                              booking._id,
                              "startsAt",
                              event.target.value,
                            )
                          }
                          type="datetime-local"
                          value={rowState.startsAt}
                        />
                        {rowTouched.startsAt && rowErrors.startsAt ? (
                          <p className="text-sm text-danger">
                            {rowErrors.startsAt}
                          </p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <input
                          className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
                          disabled={!canEdit}
                          onBlur={() => handleEditBlur(booking._id, "endsAt")}
                          onChange={(event) =>
                            handleEdit(
                              booking._id,
                              "endsAt",
                              event.target.value,
                            )
                          }
                          type="datetime-local"
                          value={rowState.endsAt}
                        />
                        {rowTouched.endsAt && rowErrors.endsAt ? (
                          <p className="text-sm text-danger">
                            {rowErrors.endsAt}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {bookingErrors[booking._id] ? (
                      <p className="mt-4 text-sm text-danger">
                        {bookingErrors[booking._id]}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canEdit}
                        onClick={() => void handleSave(booking._id)}
                        type="button"
                      >
                        Save
                      </button>
                      {canDeleteResources(user) ? (
                        <button
                          className="rounded-[10px] px-5 py-2.5 text-sm font-normal text-danger transition hover:bg-rose-50 active:opacity-70"
                          onClick={() => void handleDelete(booking._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <StatusPanel
            title="No bookings"
            message="Add the first scheduling entry for this organization."
          />
        )}
      </section>
    </div>
  );
};
