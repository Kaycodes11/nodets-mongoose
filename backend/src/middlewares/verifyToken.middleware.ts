import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { HttpException } from "./error.middleware";
import User from "../models/user.model";
import { refreshToken } from "../controllers/auth.controller";
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.body.refreshToken.trim() ?? "";
  try {
    // 1. verify refreshToken
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_IS as string
    );
    if (!decoded) return next(new HttpException(401, "Invalid RefreshToken"));

    // 2. validate  refreshToken against db
    const user = await User.findOne({
      // @ts-ignore
      _id: decoded.id,
      "refreshTokens.web": refreshToken,
    }).select("-password -__v"); // -refreshTokens._id

    if (!user) {
      return next(new HttpException(401, "No such token found within mongodb"));
    }
    req.user = user.toJSON({ virtuals: true, getters: true });
    return next();
  } catch (e: any) {
    if (e instanceof JsonWebTokenError) {
      return next(new HttpException(401, "Invalid RefreshToken"));
    }
    return next(new HttpException(e.status, e.message));
  }
};

export const verifyAccessTokenToAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1].trim() ?? "";
  try {
    // verify token with secret
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_IS as string
    ) as { id: string; email: string; iat: number; exp: number };

    // verify given accessToken with db
    const user =
      decoded.id &&
      (await User.findOne({
        _id: new Types.ObjectId(decoded.id),
        refreshTokens: { $elemMatch: { accessToken: accessToken } },
      }).select("-password -__v"));

    if (!user)
      return next(
        new HttpException(400, "This accessToken is not found within db")
      );

    // noinspection SpellCheckingInspection
    const userInfo = user.toJSON({ virtuals: true, getters: true });

    // now just assign it req.user = userInfo; so that next middleware can use it as needed
    req.user = userInfo;
    next();
  } catch (e: any) {
    if (e instanceof TokenExpiredError) {
      console.log("TokenExpiredError Here");
      return next(new HttpException(401, e.message));
    }
    if (e instanceof JsonWebTokenError) {
      console.log("JsonWebTokenError Here");
      return next(new HttpException(401, "invalid token"));
    }

    next(new HttpException(e.status, e.message));
  }
};

export const removeToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1].trim() ?? "";
  try {
    // @ts-ignore
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refreshTokens: { accessToken: accessToken } },
    }).then((document) => {
      console.log(document);
    });
    next();
  } catch (e: any) {
    next(e);
  }
};
