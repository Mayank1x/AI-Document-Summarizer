import React from "react";

const FileCard = ({ file, onDelete, onView }) => {
  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition mb-4">
      <h3 className="font-semibold">{file.filename}</h3>
      <p className="text-gray-500 text-sm mb-2">
        Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
      </p>
      {file.preview_text && (
        <p className="text-gray-700 mb-2 whitespace-pre-line">
          {file.preview_text}
        </p>
      )}
      {file.summary && (
        <p className="text-blue-700 mb-2 whitespace-pre-line">{file.summary}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onView(file.id)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          View
        </button>
        <button
          onClick={() => onDelete(file.id)}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FileCard;
