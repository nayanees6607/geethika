const mongoose = require('mongoose');

const doctorPatientSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'pending', 'accepted', 'rejected'],
        default: 'new'
    },
    lastVisit: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to ensure unique doctor-patient pairs
doctorPatientSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model('DoctorPatient', doctorPatientSchema);
