const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DoctorPatient = require('./models/DoctorPatient');
const Doctor = require('./models/Doctor');

dotenv.config();

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        const doctors = await Doctor.find();
        console.log(`Found ${doctors.length} doctors`);

        for (const doctor of doctors) {
            const count = await DoctorPatient.countDocuments({ doctorId: doctor._id });
            console.log(`Doctor ${doctor.name} (${doctor._id}) has ${count} patients`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkStats();
