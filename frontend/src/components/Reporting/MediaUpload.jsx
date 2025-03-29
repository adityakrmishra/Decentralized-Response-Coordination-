import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Web3Storage } from 'web3.storage';
import './MediaUpload.css';

const MediaUpload = ({ onUploadComplete, maxFiles, acceptedTypes }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const client = new Web3Storage({
    token: process.env.REACT_APP_WEB3_STORAGE_TOKEN
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      if (acceptedFiles.length + files.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`);
      }

      setIsUploading(true);
      setError('');
      
      const cid = await client.put(acceptedFiles, {
        wrapWithDirectory: false,
        onStoredChunk: (bytes) => {
          setUploadProgress(bytes / (acceptedFiles.reduce((acc, file) => acc + file.size, 0)));
        }
      });

      const uploadedFiles = acceptedFiles.map((file, index) => ({
        cid: `${cid}/${file.name}`,
        name: file.name,
        type: file.type,
        preview: URL.createObjectURL(file)
      }));

      setFiles(prev => [...prev, ...uploadedFiles]);
      onUploadComplete(uploadedFiles.map(f => f.cid));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [files.length, maxFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles: maxFiles - files.length,
    disabled: isUploading || files.length >= maxFiles
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="media-upload">
      <div 
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${error ? 'error' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="upload-progress">
            <progress value={uploadProgress} max="1" />
            <p>Uploading... {Math.round(uploadProgress * 100)}%</p>
          </div>
        ) : (
          <p>{isDragActive ? 'Drop files here' : 'Drag files or click to upload evidence'}</p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="preview-grid">
        {files.map((file, index) => (
          <div key={file.cid} className="preview-item">
            {file.type.startsWith('image/') ? (
              <img src={file.preview} alt={file.name} />
            ) : (
              <video controls>
                <source src={file.preview} type={file.type} />
              </video>
            )}
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeFile(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="upload-info">
        <p>Supported formats: {acceptedTypes}</p>
        <p>Files remaining: {maxFiles - files.length}</p>
      </div>
    </div>
  );
};

export default MediaUpload;
