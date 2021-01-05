"use strict";
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const fs = require("fs");
const LocationModal = require("../../modal/locationModal");
const GalleryModal = require("../../modal/galleryModal");
const MessageModal = require("../../modal/messageModal");
const UserModal = require("../../modal/userModal");
const HotelModal = require("../../modal/hotelModal");
const TestimonialModal = require("../../modal/testimonialModal");
const FlightModal = require("../../modal/flightModal");
const AirlineModal = require("../../modal/airlineModal");
const HotelReservation = require("../../modal/hotelReserveModal");
const FlightReservation = require("../../modal/flightReserveModal");
const Insta = require("../../modal/instaModal");
var today = new Date();
var date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
var time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

var addedOn = date;
// route for views
router
  .get("/", (req, res) => {
    let role;
    if (!req.user.role) {
      UserModal.find({ role: "super_admin" })
        .then((result) => {
          role = result.length >= 1 ? "admin" : "super_admin";
          UserModal.findOneAndUpdate({ _id: req.user._id }, { role: role })
            .then((result) => {
              role = result.role;
            })
            .catch((err) => {});
        })
        .catch((err) => (role = "admin"));
    } else {
      role = req.user.role;
    }
    res.render("admin/index", {
      name: req.user.name,
      role: role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Dashboard",
      admin: true,
    });
  })
  .get("/admission", async (req, res) => {
    let data = await AdmissionModal.find().sort([["appliedOn", -1]]);
    res.render("admin/admission/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Admissions",
      admin: true,
      data: data,
    });
  });

router
  .get("/user", async (req, res) => {
    if (req.user.role != "super_admin") {
      res.redirect("/admin");
    }
    let data = await UserModal.find();
    res.render("admin/user/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "User",
      admin: true,
      data: data,
    });
  })
  .get("/user/add", (req, res) => {
    if (req.user.role != "super_admin") {
      res.redirect("/admin");
    }
    res.render("admin/user/add", {
      name: req.user.name,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Add User",
      admin: true,
    });
  })
  .get("/user/edit/:id", async (req, res) => {
    if (req.user.role != "super_admin") {
      res.redirect("/admin");
    }
    let data = await UserModal.findById(req.params.id);
    res.render("admin/user/edit", {
      name: req.user.name,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Edit User",
      admin: true,
      data: data,
    });
  })
  .get("/user/editpwd/:id", async (req, res) => {
    let data = await UserModal.findById(req.params.id);
    res.render("admin/user/editpwd", {
      name: req.user.name,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Edit Password",
      admin: true,
      data: data,
    });
  })
  .post("/user/add", (req, res) => {
    if (req.user.role != "super_admin") {
      res.redirect("/admin");
    }
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      req.flash("error_msg", "Please fill in all fields");
      res.redirect("/admin/user/add");
    } else {
      UserModal.find({ email: email })
        .then((result) => {
          if (result.length <= 0) {
            const data = new UserModal({
              name: name,
              email: email,
              password: password,
              role: role,
              addedOn: addedOn,
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
                    req.flash("success_msg", "User added");
                    res.redirect("/admin/user/add");
                  })
                  .catch((err) => {
                    req.flash("error_msg", err);
                    res.redirect("/admin/user/add");
                  });
              })
            );
          } else {
            req.flash("error_msg", "User already exist");
            res.redirect("/admin/user/add");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  })
  .post("/user/delete", (req, res) => {
    if (req.user.role != "super_admin") {
      res.redirect("/admin");
    }

    UserModal.deleteOne({ _id: req.body.e_id }, function (err) {
      if (err) {
        req.flash("error_msg", "Could not remove User");
        res.redirect("/admin/user");
      }
      req.flash("success_msg", "User removed ");
      res.redirect("/admin/user");
    });
  })
  .post("/user/update", (req, res) => {
    if (req.user.role != "super_admin") {
      res.redirect("/admin");
    }
    let { id, name, email, role } = req.body;
    if (!name || !email || !role) {
      req.flash("error_msg", "Please fill all fields");
      res.redirect("/admin/user/edit/" + id);
    } else {
      let data = {
        name: name,
        email: email,
        role: role,
      };
      UserModal.findOneAndUpdate({ _id: id }, data)
        .then((result) => {
          req.flash("success_msg", "User details Updated");
          res.redirect("/admin/user");
        })
        .catch((err) => {
          req.flash("error_msg", "User details Update Failed");
          res.redirect("/admin/user");
        });
    }
  })
  .post("/user/updatepwd", (req, res) => {
    let { id, password, password2 } = req.body;
    if (!password || !password2) {
      req.flash("error_msg", "Please fill all fields");
      res.redirect("/admin/user/editpwd/" + id);
    } else if (password != password2) {
      req.flash("error_msg", "Password did not match");
      res.redirect("/admin/user/editpwd/" + id);
    } else {
      let data = {
        password: password,
      };
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(data.password, salt, (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          data.password = hash;
          // Update user
          UserModal.findOneAndUpdate({ _id: id }, data)
            .then((result) => {
              req.flash("success_msg", "User password Updated");
              res.redirect("/admin/user/editpwd/" + id);
            })
            .catch((err) => {
              req.flash("error_msg", "User password Update Failed");
              res.redirect("/admin/user/editpwd/" + id);
            });
        })
      );
    }
  });
