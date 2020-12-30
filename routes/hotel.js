"use strict";
const express = require("express");
const router = express.Router();
const HotelModal = require("../modal/hotelModal");
const LocationModal = require("../modal/locationModal");
const ReserveModal = require("../modal/hotelReserveModal");
var ObjectId = require("mongoose").Types.ObjectId;
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

    var data = await HotelModal.find().populate("location");
    res.render("hotel", {
      title: "Hotels",
      admin: false,
      data: data,
      has_data: data.length > 0 ? true : false,
      sum: "",
      location: "",
      user_id: user_id,
      name: name,
      thumbnail: thumbnail,
      role: role,
      logged_in: logged_in,
    });
  })
  .get("/deal/:id", async (req, res) => {
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
    let id = req.params.id;
    console.log(id);
    var data = await HotelModal.find({ _id: id }).populate("location");
    res.render("individualHotel", {
      title: "Hotels",
      admin: false,
      data: data[0],
      has_data: data.length > 0 ? true : false,
      sum: "",
      location: "",
      user_id: user_id,
      name: name,
      thumbnail: thumbnail,
      role: role,
      logged_in: logged_in,
    });
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
          user_id: req.user._id,
          hotel_id: req.body.hotel_id,
        });

        data.save().then((reserved) => {
          res.redirect("/bookings");
        });
      }
    } else {
      req.flash("error_msg", "You must Login to book hotels.");
      res.redirect("/login");
    }
  })

  .get("/search", (req, res) => {
    var has_data = false;
    let { location, date, people, price, star } = req.query;
    var required_room = Math.round(
      people / 6 > 0 && people / 6 < 1 ? 1 : people / 6
    );

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

    LocationModal.find({ location: location })
      .then((location_data) => {
        if (location_data && location_data.length && location_data.length > 0) {
          HotelModal.find({
            location: new ObjectId(location_data[0]._id),
            available_room: {
              $gte: required_room ? required_room : 1,
            },
            price: {
              $lte: price ? price : 1000,
            },
            stars: {
              $gte: star ? star : 1,
            },
          })
            .sort({ stars: 1, price: -1 })
            .populate("location")
            .then((val) => {
              if (val && val.length && val.length > 0) {
                has_data = true;
              } else {
                has_data = false;
              }
              res.render("hotel", {
                title: "Hotels",
                admin: false,
                has_data: has_data,
                data: val,
                sum: val.length,
                location: location,
                user_id: user_id,
                name: name,
                thumbnail: thumbnail,
                role: role,
                logged_in: logged_in,
              });
            })
            .catch((err) => console.log(err));
        } else {
          res.render("hotel", {
            title: "Hotels",
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
      .catch((err) => console.log(err));
  });

module.exports = router;
