const mongoose = require("mongoose");
const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
  stars: {
    type: Number,
  },
  price: {
    type: Number,
  },
  room: {
    type: Number,
  },
  description: {
    type: String,
  },
  available_room: {
    type: Number,
  },
  addedOn: {
    type: String,
  },
});

const Hotel = mongoose.model("Hotel", HotelSchema);
module.exports = Hotel;
