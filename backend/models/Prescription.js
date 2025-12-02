const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    medicines: [{
        name: {
            type: String,
            required: true
        },
        dosage: String,
        frequency: String,
        duration: String,
        notes: String
    }],
    diagnosis: {
        type: String
    },
    notes: {
        type: String
    },
    imageUrl: {
        type: String // For uploaded prescriptions
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'dispensed'],
        default: 'pending'
    },
    pharmacyNotes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
