"use strict";
const express = require("express");
const router = express.Router();
const ReserveModal = require("../modal/hotelReserveModal");
var user_id = "",
  name = "",
  thumbnail = "",
  role = "",
  logged_in = false;
// route for views
router.get("/", async (req, res) => {
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
  console.log("I am @ bookings");
  ReserveModal.find({ user_id: req.user._id })
    .populate({
      path: "hotel_id",
      populate: {
        path: "location",
        model: "Location",
      },
    })
    .then((result) => {
      if (result && result.length && result.length > 0) {
        console.log(result[0].hotel_id.location.location);
        res.render("bookings", {
          title: "My Bookings",
          admin: false,
          data: result,
          has_data: result.length > 0 ? true : false,
          sum: "",
          user_id: user_id,
          name: name,
          thumbnail: thumbnail,
          role: role,
          logged_in: logged_in,
        });
      } else {
        console.log("@else");
      }
    });
});

module.exports = router;
