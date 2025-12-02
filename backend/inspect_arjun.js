const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const inspectDoctor = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const doctor = await Doctor.findOne({ name: 'Dr. Arjun Rao' });
        if (!doctor) {
            console.log('Doctor not found');
        } else {
            console.log('Doctor found:', doctor.name);
            console.log('Global isAvailable:', doctor.isAvailable);
            console.log('Weekly Schedule:', JSON.stringify(doctor.weeklySchedule, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

inspectDoctor();
