import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import { HydratedDocument } from "mongoose";
import passport from "passport";
import { TokenExpiredError } from "jsonwebtoken";
import { HttpException } from "../middlewares/error.middleware";

export const registerWithEmailOrMobile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("register with email or mobile");
};

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("verify");
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, ...userInfo } = (
    req.user as HydratedDocument<IUser>
  ).toJSON({ virtuals: true, getters: true });

  // prettier-ignore
  // @ts-ignore
  const { accessToken, refreshToken } = User.createTokens({ _id: userInfo._id, email: userInfo.email, });

  // update the user with refreshToken
  await User.findByIdAndUpdate(
    userInfo._id,
    {
      $set: { "refreshTokens.web": refreshToken },
    },
    { new: true, upsert: true }
  );

  // max  age value is in ms
  res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 60000 });

  res.cookie("refresh-jwt", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });

  res.status(200).json(userInfo);
};
export const reset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("reset password");
};
export const socialLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("social login");
};

export const test = async (req: Request, res: Response, next: NextFunction) => {
  res.send("protected");
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`req.user`, req.user);
  // so far, verified refreshToken, and it exists within db
  // so now generate a new pair of access and refresh token & and the save the new refresh token to db against the very user before sending

  // @ts-ignore
  // prettier-ignore
  const { accessToken, refreshToken } = User.createTokens({ _id: req.user._id, email: req.user.email, });

  // update the user with refreshToken
  await User.findByIdAndUpdate(
    // @ts-ignore
    req.user._id,
    {
      $set: { "refreshTokens.web": refreshToken },
    },
    { new: true, upsert: true }
  );

  // max  age value is in ms
  res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 60000 });

  res.cookie("refresh-jwt", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });

  res
    .status(200)
    .json({ accessToken: accessToken, refreshToken: refreshToken });
};
