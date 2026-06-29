const { User, Appointment, Clinic, Doctor, Patient } = require('../models');

const getAdminStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date();
  endOfDay.setHours(23,59,59,999);
  
  const [TotalPatients, TotalDoctors, TotalClinics, TotalAppointments, TodayAppointments, PendingAppointments, Revenue] = await Promise.all([
    User.countDocuments({ roleName: 'patient', isActive: true }),
    User.countDocuments({ roleName: 'doctor', isActive: true }),
    Clinic.countDocuments({ isActive: true }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
    Appointment.countDocuments({ status: 'pending' }),
    // To calculate revenue, we would need to join Appointment and Doctor.
    // For simplicity, returning 0 if not calculated yet. Mongoose aggregation can do this.
    Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: 'userId', as: 'doc' } },
      { $unwind: '$doc' },
      { $group: { _id: null, total: { $sum: '$doc.price' } } }
    ]).then(res => res[0]?.total || 0)
  ]);
  
  return {
    totalPatients: TotalPatients,
    totalDoctors: TotalDoctors,
    totalClinics: TotalClinics,
    totalAppointments: TotalAppointments,
    totalAppointmentsThisMonth: TotalAppointments, // Assuming this for now, or implement a real count
    todayAppointments: TodayAppointments,
    pendingAppointments: PendingAppointments,
    revenue: Revenue
  };
};

module.exports = {
  getAdminStats
};
