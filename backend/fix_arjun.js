const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const fixDoctor = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const result = await Doctor.updateOne(
            { name: 'Dr. Arjun Rao' },
            { $set: { isAvailable: true } }
        );

        console.log('Update result:', result);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

fixDoctor();
