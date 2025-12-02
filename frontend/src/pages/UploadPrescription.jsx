import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

const UploadPrescription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a prescription file');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // In a real app, you would upload the file to a storage service
            // For now, we'll just send the filename as a placeholder
            const prescriptionData = {
                prescriptionFile: file.name
            };

            const response = await axios.post('/api/prescription-orders/upload-prescription', prescriptionData);
            
            if (response.data.order) {
                alert('Prescription uploaded successfully!');
                navigate(`/view-order/${response.data.order._id}`);
            }
        } catch (err) {
            console.error('Error uploading prescription:', err);
            setError(err.response?.data?.message || 'Failed to upload prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Upload Prescription</h2>
                <p>Hello {user?.name}, please upload your prescription</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Prescription File (Image/PDF)</label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="file-input"
                            required
                        />
                    </div>
                    
                    {preview && (
                        <div className="file-preview">
                            <h4>Preview:</h4>
                            {file.type.startsWith('image/') ? (
                                <img src={preview} alt="Prescription preview" className="preview-image" />
                            ) : (
                                <div className="pdf-preview">
                                    <p>PDF File: {file.name}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Upload Prescription'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Your prescription will be reviewed by our pharmacist team.</p>
                </div>
            </div>
        </div>
    );
};

export default UploadPrescription;