const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

dotenv.config();

const inspectSchedule = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        const doctors = await Doctor.find({});

        console.log(`Found ${doctors.length} doctors.`);

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        console.log(`Server Time: ${currentTime} (${currentDay})`);

        doctors.forEach(doc => {
            console.log(`\nDoctor: ${doc.name}`);
            const todaySchedule = doc.weeklySchedule.find(s => s.day === currentDay);
            if (todaySchedule) {
                console.log(`Schedule for ${currentDay}: ${todaySchedule.startTime} - ${todaySchedule.endTime}`);
                console.log(`Is Available: ${todaySchedule.isAvailable}`);

                const isWithin = currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
                console.log(`Is Within Time: ${isWithin}`);
            } else {
                console.log(`No schedule for ${currentDay}`);
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

inspectSchedule();
