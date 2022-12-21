import { Schema, model, Model, HydratedDocument } from "mongoose";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import moment from "moment";

interface RefreshTokenSubDocument {
  accessToken: string;
  refreshToken: string;
}

export interface IUser {
  _id?: Schema.Types.ObjectId;
  mobileNo: string | null;
  email: string | null;
  type: "personal" | "business";
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  isValidated: boolean;
  refreshTokens?: RefreshTokenSubDocument[];
}

type UserQueryHelpers = {};

interface IUserMethods {
  comparePassword: (value: string) => Promise<boolean>;
}

interface UserModelType extends Model<IUser, UserQueryHelpers, IUserMethods> {
  createTokens(user: { _id: Schema.Types.ObjectId; email: string }): {
    accessToken: string;
    refreshToken?: string;
  };
}

const emailRegExp = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i);

// noinspection SpellCheckingInspection
const UserSchema = new Schema<
  IUser,
  Model<IUser, UserQueryHelpers>,
  {},
  UserQueryHelpers,
  IUserMethods
>(
  {
    mobileNo: {
      type: String,
      required: true,
      default: "9002865141",
      maxlength: 10,
      minlength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      default: "personal",
      validate: {
        validator: function (value: "personal" | "business") {
          if (/^personal$|^business/i.test(value)) return true;
          return false;
        },
        message: `type should be either personal or business`,
      },
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    password: {
      type: String,
      required: [true, "please enter a password"],
      trim: true,
      minlength: [6, "password must be at least six character"],
    },
    isValidated: { type: Boolean, default: false },
    refreshTokens: [
      new Schema<RefreshTokenSubDocument>(
        {
          accessToken: String,
          refreshToken: String,
        },
        { timestamps: false, _id: false }
      ),
    ],
  },
  { timestamps: true }
);

UserSchema.virtual("createdAtUnix").get(function (value) {
  return moment(Math.floor(new Date().valueOf()));
});

UserSchema.static("createTokens", function createTokens(user): {
  accessToken: string;
  refreshToken?: string;
} {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET_IS as string,
    { algorithm: "HS256", expiresIn: "10m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET_IS as string,
    { algorithm: "HS256", expiresIn: "1h" }
  );
  return { accessToken, refreshToken };
});

UserSchema.method(
  "comparePassword",
  async function (rawPassword: string): Promise<boolean> {
    return await bcrypt.compare(rawPassword, this.password);
  }
);

UserSchema.path("email").validate(function (value: string) {
  return emailRegExp.test(value) ? true : false;
}, "INVALID EMAIL");

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
      return next();
    }
  } catch (e) {
    next(new Error("password hashing error occurred"));
  }
});

UserSchema.pre("insertMany", async function (next, docs) {
  try {
    docs.map((document: HydratedDocument<IUser>, index: number) => {
      const hashedPassword = bcrypt.hashSync(document.password, 12);
      // console.log(`${index}: ${hashedPassword}`);
      document.password = hashedPassword;
    });

    return next();
  } catch (e: any) {
    next(e);
  }
});

const User = model<IUser, UserModelType>("User", UserSchema);

export default User;
