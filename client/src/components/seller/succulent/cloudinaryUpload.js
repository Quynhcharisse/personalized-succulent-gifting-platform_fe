import axios from 'axios';

export const uploadToCloudinary = async (file, { onProgress, signal } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'psgp_web');
    formData.append('cloud_name', 'dfx4miova');
    formData.append('folder', 'psgp');
    formData.append('public_id', `user_${Date.now()}`);

    const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dfx4miova/image/upload',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    const percent = Math.round((evt.loaded * 100) / evt.total);
                    onProgress(percent);
                }
            },
            signal
        }
    );

    return response.data.secure_url;
};

export default uploadToCloudinary;


