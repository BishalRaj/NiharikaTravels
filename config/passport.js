// const LocalStrategy=require('passport-strategy');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../modal/userModal");
const keys = require("./keys");

var today = new Date();
var date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      var name = email.substr(0, email.indexOf("@"));
      // match user
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            const data = new User({
              name: name,
              email: email,
              password: password,
              role: "user",
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
                  .then((newUser) => {
                    console.log(newUser);
                    return done(null, newUser);
                  })
                  .catch((err) => {
                    return done(null, false, {
                      message: "Invalid credentials. Please try again!",
                    });
                  });
              })
            );
          }

          // check password
          bcrypt.compare(password.toString(), user.password, (err, isMatch) => {
            if (err) {
              return done(null, false, {
                message: "Invalid credentials. Please try again!",
              });
            }

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        callbackURL: "/google/redirect",
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
      },
      (accessToken, refreshToken, profile, done) => {
        // passport callback function

        User.findOne({ googleId: profile.id }).then((currentUser) => {
          if (!currentUser) {
            // if not registered-create new user
            new User({
              name: profile._json.name,
              email: profile._json.email,
              googleId: profile.id,
              thumbnail: profile._json.picture,
              role: "user",
              addedOn: date,
              // googleId: profile._json.sub,  //for google id from JSON
            })
              .save()
              .then((newUser) => {
                return done(null, newUser);
              });
          } else {
            return done(null, currentUser);
          }
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
