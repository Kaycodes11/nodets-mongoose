import passport from "passport";
import { Strategy } from "passport-local";
import User, { IUser } from "../models/user.model";
import { Request } from "express";
import { HydratedDocument } from "mongoose";

// serializing: takes data from req.user & add it req.session.passport.user = user; [[not required to do with jwt]
// however it should be only required to use when getting data from session (or when using session-based authentication or such)
// passport.serializeUser((user: any, done) => {
//   // now passport takes user data that assigned to req.user from local Strategy
//   console.log(`serializedUser: `, user);
//   // now, invoke done with user.id as 2nd argument then it'll make req.session.passport.user = userId
//   done(null, user.id);
// });

// deserializing: takes data from req.session.passport.user then do something & assign that value to req.user; [not required to do with jwt]
// however it should be only required to use when getting data from session (or when using session-based authentication or such)
// passport.deserializeUser(async (id, done) => {
//   console.log(`deserializedUser: `, id);
//   // it takes the id from when it's serialized to req.session.passport.user; then using that id query database;
//   // then add the "query result" to req.user i.e. basically by invoking done(null, user), then it added to req.user
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       throw new Error("User is not found"); // or, return done(null, false)
//     }
//     done(null, user); // return done(null, user)
//   } catch (error) {
//     done(error, null);
//   }
// });

// checking the given password against database i.e. passport-local strategy
// to use request object set  passReqToCallback: true
const LocalStrategy = () => {
  // whichever route uses passport.authenticate('local') as middleware, from there it will take email & password, & then
  // it'll look for that user within db via 'email' if found add to req.user = query result & if no user then done(null, false) or throw error
  passport.use(
    new Strategy(
      { usernameField: "email", passReqToCallback: true },
      async (req: Request, email: string, password: string, done) => {
        try {
          if (!email || !password) throw new Error("Missing credentials");
          const user = await User.findOne({ email });
          if (!user) throw new Error("User is not found");
          const isValid = await user.comparePassword(password);
          if (isValid) {
            // no need to serialize if not using session-based authentication system
            done(null, user); // done(null, user) does req.user = user
          } else done(null, null);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};

export { LocalStrategy };
