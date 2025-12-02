const Doctor = require('../models/Doctor');

/**
 * Get doctor schedule
 */
exports.getSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.userId).select('availableSlots');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json({ schedule: doctor.availableSlots || [] });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Error fetching schedule', error: error.message });
    }
};

/**
 * Update doctor schedule
 */
exports.updateSchedule = async (req, res) => {
    try {
        const { availableSlots } = req.body;

        // Validate slots (no overlaps)
        if (availableSlots && availableSlots.length > 0) {
            for (let i = 0; i < availableSlots.length; i++) {
                for (let j = i + 1; j < availableSlots.length; j++) {
                    const slot1 = availableSlots[i];
                    const slot2 = availableSlots[j];

                    if (slot1.day === slot2.day) {
                        const start1 = slot1.startTime;
                        const end1 = slot1.endTime;
                        const start2 = slot2.startTime;
                        const end2 = slot2.endTime;

                        if ((start1 < end2 && end1 > start2)) {
                            return res.status(400).json({
                                message: `Overlapping slots found for ${slot1.day}`
                            });
                        }
                    }
                }
            }
        }

        const doctor = await Doctor.findByIdAndUpdate(
            req.user.userId,
            { availableSlots },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json({
            message: 'Schedule updated successfully',
            schedule: doctor.availableSlots
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Error updating schedule', error: error.message });
    }
};
