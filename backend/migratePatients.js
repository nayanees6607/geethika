const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Patient = require('./models/Patient');

dotenv.config();

const migratePatients = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        // Find all users with role 'patient'
        const users = await User.find({ role: 'patient' });
        console.log(`Found ${users.length} patients in User collection`);

        for (const user of users) {
            // Check if patient already exists in Patient collection
            const existingPatient = await Patient.findOne({ email: user.email });
            if (existingPatient) {
                console.log(`Patient ${user.email} already exists in Patient collection. Skipping.`);
                continue;
            }

            // Create new Patient document
            // We need to handle password carefully. 
            // If we save it directly, the pre-save hook will hash it again if we are not careful.
            // But here we are creating a NEW document, so pre-save hook WILL run.
            // However, the password in 'user' is ALREADY hashed.
            // So if we set patient.password = user.password, it will be hashed AGAIN.
            // We need to bypass the pre-save hook or set it directly.

            // Actually, the pre-save hook checks `isModified('password')`.
            // When creating new doc, it IS modified.

            // Workaround: Create object, delete password, save, then update password directly.

            const patientData = user.toObject();
            delete patientData._id;
            delete patientData.__v;
            delete patientData.createdAt;
            delete patientData.updatedAt;

            // We can't easily unhash the password.
            // If we save the hashed password as is, the pre-save hook will hash it again (double hash).
            // So the user won't be able to login.

            // Option 1: Update the schema to allow skipping hash? No.
            // Option 2: Use updateOne/findOneAndUpdate to insert without triggering middleware.

            await Patient.collection.insertOne({
                ...patientData,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`Migrated patient: ${user.email}`);
        }

        console.log('✅ Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migratePatients();
