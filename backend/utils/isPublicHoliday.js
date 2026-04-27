import Holiday from "../models/holidayModel.js";

const isPublicHoliday = async (date) => {
  const holiday = await Holiday.findOne({
    date: new Date(date),
  });

  return !!holiday;
};

export default isPublicHoliday;
