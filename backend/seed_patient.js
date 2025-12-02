const mongoose = require('mongoose');
const DoctorPatient = require('./models/DoctorPatient');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const seedData = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find a doctor
        const doctor = await Doctor.findOne();
        if (!doctor) {
            console.log('No doctor found!');
            return;
        }
        console.log('Found doctor:', doctor._id, doctor.name);

        // Find a patient
        const patient = await User.findOne({ role: 'patient' });
        if (!patient) {
            console.log('No patient found!');
            return;
        }
        console.log('Found patient:', patient._id, patient.name);

        // Create a new DoctorPatient relationship with status 'new'
        const newRecord = new DoctorPatient({
            doctorId: doctor._id,
            patientId: patient._id,
            status: 'new',
            lastVisit: new Date()
        });

        await newRecord.save();
        console.log('Created new DoctorPatient record:', newRecord);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

seedData();
