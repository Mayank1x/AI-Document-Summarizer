import React, { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import FileCard from "../components/FileCard";
import ChatWithAI from "../components/ChatWithAI";
import {
  summarizeFile,
  getFiles,
  getFile,
  deleteFile,
  deleteAllFiles,
} from "../services/api";

const Home = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false); // spinner for summarizing

  const fetchFiles = async () => {
    try {
      const res = await getFiles();
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSummarize = async (formData) => {
    setLoading(true);
    try {
      const res = await summarizeFile(formData);
      const newFile = res.data;
      setFiles([newFile, ...files]);
      alert("File summarized successfully!");
      setSelectedFile(newFile); // automatically show preview
    } catch (err) {
      console.error(err);
      alert("Error summarizing file!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async (id) => {
    try {
      const res = await getFile(id);
      setSelectedFile(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching file!");
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await deleteFile(id);
      setFiles(files.filter((f) => f.id !== id));
      if (selectedFile?.id === id) setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting file!");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all files?")) return;
    try {
      await deleteAllFiles();
      setFiles([]);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting all files!");
    }
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Document Summarizer</h1>

      <FileUpload onFileSummarize={handleFileSummarize} />

      {loading && (
        <div className="flex justify-center my-4">
          <div className="loader border-t-4 border-blue-500 rounded-full w-10 h-10 animate-spin"></div>
        </div>
      )}

      {selectedFile && (
        <div className="bg-white p-4 rounded shadow my-4 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">{selectedFile.filename}</h2>
            <button
              onClick={handleClearSelected}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Clear
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            Uploaded at:{" "}
            {selectedFile.uploaded_at
              ? new Date(selectedFile.uploaded_at).toLocaleString()
              : "Unknown"}
          </p>
          <h3 className="font-semibold">Content Preview:</h3>
          <p className="whitespace-pre-line max-h-48 overflow-y-auto">{selectedFile.content}</p>
          <h3 className="font-semibold mt-2">Summary:</h3>
          <p className="text-blue-700 whitespace-pre-line max-h-32 overflow-y-auto">
            {selectedFile.summary}
          </p>
        </div>
      )}

      <div className="flex justify-between max-w-lg mx-auto mb-2">
        <h2 className="text-xl font-semibold">Uploaded Files</h2>
        {files.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete All
          </button>
        )}
      </div>

      <div className="max-w-lg mx-auto space-y-2">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDelete={handleDeleteFile}
            onView={handleViewFile}
          />
        ))}
      </div>

      <ChatWithAI />
    </div>
  );
};

export default Home;
