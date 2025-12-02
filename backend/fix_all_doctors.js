const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const fixAllDoctors = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const result = await Doctor.updateMany(
            {}, // Match all documents
            { $set: { isAvailable: true } }
        );

        console.log('Update result:', result);
        console.log(`Successfully updated ${result.modifiedCount} doctors to be available.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

fixAllDoctors();
