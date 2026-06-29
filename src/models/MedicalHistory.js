const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  diagnosis: { type: String, required: true },
  treatmentPlan: { type: String },
  prescription: { type: String },
  attachments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
