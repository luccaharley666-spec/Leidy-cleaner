import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';

function PhotoUpload({ onPhotosChange, maxPhotos = 5 }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    // Validar quantidade máxima
    if (photos.length + files.length > maxPhotos) {
      addToast(`Máximo ${maxPhotos} fotos permitidas`, 'warning');
      return;
    }

    // Validar tipos de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files).filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      addToast('Apenas JPEG, PNG e WebP são permitidos', 'warning');
      return;
    }

    // Validar tamanho (máx 5MB por foto)
    const oversizedFiles = Array.from(files).filter(f => f.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      addToast('Máximo 5MB por foto', 'warning');
      return;
    }

    setUploading(true);

    try {
      const newPhotos = [];

      for (let file of files) {
        // Criar preview
        const reader = new FileReader();
        
        reader.onload = (e) => {
          newPhotos.push({
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name,
            uploading: false
          });

          if (newPhotos.length === files.length) {
            const allPhotos = [...photos, ...newPhotos];
            setPhotos(allPhotos);
            onPhotosChange(allPhotos);
            addToast(`${files.length} foto(s) adicionada(s)`, 'success');
            setUploading(false);
          }
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      addToast('Erro ao processar fotos', 'error');
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (photos.length < maxPhotos) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (id) => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    onPhotosChange(updated);
    addToast('Foto removida', 'info');
  };

  const [REDACTED_TOKEN] = (id, type) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      photo.type = type; // 'before' ou 'after'
      setPhotos([...photos]);
      onPhotosChange(photos);
      addToast(`Foto marcada como ${type === 'before' ? 'ANTES' : 'DEPOIS'}`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">📸 Fotos do Trabalho</h3>

      {/* Zona de Upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400'
        } ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || photos.length >= maxPhotos}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">📤</span>
          <p className="font-semibold text-gray-700">
            {dragActive ? 'Solte as fotos aqui' : 'Arraste fotos ou clique para selecionar'}
          </p>
          <p className="text-sm text-gray-500">
            {photos.length}/{maxPhotos} fotos ({photos.length > 0 ? 'máximo 5MB cada' : 'PNG, JPEG ou WebP'})
          </p>
          {uploading && <p className="text-sm text-blue-600">⏳ Processando...</p>}
        </div>
      </div>

      {/* Preview de Fotos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="font-semibold text-gray-700">📷 Fotos Selecionadas ({photos.length})</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition bg-white"
              >
                <img
                  src={photo.preview}
                  alt={photo.name}
                  className="w-full h-32 object-cover"
                />

                {/* Badge Before/After */}
                {photo.type && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {photo.type === 'before' ? 'ANTES' : 'DEPOIS'}
                  </div>
                )}

                {/* Overlay com Ações */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => [REDACTED_TOKEN](photo.id, 'before')}
                      title="Marcar como ANTES"
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    >
                      ⬅️
                    </button>
                    <button
                      onClick={() => [REDACTED_TOKEN](photo.id, 'after')}
                      title="Marcar como DEPOIS"
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                      ➡️
                    </button>
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    title="Remover"
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                  >
                    ❌ Remover
                  </button>
                </div>

                {/* Nome do Arquivo */}
                <p className="text-xs text-gray-600 p-2 truncate">{photo.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dica */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Marque fotos como ANTES/DEPOIS para mostrar o resultado do seu trabalho aos clientes!
        </p>
      </div>
    </div>
  );
}

export default PhotoUpload;
