import * as dotenv from "dotenv";
import express, { Application, ErrorRequestHandler } from "express";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";
import { Server } from "http";
import helmet from "helmet";
import cors from "cors";
import database from "./database";
import AllRoutes from "./routes";
import passport from "passport";
import { JwtStrategy } from "./middlewares/jwtStrategy.middleware";
import { LocalStrategy } from "./middlewares/localStrategy.middleware";
import * as path from "path";
import transporter from "./mail";

dotenv.config();

const app: Application = express();

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      getShortComment(comment: string) {
        if (comment.length < 64) {
          return comment;
        }

        return comment.substring(0, 61) + "...";
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views")); // https://stackabuse.com/guide-to-handlebars-templating-engine-for-node/

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
app.get("/", (req: express.Request, res: express.Response) => {
  // on the defaultLayout i.e. main.hbs it has {{{ body }}} so what rendered here will sit there
  res.render("home", {
    posts: [
      {
        author: "Janith Kasun",
        image: "https://picsum.photos/500/500",
        comments: [
          "This is the first comment",
          "This is the second comment",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nec fermentum ligula. Sed vitae erat lectus.",
        ],
      },
      {
        author: "John Doe",
        image: "https://picsum.photos/500/500?2",
        comments: [],
      },
    ],
  });
});

app.use(AllRoutes);

// error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.status == 200 ? 500 : err.status;
  res.status(status).json({ message: err.message });
};

app.use(errorHandler);

const port = process.env.PORT || 8800;

// database and server init
try {
  // nodemailer attachments

  // const details = {
  //   from: '"Sender Name" <from@example.net>',
  //   to: "to@example.com",
  //   subject: "Hello from node js with typescript",
  //   text: "Hello world?",
  //   html: "<strong>Hello, this is an email from nodes ts?</strong>",
  //   headers: { "x-my-header": "test header" },
  // };
  // prettier-ignore
  // transporter.sendMail(details).then((r) => console.log("mail-response", r)).catch((e) => console.log("MAIL ERROR: ", e.message));

  database();
  // https://stackoverflow.com/questions/54485936/what-are-all-the-mongoose-events-and-where-are-they-documented

  const server: Server = app.listen(port, (): void => {
    console.log(`server started at ${port}`);
  });
} catch (e: any) {
  console.log(e.message);
}
