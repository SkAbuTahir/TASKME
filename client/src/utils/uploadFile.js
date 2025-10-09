// client/src/utils/uploadFile.js (Backend Version)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Upload via backend API (More secure)
export const uploadViaBackend = async (file) => {
  console.log('🔄 Uploading file via backend...', { 
    name: file.name, 
    type: file.type, 
    size: file.size 
  });

  // Validate file
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/upload/single`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend upload failed:', result);
      throw new Error(result.message || result.error || 'Upload failed');
    }

    console.log('✅ Upload successful:', result.url);
    return result;
  } catch (error) {
    console.error('❌ Error in uploadViaBackend:', error);
    throw error;
  }
};

// Upload multiple files via backend
export const uploadMultipleViaBackend = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  console.log(`📤 Uploading ${files.length} file(s) via backend...`);
  
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend upload failed:', result);
      throw new Error(result.message || result.error || 'Upload failed');
    }

    console.log(`✅ Successfully uploaded ${result.files.length} file(s)`);
    return result.files;
  } catch (error) {
    console.error('❌ Error uploading multiple files:', error);
    throw error;
  }
};

// Direct Cloudinary upload (Frontend - requires unsigned preset)
export const uploadToCloudinary = async (file) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'danziw02c';
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'task_manager';
  
  console.log('🔄 Uploading file to Cloudinary...', { 
    cloudName: CLOUD_NAME, 
    uploadPreset: UPLOAD_PRESET,
    file: { name: file.name, type: file.type, size: file.size }
  });

  if (!file) {
    throw new Error('No file provided for upload');
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Cloudinary upload failed:', result);
      
      if (result.error) {
        const errorMessage = result.error.message || JSON.stringify(result.error);
        
        if (errorMessage.includes('Invalid upload preset')) {
          throw new Error(
            `Upload preset "${UPLOAD_PRESET}" not found. ` +
            `Create an unsigned preset in Cloudinary settings or use backend upload.`
          );
        } else if (errorMessage.includes('Invalid cloud name')) {
          throw new Error(`Cloud name "${CLOUD_NAME}" is invalid.`);
        } else {
          throw new Error(`Cloudinary error: ${errorMessage}`);
        }
      }
      
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    console.log('✅ Upload successful:', result.secure_url);
    return result;
  } catch (error) {
    console.error('❌ Error in uploadToCloudinary:', error);
    throw error;
  }
};

// Main upload function - tries backend first, falls back to Cloudinary
export const uploadFile = async (file, preferBackend = true) => {
  try {
    if (preferBackend) {
      return await uploadViaBackend(file);
    } else {
      return await uploadToCloudinary(file);
    }
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};

export default {
  uploadFile,
  uploadViaBackend,
  uploadMultipleViaBackend,
  uploadToCloudinary,
};