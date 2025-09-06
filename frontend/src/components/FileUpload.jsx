import React, { useState } from "react";
import Loader from "./Loader";

const FileUpload = ({ onFileSummarize }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    await onFileSummarize(formData);
    setLoading(false);
    setFile(null);
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-md mx-auto mt-6">
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
        className="mb-2 w-full"
      />
      {file && <p className="text-gray-700 mb-2">{file.name}</p>}
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Summarizing..." : "Upload & Summarize"}
      </button>
      {loading && <Loader />}
    </div>
  );
};

export default FileUpload;
