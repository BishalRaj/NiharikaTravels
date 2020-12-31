const mongoose = require("mongoose");
const InstaSchema = new mongoose.Schema({
  link: {
    type: String,
  },
  image: {
    type: String,
  },
  addedOn: {
    type: String,
  },
});

const Insta = mongoose.model("Insta", InstaSchema);
module.exports = Insta;
