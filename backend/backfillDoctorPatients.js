const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const DoctorPatient = require('./models/DoctorPatient');

dotenv.config();

const backfillDoctorPatients = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediconnect');
        console.log('✅ Connected to MongoDB');

        const appointments = await Appointment.find();
        console.log(`Found ${appointments.length} appointments`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const app of appointments) {
            if (!app.patientId || !app.doctorId) continue;

            const existingRelation = await DoctorPatient.findOne({
                doctorId: app.doctorId,
                patientId: app.patientId
            });

            if (!existingRelation) {
                await DoctorPatient.create({
                    doctorId: app.doctorId,
                    patientId: app.patientId,
                    status: 'new',
                    lastVisit: app.appointmentDate
                });
                console.log(`Created relation for Doctor ${app.doctorId} and Patient ${app.patientId}`);
                createdCount++;
            } else {
                // Update lastVisit if this appointment is more recent
                if (new Date(app.appointmentDate) > new Date(existingRelation.lastVisit)) {
                    existingRelation.lastVisit = app.appointmentDate;
                    await existingRelation.save();
                    updatedCount++;
                }
            }
        }

        console.log(`✅ Backfill complete. Created: ${createdCount}, Updated: ${updatedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

backfillDoctorPatients();