router.get("/message", async (req, res) => {
  let data = await MessageModal.find().sort([["time", -1]]);
  res.render("admin/message/view", {
    name: req.user.name,
    id: req.user._id,
    role: req.user.role,
    title: "Niharika",
    thumbnail: req.user.thumbnail,
    heading: "Message",
    admin: true,
    data: data,
  });
});

router
  .get("/gallery", async (req, res) => {
    await GalleryModal.find()
      .populate("location")
      .then((data) => {
        console.log(data);
        res.render("admin/gallery/view", {
          name: req.user.name,
          id: req.user._id,
          role: req.user.role,
          thumbnail: req.user.thumbnail,
          title: "Niharika-Admin",
          heading: "View Gallery",
          admin: true,
          data: data,
        });
      })
      .catch((err) => {
        console.log(err);
        req.flash("error_msg", "Error viewing gallery.");
        res.redirect("/admin");
      });
  })
  .get("/gallery/add/:id", async (req, res) => {
    let selected = req.params.id;
    let data = await LocationModal.find();
    res.render("admin/gallery/add", {
      name: req.user.name,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Add Gallery",
      admin: true,
      selected: selected,
      data: data,
    });
  })
  .get("/gallery/add", async (req, res) => {
    res.render("admin/gallery/add", {
      name: req.user.name,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Add Gallery",
      admin: true,
      selected: "",
    });
  })
  .get("/gallery/edit/:id", async (req, res) => {
    let location = await LocationModal.find();
    GalleryModal.findById(req.params.id)
      .populate("location")
      .then((data) => {
        res.render("admin/gallery/edit", {
          name: req.user.name,
          id: req.user._id,
          role: req.user.role,
          thumbnail: req.user.thumbnail,
          title: "Niharika-Admin",
          heading: "Edit Gallery",
          admin: true,
          data: data,
          location: location,
        });
      })
      .catch();
  })
  .post("/gallery/add", async (req, res) => {
    var { title, image, location } = req.body;
    var getLocation;

    await LocationModal.find({ location: location }).then(async (result) => {
      if (!result || !result.length || result.length <= 0) {
        let locationData = new LocationModal({
          location: location,
        });
        await locationData.save().then((data) => {
          getLocation = data._id;
        });
      } else {
        getLocation = result[0]._id;
      }

      const data = new GalleryModal({
        title: !title ? "Niharika" : title,
        image: !image ? "default.jpg" : image,
        location: getLocation,
        addedOn: addedOn,
      });
      await data
        .save()
        .then(() => {
          req.flash("success_msg", "Image added to gallery");
          res.redirect("/admin/gallery/add");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error_msg", "Error performing the task");
          res.redirect("/admin/gallery/add");
        });
    });
  })
  .post("/gallery/delete", (req, res) => {
    try {
      fs.unlink(
        __dirname + "../../../public/image/uploads/" + req.body.image_name,
        (err) => {}
      );
      fs.unlink(
        __dirname + "../../../public/image/uploads/o_" + req.body.image_name,
        (err) => {}
      );
    } catch (error) {}
    GalleryModal.deleteOne({ _id: req.body.g_id }, function (err) {
      if (err) return handleError(err);
      req.flash("success_msg", "Item Deleted");
      res.redirect("/admin/gallery");
    });
  })
  .post("/gallery/update", (req, res) => {
    let { id, title, location, description } = req.body;
    let image = req.body.image ? req.body.image : req.body.oldimage;
    if (req.body.image) {
      try {
        fs.unlink(
          __dirname + "../../../public/image/uploads/" + req.body.oldimage,
          (err) => {}
        );
        fs.unlink(
          __dirname + "../../../public/image/uploads/o_" + req.body.oldimage,
          (err) => {}
        );
      } catch (error) {}
    }
    let data = {
      title: title,
      location: location,
      description: description,
      image: image,
    };
    GalleryModal.findOneAndUpdate({ _id: id }, data)
      .then((result) => {
        req.flash("success_msg", "Gallery Updated");
        res.redirect("/admin/gallery");
      })
      .catch((err) => {
        req.flash("error_msg", "Gallery Update Failed");
        res.redirect("/admin/gallery");
      });
  });

