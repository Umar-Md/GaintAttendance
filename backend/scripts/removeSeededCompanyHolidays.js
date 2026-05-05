import "dotenv/config";
import mongoose from "mongoose";
import Holiday from "../models/holidayModel.js";

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.error("Missing MONGO_URI (or MONGODB_URI) env var.");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(mongoUri);

  const result = await Holiday.deleteMany({
    name: { $regex: /^Company Holiday - /i },
    type: "COMPANY",
  });

  // eslint-disable-next-line no-console
  console.log(`Deleted ${result.deletedCount} seeded company holidays.`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
