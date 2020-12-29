"use strict";
const express = require("express");
const router = express.Router();
const HotelModal = require("../modal/hotelModal");
const LocationModal = require("../modal/locationModal");
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
    console.log(data);
    res.render("flight", {
      title: "Flights",
      admin: false,
      data: data,
      has_data: true,
      sum: "",
      location: "",
      user_id: user_id,
      name: name,
      thumbnail: thumbnail,
      role: role,
      logged_in: logged_in,
    });
  })
  // .get("/filter", async (req, res) => {
  //   var has_data = false;
  //   let { name, price, star } = req.query;
  //   console.log(req.query);
  //   HotelModal.find({
  //     name: name,
  //     price: { $lte: price },
  //     stars: { $gte: star },
  //   })
  //     .sort({ stars: 1, price: -1 })
  //     .populate("location")
  //     .then((hotel_data) => {
  //       console.log(hotel_data);

  //       if (hotel_data && hotel_data.length && hotel_data.length > 0) {
  //         has_data = true;

  //         res.render("hotel", {
  //           title: "Hotels",
  //           admin: false,
  //           has_data: has_data,
  //           data: hotel_data,
  //         });
  //       } else {
  //         console.log("in else");
  //         console.log(has_data);
  //         res.render("hotel", {
  //           title: "Hotels",
  //           admin: false,
  //           has_data: has_data,
  //           data: "",
  //         });
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // })
  .get("/search", (req, res) => {
    var has_data = false;
    let { location, date, people, price, star } = req.query;
    var required_room = Math.round(
      people / 6 > 0 && people / 6 < 1 ? 1 : people / 6
    );

    LocationModal.find({ location: location })
      .then((location_data) => {
        if (location_data && location_data.length && location_data.length > 0) {
          HotelModal.find({
            location: new ObjectId(location_data[0]._id),
            available_room: {
              $gte: required_room ? required_room : 1,
              // : Math.round(people / 6 > 0 && people / 6 < 1 ? 1 : people / 6),
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
          });
        }
      })
      .catch((err) => console.log(err));
  });

module.exports = router;
