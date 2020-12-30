"use strict";
const express = require("express");
const router = express.Router();
const HotelReserveModal = require("../modal/hotelReserveModal");
const FlightReserveModal = require("../modal/flightReserveModal");
const HotelReservation = require("../modal/hotelReserveModal");
var user_id = "",
  name = "",
  thumbnail = "",
  role = "",
  logged_in = false;
// route for views
router
  .get("/", async (req, res) => {
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
    const hotelData = await HotelReserveModal.find({
      user_id: req.user._id,
    }).populate({
      path: "hotel_id",
      populate: {
        path: "location",
        model: "Location",
      },
    });

    const flightData = await FlightReserveModal.find({
      user: req.user._id,
    }).populate({
      path: "flight",
      populate: {
        path: "airline",
        model: "Airline",
      },
    });

    res.render("bookings", {
      title: "My Bookings",
      admin: false,
      hotelData: hotelData,
      flightData: flightData,
      has_hotel_data: hotelData.length > 0 ? true : false,
      has_flight_data: flightData.length > 0 ? true : false,
      user_id: user_id,
      name: name,
      thumbnail: thumbnail,
      role: role,
      logged_in: logged_in,
    });
  })
  .post("/cancel/flight", (req, res) => {
    FlightReserveModal.deleteOne({ _id: req.body.flight }, function (err) {
      if (err) {
        req.flash("error_msg", "Could not cancel Flight");
      } else {
        req.flash("success_msg", "Flight Canceled");
      }
      res.redirect("/bookings");
    });
  })
  .post("/cancel/hotel", (req, res) => {
    HotelReservation.deleteOne({ _id: req.body.hotel }, function (err) {
      if (err) {
        req.flash("error_msg", "Could not cancel Hotel");
      } else {
        req.flash("success_msg", "Hotel Canceled");
      }
      res.redirect("/bookings");
    });
  });

module.exports = router;
