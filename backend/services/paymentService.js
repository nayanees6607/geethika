const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with environment variables
// If variables are missing, it will throw an error when used
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID_HERE',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE'
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR') => {
    try {
        const options = {
            amount: amount * 100, // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay Order ID
 * @param {string} paymentId - Razorpay Payment ID
 * @param {string} signature - Razorpay Signature
 * @returns {boolean} True if signature is valid
 */
const verifyPayment = (orderId, paymentId, signature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE')
        .update(orderId + '|' + paymentId)
        .digest('hex');

    return generatedSignature === signature;
};

module.exports = {
    createOrder,
    verifyPayment
};
