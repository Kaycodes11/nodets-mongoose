import express from "express";
import * as UserController from "../controllers/user.controller";

const router = express.Router();

// @protected
router.get("/", UserController.getUsers);

// @protected
router.post("/seed", UserController.seedUsers);

// @protected
router.get(":/userId", UserController.getUser);

// @protected
router.put("/:userId", UserController.updateUser);

// @protected
router.delete("/:userId", UserController.deleteUser);

// @public
router.post("/available/username", UserController.isUsernameAvailable);

export default router;
