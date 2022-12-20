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
) => {};


export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};