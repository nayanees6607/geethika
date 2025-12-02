const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DoctorPatient = require('./models/DoctorPatient');
const Patient = require('./models/Patient');

dotenv.config();

const inspectData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        const records = await DoctorPatient.find();
        console.log(`Found ${records.length} DoctorPatient records:`);

        for (const record of records) {
            console.log(JSON.stringify(record, null, 2));

            // Check if patient exists
            const patient = await Patient.findById(record.patientId);
            console.log(`Patient exists: ${!!patient}`);
            if (patient) {
                console.log(`Patient Name: ${patient.name || patient.firstName}`);
            }
            console.log('---');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

inspectData();