router
  .get("/hotel", async (req, res) => {
    let data = await HotelModal.find().populate("location");
    res.render("admin/hotel/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View hotel",
      admin: true,
      data: data,
    });
  })
  .get("/hotel/add", (req, res) => {
    res.render("admin/hotel/add", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Add hotel",
      admin: true,
    });
  })
  .get("/hotel/bookings", async (req, res) => {
    let data = await HotelReservation.find().populate([
      { path: "user_id", model: "User" },
      {
        path: "hotel_id",
        populate: {
          path: "location",
          model: "Location",
        },
      },
    ]);
    res.render("admin/hotel/bookings", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View hotel",
      admin: true,
      data: data,
    });
  })
  .get("/hotel/edit/:id", async (req, res) => {
    let location = await LocationModal.find();
    let data = await HotelModal.findById(req.params.id).populate("location");
    res.render("admin/hotel/edit", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Edit hotel",
      admin: true,
      data: data,
      location: location,
    });
  })
  .post("/hotel/add", async (req, res) => {
    let {
      name,
      image,
      location,
      stars,
      price,
      room,
      description,
      getLocation,
    } = req.body;
    if (!name) {
      req.flash("error_msg", "Please fill in all fields");
      res.redirect("/admin/hotel/add");
    } else if (!image) {
      req.flash("error_msg", "Image not found");
      res.redirect("/admin/hotel/add");
    } else {
      await LocationModal.find({ location: location }).then(async (result) => {
        if (!result || !result.length || result.length <= 0) {
          let locationData = new LocationModal({
            location: location,
          });
          await locationData.save().then((data) => {
            getLocation = data._id;
          });
        } else {
          getLocation = result[0]._id;
        }

        const data = new HotelModal({
          name: name,
          image: image,
          location: getLocation,
          stars: stars,
          price: price,
          room: room,
          available_room: room,
          description: description,
          addedOn: addedOn,
        });

        data
          .save()
          .then((data) => {
            req.flash("success_msg", "hotel added");
            res.redirect("/admin/hotel/add");
          })
          .catch((err) => {
            console.log(err);
            req.flash("error_msg", "Something went wrong.");
            res.redirect("/admin/hotel/add");
          });
      });
    }
  })
  .post("/hotel/delete", (req, res) => {
    try {
      fs.unlink(
        __dirname + "../../../public/image/uploads/" + req.body.image_name,
        (err) => {}
      );
      fs.unlink(
        __dirname + "../../../public/image/uploads/o_" + req.body.image_name,
        (err) => {}
      );
    } catch (error) {}
    HotelModal.deleteOne({ _id: req.body.e_id }, function (err) {
      if (err) return handleError(err);
      req.flash("success_msg", "hotel Deleted");
      res.redirect("/admin/hotel");
    });
  })
  .post("/hotel/update", (req, res) => {
    let { id, name, location, stars, price, room, description } = req.body;
    let image = req.body.image ? req.body.image : req.body.oldimage;
    if (req.body.image) {
      try {
        fs.unlink(
          __dirname + "../../../public/image/uploads/" + req.body.oldimage,
          (err) => {}
        );
      } catch (error) {}
    }
    let data = {
      id: id,
      name: name,
      image: image,
      location: location,
      stars: stars,
      price: price,
      room: room,
      available_room: room,
      description: description,
    };
    HotelModal.findOneAndUpdate({ _id: id }, data)
      .then((result) => {
        req.flash("success_msg", "Hotel Updated");
        res.redirect("/admin/hotel");
      })
      .catch((err) => {
        req.flash("error_msg", "Hotel Update Failed");
        res.redirect("/admin/hotel");
      });
  });

