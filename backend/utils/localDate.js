const DEFAULT_TIME_ZONE = "Asia/Kolkata";

const getAppTimeZone = () => process.env.APP_TIME_ZONE || DEFAULT_TIME_ZONE;

const getLocalDateString = (date = new Date(), timeZone = getAppTimeZone()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

export { getAppTimeZone, getLocalDateString };
