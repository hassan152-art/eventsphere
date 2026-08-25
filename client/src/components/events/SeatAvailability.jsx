export default function SeatAvailability({ seatsRemaining, maxParticipants, waitlistEnabled }) {
  if (seatsRemaining <= 0) {
    return waitlistEnabled ? (
      <span className="text-sm font-semibold text-amber-600">Join Waitlist</span>
    ) : (
      <span className="text-sm font-semibold text-danger">Registration Full</span>
    );
  }
  if (seatsRemaining <= 10) {
    return <span className="text-sm font-semibold text-amber-600">Only {seatsRemaining} seats left</span>;
  }
  return (
    <span className="text-sm text-slate-500 dark:text-slate-400">
      {seatsRemaining} / {maxParticipants} seats remaining
    </span>
  );
}