router
  .get("/flight", async (req, res) => {
    let data = await FlightModal.find().populate("airline");
    res.render("admin/flight/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View Flight Route",
      admin: true,
      data: data,
    });
  })
  .get("/flight/add", async (req, res) => {
    let airline = await AirlineModal.find();
    res.render("admin/flight/add", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Add flight",
      admin: true,
      airline: airline,
    });
  })
  .get("/flight/bookings", async (req, res) => {
    let data = await FlightReservation.find().populate([
      { path: "user", model: "User" },
      {
        path: "flight",
        populate: {
          path: "airline",
          model: "Airline",
        },
      },
    ]);

    console.log(data);
    res.render("admin/flight/bookings", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View Flight Reservations",
      admin: true,
      data: data,
    });
  })
  .get("/flight/edit/:id", async (req, res) => {
    let airline = await AirlineModal.find();
    let data = await FlightModal.findById(req.params.id).populate("airline");
    res.render("admin/flight/edit", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Edit flight",
      admin: true,
      data: data,
      airline: airline,
    });
  })
  .post("/flight/add", async (req, res) => {
    let {
      airline,
      departure,
      arrival,
      departure_date,
      arrival_date,
      price,
      seats,
    } = req.body;
    if (!departure) {
      req.flash("error_msg", "Please fill in all fields");
      res.redirect("/admin/flight/add");
    } else {
      await LocationModal.find({ location: departure }).then(async (result) => {
        if (!result || !result.length || result.length <= 0) {
          let locationData = new LocationModal({
            location: departure,
          });
          await locationData.save();
        }
      });
      await LocationModal.find({ location: arrival }).then(async (result) => {
        if (!result || !result.length || result.length <= 0) {
          let locationData = new LocationModal({
            location: arrival,
          });
          await locationData.save();
        }
      });

      const data = new FlightModal({
        airline: airline,
        departure: departure,
        arrival: arrival,
        departure_date: departure_date,
        arrival_date: arrival_date,
        available_seats: seats,
        price: price,
        addedOn: addedOn,
      });

      data
        .save()
        .then((data) => {
          req.flash("success_msg", "flight added");
          res.redirect("/admin/flight/add");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error_msg", "Something went wrong.");
          res.redirect("/admin/flight/add");
        });
    }
  })
  .post("/flight/delete", (req, res) => {
    try {
      fs.unlink(
        __dirname + "../../../public/image/uploads/" + req.body.image_name,
        (err) => {}
      );
      fs.unlink(
        __dirname + "../../../public/image/uploads/o_" + req.body.image_name,
        (err) => {}
      );
    } catch (error) {}
    FlightModal.deleteOne({ _id: req.body.e_id }, function (err) {
      if (err) return handleError(err);
      req.flash("success_msg", "flight Deleted");
      res.redirect("/admin/flight");
    });
  })
  .post("/flight/update", (req, res) => {
    let { id, airline, departure, arrival, price, seats } = req.body;

    let data = {
      id: id,
      airline: airline,
      departure: departure,
      arrival: arrival,
      available_seats: seats,
      price: price,
      addedOn: addedOn,
    };
    FlightModal.findOneAndUpdate({ _id: id }, data)
      .then((result) => {
        req.flash("success_msg", "flight Updated");
        res.redirect("/admin/flight");
      })
      .catch((err) => {
        req.flash("error_msg", "flight Update Failed");
        res.redirect("/admin/flight");
      });
  });

