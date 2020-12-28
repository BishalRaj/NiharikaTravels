const mongoose = require("mongoose");
const LocationSchema = new mongoose.Schema({
  location: {
    type: String,
  },
});

const Location = mongoose.model(
  "Location",
  LocationSchema
);
module.exports = Location;
