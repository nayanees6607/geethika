const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Patient = require('./models/Patient');
const DoctorPatient = require('./models/DoctorPatient');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');

dotenv.config();

const fixReferences = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        // 1. Create a map of Old User ID -> New Patient ID
        const users = await User.find({ role: 'patient' });
        const idMap = new Map();

        console.log('Mapping IDs...');
        for (const user of users) {
            const patient = await Patient.findOne({ email: user.email });
            if (patient) {
                idMap.set(user._id.toString(), patient._id);
                console.log(`Mapped ${user.email}: ${user._id} -> ${patient._id}`);
            } else {
                console.warn(`⚠️ Could not find new patient record for ${user.email}`);
            }
        }

        // 2. Update DoctorPatient references
        console.log('\nUpdating DoctorPatient references...');
        const doctorPatients = await DoctorPatient.find();
        let dpCount = 0;
        for (const dp of doctorPatients) {
            const oldId = dp.patientId.toString();
            if (idMap.has(oldId)) {
                dp.patientId = idMap.get(oldId);
                await dp.save();
                dpCount++;
            }
        }
        console.log(`✅ Updated ${dpCount} DoctorPatient records`);

        // 3. Update Appointment references
        console.log('\nUpdating Appointment references...');
        const appointments = await Appointment.find();
        let appCount = 0;
        for (const app of appointments) {
            if (!app.patientId) continue;
            const oldId = app.patientId.toString();
            if (idMap.has(oldId)) {
                app.patientId = idMap.get(oldId);
                await app.save();
                appCount++;
            }
        }
        console.log(`✅ Updated ${appCount} Appointment records`);

        // 4. Update Prescription references
        console.log('\nUpdating Prescription references...');
        const prescriptions = await Prescription.find();
        let presCount = 0;
        for (const pres of prescriptions) {
            const oldId = pres.patient.toString();
            if (idMap.has(oldId)) {
                pres.patient = idMap.get(oldId);
                await pres.save();
                presCount++;
            }
        }
        console.log(`✅ Updated ${presCount} Prescription records`);

        console.log('\n🎉 Reference fix completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing references:', error);
        process.exit(1);
    }
};

fixReferences();
