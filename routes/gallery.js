"use strict";
const express = require("express");
const router = express.Router();
const GalleryModal = require("../modal/galleryModal");
const LocationModal = require("../modal/locationModal");
// route for views
router.get("/", async (req, res) => {
  let data = await GalleryModal.find().populate("location");
  let location = await LocationModal.find();
  let distinctlocation = [...new Set(data.map((x) => x.location.location))];

  res.render("gallery", {
    title: "Gallery",
    admin: false,
    data: data,
    location: distinctlocation,
    // location: location,
  });
});

module.exports = router;
