import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import { HttpException } from "../middlewares/error.middleware";
import { userSeed } from "../seeds/user.seed";

export const seedUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await User.deleteMany({}); // delete all users before seeding users if needed
    const seededUsers = await User.insertMany(userSeed);
    res.json(seededUsers).status(201);
  } catch (e: any) {
    console.log("ERROR HERE", e);
    next(new HttpException(e.status, e.message));
  }
};

export const isUsernameAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = req.body.username;
    const user = await User.find()
      .where({ username: new RegExp('^' + username + '$', 'i') })
      .select("-password -__v");
    console.log(`user`, user);
    if (user.length) {
      throw new HttpException(409, "This Username is already taken");
    } else {
      res.send("username available to use").status(200);
    }
  } catch (e: any) {
    next(e);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await User.find();
  res.status(200).json(users);
};
