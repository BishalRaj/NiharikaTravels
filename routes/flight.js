"use strict";
const express = require("express");
const router = express.Router();
const FlightModal = require("../modal/flightModal");
const LocationModal = require("../modal/locationModal");
const ReserveModal = require("../modal/flightReserveModal");
var ObjectId = require("mongoose").Types.ObjectId;
var user_id = "",
  name = "",
  thumbnail = "",
  role = "",
  logged_in = false;
var today = new Date();
var date =
  today.getFullYear() +
  "-" +
  (today.getMonth() + 1) +
  "-" +
  (today.getDate() - 1);
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

    var data = "";
    res.render("flight", {
      title: "Flights",
      admin: false,
      data: data,
      has_data: false,
      sum: "",
      location: "",
      user_id: user_id,
      name: name,
      thumbnail: thumbnail,
      role: role,
      logged_in: logged_in,
    });
  })
  .get("/search", async (req, res) => {
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

    var has_data = false;
    let { price, departure, arrival } = req.query;
    const chkDeparture = await LocationModal.find({ location: departure });
    const chkArrival = await LocationModal.find({ location: arrival });
    if (
      chkDeparture &&
      chkDeparture.length &&
      chkDeparture.length > 0 &&
      chkArrival &&
      chkArrival.length &&
      chkArrival.length > 0
    ) {
      FlightModal.find({
        departure: chkDeparture[0].location,
        arrival: chkArrival[0].location,
        departure_date: {
          $gte: date,
        },
        price: {
          $lte: price ? price : 1000,
        },
      })
        .sort({ price: 1 })
        .populate("airline")
        .then((val) => {
          if (val && val.length && val.length > 0) {
            has_data = true;
          } else {
            has_data = false;
          }

          res.render("flight", {
            title: "Flights",
            admin: false,
            has_data: has_data,
            data: val,
            sum: val.length,
            departure: val[0].departure,
            arrival: val[0].arrival,
            user_id: user_id,
            name: name,
            thumbnail: thumbnail,
            role: role,
            logged_in: logged_in,
          });
        })
        .catch((err) => console.log(err));
    } else {
      req.flash("error_msg", "No flights found");
      res.render("flight", {
        title: "Flights",
        admin: false,
        has_data: has_data,
        data: "",
        sum: "",
        location: "",
        user_id: user_id,
        name: name,
        thumbnail: thumbnail,
        role: role,
        logged_in: logged_in,
      });
    }
  })
  .post("/reserve", async (req, res) => {
    if (req.user) {
      if (req.user.role === "admin" || req.user.role === "super_admin") {
        res.redirect("/admin");
      } else {
        user_id = req.user._id;
        name = req.user.name;
        thumbnail = req.user.thumbnail;
        role = req.user.role;
        logged_in = true;

        let data = new ReserveModal({
          user: user_id,
          flight: req.body.flight,
        });

        data.save().then((reserved) => {
          req.flash("success_msg", "Flight Booked.");
          res.redirect("/bookings");
        });
      }
    } else {
      req.flash("error_msg", "You must Login to book Flights.");
      res.redirect("/login");
    }
  });

module.exports = router;
