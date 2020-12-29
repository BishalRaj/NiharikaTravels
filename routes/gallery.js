"use strict";
const express = require("express");
const router = express.Router();
const GalleryModal = require("../modal/galleryModal");
// const LocationModal = require("../modal/locationModal");
// route for views
router.get("/", async (req, res) => {
  var user_id = "",
    name = "",
    thumbnail = "",
    role = "",
    logged_in = false,
    has_data = false;

  let data = await GalleryModal.find().populate("location");
  // let location = await LocationModal.find();
  let distinctlocation = [];

  if (req.user) {
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      res.redirect("/admin");
    } else {
      user_id = req.user._id;
      name = req.user.name;
      thumbnail = req.user.thumbnail;
      role = req.user.role;
      logged_in = true;
    }
  }

  if (data && data.length && data.length > 0) {
    has_data = true;
    distinctlocation = [...new Set(data.map((x) => x.location.location))];
  }

  res.render("gallery", {
    title: "Gallery",
    admin: false,
    data: data,
    location: distinctlocation,
    // location: location,
    user_id: user_id,
    name: name,
    thumbnail: thumbnail,
    logged_in: logged_in,
    role: role,
    has_data: has_data,
  });
});

module.exports = router;
