import axios from "axios";

export const getAIInsights = async (data) => {
  const res = await axios.post("http://localhost:5000/analyze", data);
  return res.data;
};