import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

export const summarizeFile = (formData) =>
  axios.post(`${BASE_URL}/summarize`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getFiles = () => axios.get(`${BASE_URL}/files`);

export const getFile = (id) => axios.get(`${BASE_URL}/file/${id}`);

export const deleteFile = (id) => axios.delete(`${BASE_URL}/file/${id}`);

export const deleteAllFiles = () => axios.delete(`${BASE_URL}/files`);

export const askAI = (prompt) =>
  axios.post(`${BASE_URL}/ask`, { prompt });
