const User = require("../models/user"); // Import User Model Schema
const Task = require("../models/task");
const jwt = require("jsonwebtoken"); // Compact, URL-safe means of representing claims to be transferred between two parties.
const config = require("../config/database");

module.exports = (router) => {
  /* ==============
     Register Route
  ============== */
  router.post("/register", (req, res) => {
    // Check if email was provided
    if (!req.body.email) {
      res.json({ success: false, message: "You must provide an e-mail" }); // Return error
    } else {
      // Check if username was provided
      if (!req.body.firstName) {
        res.json({ success: false, message: "You must provide a username" }); // Return error
      } else {
        // Check if password was provided
        if (!req.body.password) {
          res.json({ success: false, message: "You must provide a password" }); // Return error
        } else {
          // Create new user object and apply user input
          let user = new User({
            email: req.body.email.toLowerCase(),
            firstName: req.body.firstName.toLowerCase(),
            lastName: req.body.lastName.toLowerCase(),
            password: req.body.password,
          });
          // Save user to database
          user.save((err) => {
            // Check if error occured
            if (err) {
              // Check if error is an error indicating duplicate account
              console.log(err);
            } else {
              res.json({ success: true, message: "Acount registered!" }); // Return success
            }
          });
        }
      }
    }
  });

  router.post("/editUser/:id", async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      user.email = req.body.email || user.email;
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;

      if (req.body.password) {
        user.password = req.body.password;
      }
      const editUser = await user.save();
      res.json({
        _id: editUser._id,
        email: editUser.email,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });

  /* ============================================================
     Route to check if user's email is available for registration
  ============================================================ */
  router.get("/checkEmail/:email", (req, res) => {
    // Check if email was provided in paramaters
    if (!req.params.email) {
      res.json({ success: false, message: "E-mail was not provided" }); // Return error
    } else {
      // Search for user's e-mail in database;
      User.findOne({ email: req.params.email }, (err, user) => {
        if (err) {
          res.json({ success: false, message: err }); // Return connection error
        } else {
          // Check if user's e-mail is taken
          if (user) {
            res.json({ success: false, message: "E-mail is already taken" }); // Return as taken e-mail
          } else {
            res.json({ success: true, message: "E-mail is available" }); // Return as available e-mail
          }
        }
      });
    }
  });

  /* ===============================================================
     Route to check if user's username is available for registration
  =============================================================== */
  router.get("/checkUsername/:username", (req, res) => {
    // Check if username was provided in paramaters
    if (!req.params.firstName) {
      res.json({ success: false, message: "Username was not provided" }); // Return error
    } else {
      // Look for username in database
      User.findOne({ firstName: req.params.firstName }, (err, user) => {
        // Check if connection error was found
        if (err) {
          res.json({ success: false, message: err }); // Return connection error
        } else {
          // Check if user's username was found
          if (user) {
            res.json({ success: false, message: "Username is already taken" }); // Return as taken username
          } else {
            res.json({ success: true, message: "Username is available" }); // Return as vailable username
          }
        }
      });
    }
  });

  /* ========
  LOGIN ROUTE
  ======== */
  router.post("/login", (req, res) => {
    // Check if username was provided
    if (!req.body.email) {
      res.json({ success: false, message: "No username was provided" }); // Return error
    } else {
      // Check if password was provided
      if (!req.body.password) {
        res.json({ success: false, message: "No password was provided." }); // Return error
      } else {
        // Check if username exists in database
        User.findOne({ email: req.body.email.toLowerCase() }, (err, user) => {
          // Check if error was found
          if (err) {
            res.json({ success: false, message: err }); // Return error
          } else {
            // Check if username was found
            if (!user) {
              res.json({ success: false, message: "Username not found." }); // Return error
            } else {
              const validPassword = user.comparePassword(req.body.password); // Compare password provided to password in database
              // Check if password is a match
              if (!validPassword) {
                res.json({ success: false, message: "Password invalid" }); // Return error
              } else {
                const token = jwt.sign({ userId: user._id }, "crypto", {
                  expiresIn: "24h",
                }); // Create a token for client
                res.json({
                  success: true,
                  message: "Success!",
                  token: token,
                  user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                  },
                }); // Return success and token to frontend
              }
            }
          }
        });
      }
    }
  });

  function check(fn) {
    return function (req, res, next) {
      if (
        req.originalUrl == "/questions/allQuestions" &&
        req.method === "GET"
      ) {
        next();
      } else {
        fn(req, res, next);
      }
    };
  }

  router.use(
    check((req, res, next) => {
      const token = req.headers["authorization"]; // Create token found in headers
      // Check if token was found in headers

      if (!token) {
        res.json({ success: false, message: "No tokennnnn provided" }); // Return error
      } else {
        // Verify the token is valid
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          // Check if error is expired or invalid
          if (err) {
            res.json({ success: false, message: "Tokenn invalid: " + err }); // Return error for token validation
          } else {
            req.decoded = decoded; // Create global variable to use in any request beyond
            next(); // Exit middleware
          }
        });
      }
    })
  );

  /* ===============================================================
     Route to get user's profile data
  =============================================================== */
  router.get("/profile", (req, res) => {
    // Search for user in database
    User.findOne({ _id: req.decoded.userId })
      .select("username email isAdmin")
      .exec((err, user) => {
        // Check if error connecting
        if (err) {
          res.json({ success: false, message: err }); // Return error
        } else {
          // Check if user was found in database
          if (!user) {
            res.json({ success: false, message: "User not found" }); // Return error, user was not found in db
          } else {
            res.json({ success: true, user: user }); // Return success, send user object to frontend for profile
          }
        }
      });
  });
  /* ===============================================================
     Route to get all users
  =============================================================== */
  router.get("/users", (req, res) => {
    User.find({}, (err, users) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!users) {
          res.json({ success: false, message: "No users found." });
        } else {
          res.json({ success: true, users: users });
        }
      }
    })
      .select("-password")
      .sort({ _id: -1 });
  });
  /* ===============================================================
     Route to delete user
  =============================================================== */
  router.delete("/deleteUser/:id", async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      const projectsByUser = await Task.find({ projectAdmin: req.params.id });
      //Brise sve Taskove na kojima je user bio
      await Task.updateMany({}, { $pull: { users: req.params.id } });
      //Brise sve Taskove u todos na kojima je user bio
      await Task.updateMany(
        {},
        {
          $pull: {
            "todos.users": req.params.id,
          },
        }
      );
      //Brise sve projekte na kojima je user projekt admin
      await Task.deleteMany({
        projectAdmin: req.params.id,
      });

      await user.remove();
      res.json({ message: "User removed" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });

  /* ===============================================================
     Route to get user's public profile data
  =============================================================== */
  router.get("/publicProfile/:username", (req, res) => {
    // Check if username was passed in the parameters
    if (!req.params.username) {
      res.json({ success: false, message: "No username was provided" }); // Return error message
    } else {
      // Check the database for username
      User.findOne({ username: req.params.username })
        .select("username email")
        .exec((err, user) => {
          // Check if error was found
          if (err) {
            res.json({ success: false, message: "Something went wrong." }); // Return error message
          } else {
            // Check if user was found in the database
            if (!user) {
              res.json({ success: false, message: "Username not found." }); // Return error message
            } else {
              res.json({ success: true, user: user }); // Return the public user's profile data
            }
          }
        });
    }
  });

  return router; // Return router object to main index.js
};
