import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["income", "expense"],
  },
  amount: Number,
  category: String,
  description: String,
  date: Date,
  isAnomaly: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);