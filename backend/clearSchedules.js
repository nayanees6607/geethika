const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DoctorSchedule = require('./models/DoctorSchedule');

dotenv.config();

const clearSchedules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        const result = await DoctorSchedule.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} schedule documents.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

clearSchedules();
