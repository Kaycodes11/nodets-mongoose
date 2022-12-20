import { Request } from "express";
import passport from "passport";
import {
  ExtractJwt,
  Strategy,
  VerifiedCallback,
} from "passport-jwt";
import User from "../models/user.model";

// just extracts "bearer token" from header then verify that with the given secret here
export const JwtStrategy = (accessTokenSecretIs: string) => {
  passport.use(
    new Strategy(
      {
        secretOrKey: accessTokenSecretIs,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true,
      },
      async (req: Request, payload: any, done: VerifiedCallback) => {
        try {
          const user = await User.findOne({ email: payload.email });
          if (!user) {
            return done(null, false); // or make/insert a new user if needed
          };
          done(null, user); // now, here it does req.user = user
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
