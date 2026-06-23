const pad = (value) => String(value).padStart(2, "0");

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

const getLocalMonthString = (date = new Date()) => getLocalDateString(date).slice(0, 7);

export { getLocalDateString, getLocalMonthString };
