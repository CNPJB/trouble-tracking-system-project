import React from 'react';
import './ImageUploader.css';

const ImageUploader = ({ 
  selectedImages, 
  fileInputRef, 
  onImageChange, 
  onRemoveImage, 
  maxImages = 3 
}) => {
  return (
    <div className="form-group">
      <label>เพิ่มรูปภาพ (ไม่เกิน {maxImages} รูป) <span style={{ color: 'red' }}>*</span></label>
      <div className="image-upload-container">
        
        {/* Input ที่ถูกซ่อนไว้ */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        {/* ปุ่มเพิ่มรูปจะแสดงเมื่อรูปยังไม่ครบโควตา */}
        {selectedImages.length < maxImages && (
          <button
            type="button"
            className="upload-placeholder"
            onClick={() => fileInputRef.current?.click()}
            aria-label="เพิ่มรูปภาพ"
          >
            <span>+</span>
          </button>
        )}

        {/* พรีวิวรูปภาพ */}
        {selectedImages.map((img, index) => (
          <div key={index} className="image-preview-box">
            <img src={img.previewUrl} alt={`preview-${index}`} />
            <button type="button" className="btn-remove-image" onClick={() => onRemoveImage(index)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;