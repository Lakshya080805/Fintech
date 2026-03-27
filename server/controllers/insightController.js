import Transaction from "../models/Transaction.js";
import { generateInsights } from "../services/aiAssistant.js";

export const getInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    const insights = await generateInsights(transactions);
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: "AI service error" });
  }
};
