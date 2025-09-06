import React, { useState } from "react";
import { askAI } from "../services/api";
import Loader from "./Loader";

const ChatWithAI = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await askAI(prompt);
      setResponse(res.data.response);
    } catch {
      setResponse("Error: Could not get AI response.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-8 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Ask AI</h2>
      <textarea
        className="w-full border p-2 rounded mb-2"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your question..."
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>
      {loading && <Loader />}
      {response && <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-line">{response}</div>}
    </div>
  );
};

export default ChatWithAI;
