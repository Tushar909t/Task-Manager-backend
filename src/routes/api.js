const express = require("express");
const UserController = require("../controllers/UserController");
const TaskController = require("../controllers/TaskController");
const AuthVerifyMiddleware = require("../Middleware/AuthVerifyMiddleware");
const router = express.Router();

// C=Create
router.post("/Registrations", UserController.Registrations);

router.post("/Logins", UserController.Logins);
// R=Read

// // U=Update
router.post(
  "/UpdateProfiles",
  AuthVerifyMiddleware,
  UserController.UpdateProfiles
);

// // Delete

// // Task-Create
router.post("/CreateTask", AuthVerifyMiddleware, TaskController.CreateTask);
// Task-Update
router.get(
  "/UpdateTask/:id/:status",
  AuthVerifyMiddleware,
  TaskController.UpdateTask
);
// // Task-Delete
router.delete(
  "/DeleteTask/:id",
  AuthVerifyMiddleware,
  TaskController.DeleteTask
);
// Task-ListStatus
router.get(
  "/ListTaskByStatus/:status",
  AuthVerifyMiddleware,
  TaskController.ListTaskByStatus
);
// // Task-List-Count
router.get(
  "/TaskStausCount",
  AuthVerifyMiddleware,
  TaskController.TaskStausCount
);

module.exports = router;
