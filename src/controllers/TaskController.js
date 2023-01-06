const TaskModel = require("../models/TaskModel");

exports.CreateTask = (req, res) => {
  let reqBody = req.body;
  reqBody.email = req.headers["email"];
  TaskModel.create(reqBody, (err, data) => {
    if (err) {
      res.status(200).json({ status: "Fail", data: err });
    } else {
      res.status(201).json({ status: "Success", data: data });
    }
  });
};

exports.UpdateTask = (req, res) => {
  let id = req.params.id;
  let status = req.params.status;
  let Query = { _id: id };
  let reqBody = { status: status };

  TaskModel.updateOne(Query, reqBody, (err, data) => {
    if (err) {
      res.status(200).json({ status: "Fail", data: err });
    } else {
      res.status(201).json({ status: "Success", data: data });
    }
  });
};

exports.DeleteTask = (req, res) => {
  let id = req.params.id;
  let Query = { _id: id };
  TaskModel.remove(Query, (err, data) => {
    if (err) {
      res.status(200).json({ status: "Fail", data: err });
    } else {
      res.status(201).json({ status: "Success", data: data });
    }
  });
};

exports.ListTaskByStatus = (req, res) => {
  let status = req.params.status;
  let email = req.headers["email"];

  TaskModel.aggregate(
    [
      { $match: { status: status, email: email } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          status: 1,
          createDate: {
            $dateToString: {
              date: "$createDate",
              format: "%d-%m-%Y",
            },
          },
        },
      },
    ],
    (err, data) => {
      if (err) {
        res.status(200).json({ status: "Fail", data: err });
      } else {
        res.status(201).json({ status: "Success", data: data });
      }
    }
  );
};

exports.TaskStausCount = (req, res) => {
  let email = req.headers["email"];

  TaskModel.aggregate(
    [
      { $match: { email: email } },
      { $group: { _id: "$status", sum: { $count: {} } } },
    ],
    (err, data) => {
      if (err) {
        res.status(200).json({ status: "Fail", data: err });
      } else {
        res.status(201).json({ status: "Success", data: data });
      }
    }
  );
};
