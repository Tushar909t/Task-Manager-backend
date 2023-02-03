const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");

// Registration
exports.Registrations = (req, res) => {
  let reqBody = req.body;
  let email = req.body.email;
  UserModel.findOne(reqBody, email, (err, data) => {
    if (data) {
      res.status(402).json({ message: "fail", data: err });
    } else {
      UserModel.create(reqBody, (err, data) => {
        if (err) {
          res.status(401).json({ status: "fail", data: err });
        } else {
          res.status(200).json({ status: "success", data: data });
        }
      });
    }
  });
};

// UserLogin

exports.Logins = (req, res) => {
  let reqBody = req.body;
  UserModel.aggregate(
    [
      { $match: reqBody },
      {
        $project: {
          _id: 0,
          email: 1,
          firstName: 1,
          lastName: 1,
          mobile: 1,
          photo: 1,
        },
      },
    ],
    (err, data) => {
      if (err) {
        res.status(401).json({ status: "Fail", data: err });
      } else {
        if (data.length > 0) {
          let Payload = {
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            data: data[0]["email"],
          };
          let token = jwt.sign(Payload, "SecretKey123456789");
          res
            .status(201)
            .json({ status: "Success", token: token, data: data[0] });
        } else {
          res.status(400).json({ status: "aunthorized" });
        }
      }
    }
  );
};

exports.UpdateProfiles = (req, res) => {
  let email = req.headers["email"];
  let reqBody = req.body;
  UserModel.updateOne({ email: email }, reqBody, (err, data) => {
    if (err) {
      res.status(400).json({ status: "fail", data: err });
    } else {
      res.status(201).json({ status: "success", data: data });
    }
  });
};
