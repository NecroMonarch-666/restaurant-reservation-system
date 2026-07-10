const express = require('express');
const {
  createReservation,
  getReservations,
  getReservation,
  cancelReservation,
  getAvailableSlots,
  getStats,
} = require('../controllers/reservationController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/slots', protect, getAvailableSlots);
router.get('/stats', protect, isAdmin, getStats);
router.get('/', protect, getReservations);
router.get('/:id', protect, getReservation);
router.post('/', protect, createReservation);
router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;
