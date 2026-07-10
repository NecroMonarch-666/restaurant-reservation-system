const mongoose = require('mongoose');

const TIME_SLOTS = [
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
];

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD'
      required: true,
    },
    timeSlot: {
      type: String,
      enum: TIME_SLOTS,
      required: true,
    },
    guestsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Prevent double booking: same table, same date, same timeSlot, not cancelled
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
module.exports.TIME_SLOTS = TIME_SLOTS;
