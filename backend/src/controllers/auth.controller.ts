import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import { HydratedDocument, Types } from "mongoose";
import passport from "passport";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { HttpException } from "../middlewares/error.middleware";

export const registerWithEmailOrMobile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("register with email or mobile");
};

export const verifyMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = new Types.ObjectId(req.body.userId);
    const user = await User.findById(userId).select("_id isValidated") as Pick<IUser, '_id' | 'isValidated'>;
    if(user.isValidated) {
      return next(
        new HttpException(400, "You have already validated your account")
      );
    }
    console.log(`isValidated`, user);
    res.json({ m: "verify email" }).status(200);
  } catch (e) {
    next(e);
  }
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

  const storeTokensToDb = { accessToken, refreshToken };

  // update the user with refreshToken
  const loggedInUser = await User.findByIdAndUpdate(
    userInfo._id,
    {
      $addToSet: { refreshTokens: storeTokensToDb },
    },
    { new: true, upsert: true }
  ).select("-password -refreshTokens -__v");

  // max  age value is in ms
  res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 600000 });

  res.cookie("refresh-jwt", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });

  res.status(200).json(loggedInUser);
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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // simply found the accessToken from db the pull it
  res.status(200).json({ message: "logged out" });
};

export const invalidateTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).select("-password -__v");
    if (!user) return next(new HttpException(400, "Invalid userId"));

    if (!(user.refreshTokens || []).length) {
      return next(new HttpException(400, "No token to invalidate here"));
    }

    (user.refreshTokens || []).forEach(
      (token: { accessToken: string; refreshToken: string }) => {
        jwt.verify(
          token.accessToken,
          process.env.ACCESS_TOKEN_SECRET_IS as string,
          (error: any) => {
            if (error instanceof JsonWebTokenError)
              return next(new HttpException(401, "Invalid Token"));
            if (error instanceof TokenExpiredError) {
              console.log(`Token Error as invalidating: `, token.accessToken);
              // since on this iteration this token.accessToken seems to have TokenExpiredError so just simply pull it from db
              user.updateOne(
                {
                  $pull: { refreshTokens: { accessToken: token.accessToken } },
                },
                { new: true }
              );
            }
          }
        );
      }
    );

    res.status(200).json({ message: "Your unused token has been removed" });
  } catch (e) {
    next(e);
  }
};