router
  .get("/insta", async (req, res) => {
    let data = await Insta.find();
    res.render("admin/insta/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View Instagram Post",
      admin: true,
      data: data,
    });
  })
  .get("/insta/add", async (req, res) => {
    res.render("admin/insta/add", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Add Instagram Post",
      admin: true,
    });
  })
  .get("/insta/edit/:id", async (req, res) => {
    let data = await Insta.findById(req.params.id);
    res.render("admin/insta/edit", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Edit Instagram Post",
      admin: true,
      data: data,
    });
  })
  .post("/insta/add", async (req, res) => {
    let { image, link } = req.body;
    if (!image && !link) {
      req.flash("error_msg", "Please fill in all fields");
      res.redirect("/admin/insta/add");
    } else {
      const data = new Insta({
        link: link,
        image: image,
        addedOn: addedOn,
      });

      data
        .save()
        .then((data) => {
          req.flash("success_msg", "Instagram Post Added");
          res.redirect("/admin/insta/add");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error_msg", "Something went wrong.");
          res.redirect("/admin/insta/add");
        });
    }
  })
  .post("/insta/delete", (req, res) => {
    try {
      fs.unlink(
        __dirname + "../../../public/image/uploads/" + req.body.image_name,
        (err) => {}
      );
      fs.unlink(
        __dirname + "../../../public/image/uploads/o_" + req.body.image_name,
        (err) => {}
      );
    } catch (error) {}
    Insta.deleteOne({ _id: req.body.e_id }, function (err) {
      if (err) return handleError(err);
      req.flash("success_msg", "Instagram Post Deleted");
      res.redirect("/admin/insta");
    });
  })
  .post("/insta/update", (req, res) => {
    let { id, link, image } = req.body;

    let data = {
      id: id,
      link,
      image,
    };
    Insta.findOneAndUpdate({ _id: id }, data)
      .then((result) => {
        req.flash("success_msg", "Instagram Post Updated");
        res.redirect("/admin/insta");
      })
      .catch((err) => {
        req.flash("error_msg", "Instagram Update Failed");
        res.redirect("/admin/insta");
      });
  });

router
  .get("/location", async (req, res) => {
    let data = await LocationModal.find();
    res.render("admin/location/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View available location",
      admin: true,
      data: data,
    });
  })
  .get("/location/add", (req, res) => {
    res.render("admin/location/add", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Add Country",
      admin: true,
    });
  })
  .get("/location/edit/:id", async (req, res) => {
    let data = await LocationModal.findById(req.params.id);
    res.render("admin/location/edit", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Edit Country",
      admin: true,
      data: data,
    });
  })
  .post("/location/add", (req, res) => {
    const { location } = req.body;
    if (!location) {
      req.flash("error_msg", "Please fill in all fields");
      res.redirect("/admin/location/add");
    } else {
      const data = new LocationModal({
        location: location,
      });

      data
        .save()
        .then((data) => {
          req.flash("success_msg", "Location added");
          res.redirect("/admin/location/add");
        })
        .catch((err) => {
          req.flash("error_msg", err);
          res.redirect("/admin/location/add");
        });
    }
  })
  // .post("/location/delete", (req, res) => {
  //   LocationModal.deleteOne({ _id: req.body.c_id }, function (err) {
  //     if (err) return handleError(err);

  //     req.flash("success_msg", "Location Deleted");
  //     res.redirect("/admin/location");
  //   });
  // })
  .post("/location/update", (req, res) => {
    let { id, location } = req.body;
    LocationModal.findOneAndUpdate({ _id: id }, { location: location })
      .then((result) => {
        req.flash("success_msg", "Country Updated");
        res.redirect("/admin/location");
      })
      .catch((err) => {
        console.log(err);
        req.flash("error_msg", "Country Update Failed");
        res.redirect("/admin/location");
      });
  });

// Airline

