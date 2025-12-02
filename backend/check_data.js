const mongoose = require('mongoose');
const DoctorPatient = require('./models/DoctorPatient'); // Adjust path if needed
const User = require('./models/User'); // Adjust path if needed

const checkData = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const doctorPatients = await DoctorPatient.find({});
        console.log(`Found ${doctorPatients.length} DoctorPatient records.`);

        if (doctorPatients.length > 0) {
            console.log('Sample record:', JSON.stringify(doctorPatients[0], null, 2));
        } else {
            console.log('No DoctorPatient records found. This explains why the list is empty.');
        }

        // Check if there are any users with role 'patient'
        const patients = await User.find({ role: 'patient' });
        console.log(`Found ${patients.length} users with role 'patient'.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
