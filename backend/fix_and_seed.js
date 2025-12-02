const mongoose = require('mongoose');
const DoctorPatient = require('./models/DoctorPatient');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const fixAndSeed = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // 1. Check for orphaned records
        const records = await DoctorPatient.find({});
        console.log(`Checking ${records.length} records for orphans...`);

        for (const record of records) {
            const patient = await User.findById(record.patientId);
            if (!patient) {
                console.log(`Found orphan record: ${record._id}. Patient ${record.patientId} does not exist. Deleting...`);
                await DoctorPatient.deleteOne({ _id: record._id });
            }
        }

        // 2. Seed 'new' patient for ALL doctors
        const doctors = await Doctor.find({});
        const patient = await User.findOne({ role: 'patient' });

        if (!patient) {
            console.log('No patient found to seed with!');
            return;
        }

        for (const doctor of doctors) {
            // Check if relationship exists
            const exists = await DoctorPatient.findOne({ doctorId: doctor._id, patientId: patient._id });
            if (!exists) {
                const newRecord = new DoctorPatient({
                    doctorId: doctor._id,
                    patientId: patient._id,
                    status: 'new',
                    lastVisit: new Date()
                });
                await newRecord.save();
                console.log(`Seeded new patient for doctor ${doctor.name}`);
            } else {
                console.log(`Relationship already exists for doctor ${doctor.name}`);
                // Optionally reset status to 'new' for testing
                // exists.status = 'new';
                // await exists.save();
                // console.log(`Reset status to 'new' for doctor ${doctor.name}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

fixAndSeed();
