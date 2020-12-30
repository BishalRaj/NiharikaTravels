const mongoose = require("mongoose");
const HotelReservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
  addedOn: {
    type: String,
  },
});

const HotelReservation = mongoose.model(
  "HotelReservation",
  HotelReservationSchema
);
module.exports = HotelReservation;
