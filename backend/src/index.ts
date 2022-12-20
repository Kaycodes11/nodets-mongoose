import * as dotenv from "dotenv";
import express, {
  Application,
  ErrorRequestHandler,
} from "express";
import cookieParser from "cookie-parser";
import { Server } from "http";
import helmet from "helmet";
import cors from "cors";
import database from "./database";
import AllRoutes from "./routes";
import mongoose from "mongoose";
import passport from "passport";
import { JwtStrategy } from "./middlewares/jwtStrategy.middleware";
import { LocalStrategy } from "./middlewares/localStrategy.middleware";

dotenv.config();

const app: Application = express();

// global middlewares

app.use(express.json()); // parse json from request
app.use(express.urlencoded({ extended: true })); // basically parse urlencoded data from request
app.use(cookieParser()); // to parse cookie from req that set via res.cookie("token", value)
app.use(helmet()); // adds some necessary security config
app.use(cors()); // whether allowed to make request from any or specific urls like ({origin: "http://booking-netlify.app"})

// to utilize the req.session, need to use express-session either with MemoryStore or specific db session store like MongoSession
// express-session middleware must be used before app.use(passport.session()) to actually store the session in memory/database from passport
// this 'session' middleware is responsible for setting (http-only) cookies onto browser (show application -> cookies tab) and then convert
// cookies sent by browsers (within request) into req.session object. Passport js only uses this `req.session` object to deserialize the user.

// resource: https://stackoverflow.com/questions/36486397/passport-login-and-persisting-session

app.use(passport.initialize()); // passport initialized

// JwtStrategy registered so now whichever route use passport.authenticate('jwt') strategy; it'll refer to below implementation/logic

JwtStrategy(process.env.ACCESS_TOKEN_SECRET_IS!);
LocalStrategy();

// global routes
app.use(AllRoutes);

// error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(status).json({ message: err.message });
};

app.use(errorHandler);

const port = process.env.PORT || 8800;

// database and server init
try {
  database();
  // https://stackoverflow.com/questions/54485936/what-are-all-the-mongoose-events-and-where-are-they-documented

  const server: Server = app.listen(port, (): void => {
    console.log(`server started at ${port}`);
  });
} catch (e: any) {
  console.log(e.message);
}
