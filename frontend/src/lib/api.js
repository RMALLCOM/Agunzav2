import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env?.REACT_APP_BACKEND_URL || "";
export const api = axios.create({ baseURL: `${BACKEND_URL}/api` });

export async function uploadImageInChunks(blob, onProgress) {
  const fileName = `frame_${Date.now()}.jpg`;
  const startRes = await api.post("/scan/start", {
    file_name: fileName,
    mime: "image/jpeg",
    total_size: blob.size,
  });
  const { upload_id, chunk_size } = startRes.data;

  const totalChunks = Math.ceil(blob.size / chunk_size);
  let sent = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunk_size;
    const end = Math.min((i + 1) * chunk_size, blob.size);
    const chunk = blob.slice(start, end);
    const form = new FormData();
    form.append("upload_id", upload_id);
    form.append("chunk_index", String(i));
    form.append("total_chunks", String(totalChunks));
    form.append("chunk", new File([chunk], `chunk_${i}.bin`));
    await api.post("/scan/chunk", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total) {
          const inc = e.loaded;
          sent += inc;
          const pct = Math.min(100, Math.round((Math.min(end, sent) / blob.size) * 100));
          onProgress && onProgress(pct);
        }
      },
    });
  }

  const finishRes = await api.post("/scan/finish", { upload_id });
  return finishRes.data;
}
