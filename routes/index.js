"use strict";
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const UserModal = require("../modal/userModal");
const GalleryModal = require("../modal/galleryModal");
const LocationModal = require("../modal/locationModal");
const TestimonialModal = require("../modal/testimonialModal");

var today = new Date();
var date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
var time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
// route for views
router
  .get("/", async (req, res) => {
    if (req.user) {
      if (req.user.role === "admin" || req.user.role === "super_admin") {
        res.redirect("/admin");
      } else {
        let gallery = await GalleryModal.find().limit(6).populate("location");
        let testimonial = await TestimonialModal.find().limit(6);
        res.render("home", {
          title: "Niharika",
          admin: false,
          logged_in: true,
          gallery: gallery,
          testimonial: testimonial,
          user_id: req.user._id,
          name: req.user.name,
          thumbnail: req.user.thumbnail,
          role: req.user.role,
        });
      }
    } else {
      let gallery = await GalleryModal.find().limit(6).populate("location");
      let testimonial = await TestimonialModal.find().limit(6);
      res.render("home", {
        title: "Niharika",
        admin: false,
        logged_in: false,
        gallery: gallery,
        testimonial: testimonial,
        user_id: "",
        name: "",
        thumbnail: "",
        role: "",
      });
    }
  })
  .get("/locations", async (req, res) => {
    var regex = new RegExp(req.query["term"], "i");
    var locationFilter = LocationModal.find(
      { location: regex },
      { location: 1 }
    )
      .sort({ updated_at: -1 })
      .sort({ created_at: -1 })
      .limit(25);

    locationFilter.exec((err, data) => {
      var result = [];
      if (!err) {
        if (data && data.length && data.length > 0) {
          data.forEach((location) => {
            let obj = {
              label: location.location,
            };
            result.push(obj);
          });
        }
      }
      res.jsonp(result);
    });
  })
  .get("/login", async (req, res) => {
    if (req.user) {
      res.redirect("/");
    } else {
      let users = await UserModal.count();
      if (users <= 0) {
        const data = new UserModal({
          name: "admin",
          email: "admin@admin.com",
          password: "admin",
          role: "a",
          addedOn: date,
        });
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(data.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            data.password = hash;
            // Save user
            data
              .save()
              .then((data) => {
                res.redirect("/admin");
              })
              .catch((err) => {
                req.flash("error_msg", "Please try again");
                res.redirect("/login");
              });
          })
        );
      }
      res.render("login", {
        title: "Niharika",
        admin: false,
        logged_in: false,
        message: "",
      });
    }
  })
  .post("/login", (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, next);
  })
  .get(
    "/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  )
  .get(
    "/google/redirect",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  )
  .get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/");
  })
  .post("/inquiry", (req, res) => {
    var { email, message } = req.body;
    if (!email || !message) {
      req.flash("error_msg", "Cannot Inquire on empty fields.");
      res.redirect(req.get("referer"));
    } else {
      const data = new InquiryModal({
        email: email,
        message: message,
        time: date + " , " + time,
      });

      data
        .save()
        .then((data) => {
          req.flash("success_msg", "Feedback Sent");
          res.redirect(req.get("referer"));
        })
        .catch((err) => {
          req.flash("error_msg", "Cannot send Feedback ");
          res.redirect(req.get("referer"));
        });
    }
  });

module.exports = router;
