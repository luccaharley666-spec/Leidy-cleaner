import React, { useState } from 'react';
import axios from 'axios';

export default function PhotoUpload({ token, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const upload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('photos', f));
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(`${base}/uploads`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded?.();
      setFiles([]);
    } catch (err) {
      // ignore for now
    } finally { setUploading(false); }
  };

  return (
    <div className="photo-upload p-3 bg-white rounded">
      <h4 className="font-semibold mb-2">Upload de Fotos</h4>
      <input type="file" multiple accept="image/*" onChange={onChange} />
      {files.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div>{files.length} arquivo(s) selecionado(s)</div>
          <button onClick={upload} disabled={uploading} className="px-3 py-1 bg-green-600 text-white rounded">{uploading ? 'Enviando...' : 'Enviar'}</button>
        </div>
      )}
    </div>
  );
}
