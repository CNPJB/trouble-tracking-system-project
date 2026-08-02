import React from 'react';
import './componentsStyles/ImageUploader.css';

const ImageUploader = ({
  selectedImages,
  fileInputRef,
  onImageChange,
  onRemoveImage,
  maxImages = 3,
  minImages = 0,
  isCompressing = false
}) => {
  return (
    <div className="form-group">
      {minImages > 0 ? (
        <label>เพิ่มรูปภาพ (อย่างน้อย {minImages} รูป และไม่เกิน {maxImages} รูป) <span style={{ color: 'red' }}>*</span></label>
      ) : (
        <label>เพิ่มรูปภาพ (ไม่เกิน {maxImages} รูป)</label>
      )}
      <div className="image-upload-container">

        {/* Input ที่ถูกซ่อนไว้ */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          disabled={isCompressing}
        />
        {isCompressing ? (
          <div className="upload-placeholder loading">
            <div className="image-spinner"></div>
          </div>
        ) : (
          selectedImages.length < maxImages && (
            <button
              type="button"
              className="upload-placeholder"
              onClick={() => fileInputRef.current?.click()}
              aria-label="เพิ่มรูปภาพ"
            >
              <span>+</span>
            </button>
          )
        )}

        {/* พรีวิวรูปภาพ */}
        {selectedImages.map((img, index) => (
          <div key={index} className="image-preview-box">
            <img src={img.previewUrl} alt={`preview-${index}`} />
            <button
              type="button"
              className="btn-remove-image"
              onClick={() => onRemoveImage(index)}
              disabled={isCompressing}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;