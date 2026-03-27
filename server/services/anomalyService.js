import Transaction from "../models/Transaction.js";

const detectAnomaly = async (userId, amount) => {
  const past = await Transaction.find({ userId });

  if (past.length < 5) return false;

  const avg = past.reduce((acc, t) => acc + t.amount, 0) / past.length;

  return amount > avg * 1.5;
};

export default detectAnomaly;