router
  .get("/airline", async (req, res) => {
    await AirlineModal.find()
      .then((data) => {
        res.render("admin/airline/view", {
          name: req.user.name,
          id: req.user._id,
          role: req.user.role,
          thumbnail: req.user.thumbnail,
          title: "Niharika-Admin",
          heading: "View Airlines",
          admin: true,
          data: data,
        });
      })
      .catch((err) => {
        console.log(err);
        req.flash("error_msg", "Error viewing airlines.");
        res.redirect("/admin");
      });
  })
  .get("/airline/add", async (req, res) => {
    res.render("admin/airline/add", {
      name: req.user.name,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      id: req.user._id,
      title: "Niharika-Admin",
      heading: "Add Airlines",
      admin: true,
      selected: "",
    });
  })
  .get("/airline/edit/:id", async (req, res) => {
    AirlineModal.findById(req.params.id)
      .then((data) => {
        console.log(data);
        res.render("admin/airline/edit", {
          name: req.user.name,
          id: req.user._id,
          role: req.user.role,
          thumbnail: req.user.thumbnail,
          title: "Niharika-Admin",
          heading: "Edit Airline detail",
          admin: true,
          data: data,
        });
      })
      .catch();
  })
  .post("/airline/add", async (req, res) => {
    var { name, image } = req.body;

    await AirlineModal.find({ name: name }).then((result) => {
      if (!result || !result.length || result.length <= 0) {
        const data = new AirlineModal({
          name: name,
          image: image,
          addedOn: addedOn,
        });

        data
          .save()
          .then(() => {
            req.flash("success_msg", "Airline Registered");
            res.redirect("/admin/airline/add");
          })
          .catch((err) => {
            console.log(err);
            req.flash("error_msg", "Error performing the task");
            res.redirect("/admin/airline/add");
          });
      } else {
        req.flash("error_msg", "Airline already registered");
        res.redirect("/admin/airline/add");
      }
    });
  })
  .post("/airline/delete", (req, res) => {
    try {
      fs.unlink(
        __dirname + "../../../public/image/uploads/" + req.body.image_name,
        (err) => {}
      );
      fs.unlink(
        __dirname + "../../../public/image/uploads/o_" + req.body.image_name,
        (err) => {}
      );
    } catch (error) {}
    AirlineModal.deleteOne({ _id: req.body.g_id }, function (err) {
      if (err) return handleError(err);
      req.flash("success_msg", "Item Deleted");
      res.redirect("/admin/airline");
    });
  })
  .post("/airline/update", (req, res) => {
    let { id, name } = req.body;
    let image = req.body.image ? req.body.image : req.body.oldimage;
    if (req.body.image) {
      try {
        fs.unlink(
          __dirname + "../../../public/image/uploads/" + req.body.oldimage,
          (err) => {}
        );
        fs.unlink(
          __dirname + "../../../public/image/uploads/o_" + req.body.oldimage,
          (err) => {}
        );
      } catch (error) {}
    }
    let data = {
      name: name,
      image: image,
    };
    AirlineModal.findOneAndUpdate({ _id: id }, data)
      .then((result) => {
        req.flash("success_msg", "Airline Updated");
        res.redirect("/admin/airline");
      })
      .catch((err) => {
        req.flash("error_msg", "Airline Update Failed");
        res.redirect("/admin/airline");
      });
  });

// Airline end

router
  .get("/testimonial", async (req, res) => {
    let data = await TestimonialModal.find();
    res.render("admin/testimonial/view", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "View Testimonial",
      admin: true,
      data: data,
    });
  })
  .get("/testimonial/add", (req, res) => {
    res.render("admin/testimonial/add", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      thumbnail: req.user.thumbnail,
      title: "Niharika-Admin",
      heading: "Add Testimonial",
      admin: true,
    });
  })
  .get("/testimonial/edit/:id", async (req, res) => {
    let data = await TestimonialModal.findById(req.params.id);
    res.render("admin/testimonial/edit", {
      name: req.user.name,
      id: req.user._id,
      role: req.user.role,
      title: "Niharika",
      heading: "Edit Testimonial",
      admin: true,
      data: data,
    });
  })
  .post("/testimonial/add", (req, res) => {
    const { name, testimonial, location } = req.body;
    if (!testimonial) {
      req.flash("error_msg", "Please fill in all fields");
      res.redirect("/admin/testimonial/add");
    } else {
      const data = new TestimonialModal({
        name: name,
        testimonial: testimonial,
        location: location,
        addedOn: addedOn,
      });

      data
        .save()
        .then((data) => {
          req.flash("success_msg", "Testimonial added");
          res.redirect("/admin/testimonial/add");
        })
        .catch((err) => {
          req.flash("error_msg", err);
          res.redirect("/admin/testimonial/add");
        });
    }
  })
  .post("/testimonial/delete", (req, res) => {
    TestimonialModal.deleteOne({ _id: req.body.id }, function (err) {
      if (err) return handleError(err);

      req.flash("success_msg", "Testimonial Deleted");
      res.redirect("/admin/testimonial");
    });
  })
  .post("/testimonial/update", (req, res) => {
    let { id, name, testimonial, location } = req.body;
    let data = { name: name, testimonial: testimonial, location: location };
    TestimonialModal.findOneAndUpdate({ _id: id }, data)
      .then((result) => {
        req.flash("success_msg", "Testimonial Updated");
        res.redirect("/admin/testimonial");
      })
      .catch((err) => {
        console.log(err);
        req.flash("error_msg", "Testimonial Update Failed");
        res.redirect("/admin/testimonial");
      });
  });

router.use((req, res, next) => {
  const error = new Error("404: Not found");
  res.render("error.ejs", {
    name: req.user.name,
    id: req.user._id,
    role: req.user.role,
    thumbnail: req.user.thumbnail,
    title: error,
    admin: true,
  });
});

module.exports = router;
