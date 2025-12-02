const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const DoctorPatient = require('./models/DoctorPatient');

dotenv.config();

const clearAllData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        const appointments = await Appointment.deleteMany({});
        console.log(`✅ Deleted ${appointments.deletedCount} appointments.`);

        const relations = await DoctorPatient.deleteMany({});
        console.log(`✅ Deleted ${relations.deletedCount} doctor-patient relationships.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

clearAllData();
