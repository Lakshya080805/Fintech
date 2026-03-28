import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

dotenv.config();

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] || null;
};

const email = getArg("--email");
const shouldClear = args.includes("--clear");

if (!email) {
  console.error("Usage: node scripts/seedDemo.js --email user@example.com [--clear]");
  process.exit(1);
}

const buildDemoTransactions = () => {
  const now = new Date();
  const makeDate = (monthsAgo, day = 5) =>
    new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 12, 0, 0);

  return [
    {
      description: "Platform Subscription",
      amount: 210000,
      type: "income",
      category: "SaaS Revenue",
      date: makeDate(5, 6),
    },
    {
      description: "Cloud Infrastructure",
      amount: 98000,
      type: "expense",
      category: "Infrastructure",
      date: makeDate(5, 16),
    },
    {
      description: "Growth Retainer",
      amount: 235000,
      type: "income",
      category: "Services",
      date: makeDate(4, 8),
    },
    {
      description: "Payroll",
      amount: 112000,
      type: "expense",
      category: "Payroll",
      date: makeDate(4, 24),
    },
    {
      description: "Marketplace Payout",
      amount: 198000,
      type: "income",
      category: "Marketplace",
      date: makeDate(3, 7),
    },
    {
      description: "Performance Marketing",
      amount: 89000,
      type: "expense",
      category: "Marketing",
      date: makeDate(3, 19),
    },
    {
      description: "Renewals Batch",
      amount: 265000,
      type: "income",
      category: "Renewals",
      date: makeDate(2, 6),
    },
    {
      description: "R&D Tools",
      amount: 74000,
      type: "expense",
      category: "Software",
      date: makeDate(2, 20),
    },
    {
      description: "Enterprise Expansion",
      amount: 320000,
      type: "income",
      category: "Enterprise",
      date: makeDate(1, 9),
    },
    {
      description: "Operations",
      amount: 132000,
      type: "expense",
      category: "Operations",
      date: makeDate(1, 22),
    },
    {
      description: "Strategic Partnership",
      amount: 295000,
      type: "income",
      category: "Partnerships",
      date: makeDate(0, 8),
    },
    {
      description: "Compliance & Legal",
      amount: 118000,
      type: "expense",
      category: "Compliance",
      date: makeDate(0, 19),
    },
  ];
};

const run = async () => {
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user found with email ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (shouldClear) {
    await Transaction.deleteMany({ userId: user._id });
  }

  const demo = buildDemoTransactions().map((t) => ({
    ...t,
    userId: user._id,
  }));

  await Transaction.insertMany(demo);
  console.log(
    `Seeded ${demo.length} transactions for ${email}${shouldClear ? " (cleared first)" : ""}.`
  );

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
