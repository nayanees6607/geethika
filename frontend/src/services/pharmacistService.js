import axios from 'axios';

const API_BASE_URL = '/api/prescription-orders';

// Patient services
export const uploadPrescription = async (prescriptionData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/upload-prescription`, prescriptionData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload prescription');
    }
};

export const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${orderId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
};

export const makePayment = async (orderId, paymentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${orderId}/pay`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
};

// Pharmacist services
export const getPendingOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pending`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending orders');
    }
};

export const getAllOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/all`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
};

export const approvePrescription = async (orderId, medicines) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${orderId}/approve`, { medicines });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve prescription');
    }
};

export const rejectPrescription = async (orderId, rejectionReason) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${orderId}/reject`, { rejectionReason });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to reject prescription');
    }
};

export const startProcessingOrder = async (orderId) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${orderId}/start-processing`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
};

export const markOrderReadyForDispatch = async (orderId) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${orderId}/ready-for-dispatch`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
};

export const searchMedicines = async (query) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/medicines/search?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to search medicines');
    }
};

export default {
    uploadPrescription,
    getOrderDetails,
    makePayment,
    getPendingOrders,
    getAllOrders,
    approvePrescription,
    rejectPrescription,
    startProcessingOrder,
    markOrderReadyForDispatch,
    searchMedicines
};