const UserModel = require("../models/UserModel");
const OTPModel = require("../models/OTPModel");
const SendEmailUtility = require("../utility/SendEmailUtility");
const jwt = require("jsonwebtoken");

// Registration

exports.Registrations = (req, res) => {
  let reqBody = req.body;
  UserModel.create(reqBody, (err, data) => {
    if (err) {
      res.status(401).json({ status: "fail", data: err });
    } else {
      res.status(201).json({ status: "success", data: data });
    }
  });
};

// exports.Registrations = (req, res) => {
//   let reqBody = req.body;
//   UserModel.aggregate(
//     [{ $match: reqBody }, { $project: { email: 1 } }],
//     (err, data) => {
//       if (data.length > 0) {
//         res.status(402).json({ status: "fail", data: "email exits" });
//       } else {
//         UserModel.create(reqBody, (err, data) => {
//           if (err) {
//             res.status(401).json({ status: "fail", data: err });
//           } else {
//             res.status(201).json({ status: "success", data: data });
//           }
//         });
//       }
//     }
//   );
// };

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

exports.DeleteUser = (req, res) => {
  let id = req.params.id;
  let user = { _id: id };
  UserModel.deleteMany(user, (err, data) => {
    if (err) {
      res.status(401).json({ status: "Fail", data: err });
    } else {
      res.status(201).json({ status: "Success", data: data });
    }
  });
};

exports.UserProfileDetails = (req, res) => {
  let email = req.headers["email"];
  UserModel.aggregate(
    [
      {
        $match: { email: email },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          mobile: 1,
          photo: 1,
          password: 1,
        },
      },
    ],
    (err, data) => {
      if (err) {
        res.status(401).json({ status: "Fail", data: err });
      } else {
        res.status(201).json({ status: "Success", data: data });
      }
    }
  );
};

exports.RecoveryVerifyEmail = async (req, res) => {
  let email = req.params.email;
  let OTPcode = Math.floor(100000 + Math.random() * 900000);
  try {
    let UserCount = await UserModel.aggregate([
      { $match: { email: email } },
      { $count: "total" },
    ]);
    if (UserCount.length > 0) {
      let CreateOtp = await OTPModel.create({ email: email, otp: OTPcode });
      let SendEmail = await SendEmailUtility(
        email,
        "Your PIN Code is =" + OTPcode,
        "Task Manager PIN Verification"
      );
      res.status(201).json({ status: "success", data: SendEmail });
    } else {
      res.status(402).json({ status: "fail", data: "User Not Found" });
    }
  } catch (e) {
    res.status(401).json({ status: "fail", data: e });
  }
};

exports.RecoveryVerifyOTP = async (req, res) => {
  let email = req.params.email;
  let OTPcode = req.params.otp;
  let status = 0;
  try {
    let OTPCount = await OTPModel.aggregate([
      { $match: { email: email, otp: OTPcode, status: status } },
      { $count: "total" },
    ]);
    if (OTPCount.length > 0) {
      let OTPUpdate = await OTPModel.updateOne(
        {
          email: email,
          otp: OTPcode,
          status: 0,
        },
        { status: 1 }
      );
      res.status(201).json({ status: "success", data: OTPUpdate });
    } else {
      res.status(401).json({ status: "success", data: "Invalid OTP Code" });
    }
  } catch (e) {
    res.status(402).json({ status: "fail", data: e });
  }
};

exports.ResetPassword = async (req, res) => {
  let email = req.body["email"];
  let OTPCode = req.body["OTP"];
  let NewPass = req.body["password"];
  let statusUpdate = 1;

  try {
    let OTPUsedCount = await OTPModel.aggregate([
      { $match: { email: email, otp: OTPCode, status: statusUpdate } },
      { $count: "total" },
    ]);
    if (OTPUsedCount.length > 0) {
      let PassUpdate = await UserModel.updateOne(
        { email: email },
        { password: NewPass }
      );
      res.status(200).json({ status: "success", data: PassUpdate });
    } else {
      res.status(401).json({ status: "fail", data: "Invalid Request" });
    }
  } catch (e) {
    res.status(402).json({ status: "fail", data: e });
  }
};
