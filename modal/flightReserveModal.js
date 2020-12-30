const mongoose = require("mongoose");
const FlightReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
  },
  addedOn: {
    type: String,
  },
});

const FlightReservation = mongoose.model(
  "FlightReservation",
  FlightReservationSchema
);
module.exports = FlightReservation;
