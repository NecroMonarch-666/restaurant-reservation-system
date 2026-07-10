const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// GET /api/reservations/slots?date=YYYY-MM-DD&guests=N
const getAvailableSlots = async (req, res) => {
  try {
    const { date, guests } = req.query;
    if (!date || !guests) {
      return res.status(400).json({ message: 'date and guests are required' });
    }
    const guestsCount = parseInt(guests, 10);

    // Get all active tables with enough capacity
    const tables = await Table.find({ isActive: true, capacity: { $gte: guestsCount } }).sort({ capacity: 1 });

    // Get all confirmed reservations on this date
    const booked = await Reservation.find({ date, status: 'confirmed' }).select('table timeSlot');

    const bookedMap = {}; // tableId -> Set of timeSlots
    for (const r of booked) {
      const tid = r.table.toString();
      if (!bookedMap[tid]) bookedMap[tid] = new Set();
      bookedMap[tid].add(r.timeSlot);
    }

    const availableSlots = Reservation.TIME_SLOTS.map((slot) => {
      // Pick the smallest table with this slot free
      const availableTable = tables.find((t) => {
        const tid = t._id.toString();
        return !bookedMap[tid] || !bookedMap[tid].has(slot);
      });
      return {
        slot,
        available: !!availableTable,
        tableId: availableTable ? availableTable._id : null,
        tableNumber: availableTable ? availableTable.number : null,
      };
    });

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { date, timeSlot, guestsCount } = req.body;
    if (!date || !timeSlot || !guestsCount) {
      return res.status(400).json({ message: 'date, timeSlot, and guestsCount are required' });
    }
    const n = parseInt(guestsCount, 10);

    // Find optimal table: active, sufficient capacity, not already booked for this slot
    const tables = await Table.find({ isActive: true, capacity: { $gte: n } }).sort({ capacity: 1 });
    if (!tables.length) {
      return res.status(400).json({ message: 'No tables available for that guest count' });
    }

    const booked = await Reservation.find({ date, timeSlot, status: 'confirmed' }).select('table');
    const bookedIds = new Set(booked.map((r) => r.table.toString()));

    const table = tables.find((t) => !bookedIds.has(t._id.toString()));
    if (!table) {
      return res.status(409).json({ message: 'No tables available for the selected time slot' });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: table._id,
      date,
      timeSlot,
      guestsCount: n,
    });

    await reservation.populate(['user', 'table']);
    res.status(201).json(reservation);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'That table is already booked for this slot' });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations  (admin: all or by date; customer: own)
const getReservations = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'customer') {
      filter.user = req.user._id;
    }
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email')
      .populate('table', 'number capacity')
      .sort({ date: -1, createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/:id
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('table', 'number capacity');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // Customers can only see their own
    if (req.user.role === 'customer' && reservation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/reservations/:id/cancel
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (req.user.role === 'customer' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();
    await reservation.populate(['user', 'table']);
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/stats  — admin
const getStats = async (req, res) => {
  try {
    const total = await Reservation.countDocuments();
    const active = await Reservation.countDocuments({ status: 'confirmed' });
    const cancelled = await Reservation.countDocuments({ status: 'cancelled' });
    const totalTables = await Table.countDocuments({ isActive: true });

    // Tables that have at least one confirmed booking today
    const today = new Date().toISOString().slice(0, 10);
    const bookedToday = await Reservation.distinct('table', { date: today, status: 'confirmed' });
    const availableTables = totalTables - bookedToday.length;

    res.json({ total, active, cancelled, availableTables });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReservation, getReservations, getReservation, cancelReservation, getAvailableSlots, getStats };
