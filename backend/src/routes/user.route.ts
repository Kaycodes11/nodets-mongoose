import express from "express";
import * as UserController from "../controllers/user.controller";

const router = express.Router();

router.get("/", UserController.getUsers);

router.get(":/userId", UserController.getUser);

router.put("/:userId", UserController.updateUser);

router.delete("/:userId", UserController.deleteUser);

router.post("/seed", UserController.seedUsers);

router.get("/available/:userId");

export default router;
