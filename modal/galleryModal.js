const mongoose = require("mongoose");
const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
  addedOn: {
    type: String,
  },
});

const Gallery = mongoose.model("Gallery", GallerySchema);
module.exports = Gallery;
