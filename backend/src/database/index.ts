import mongoose from "mongoose";

export default function database(): void {
  try {
    mongoose.set("debug", true);
    // noinspection JSIgnoredPromiseFromCall
    mongoose.connect(process.env.MONGO_URL as string, error => console.log(error));
    mongoose.connection.on("connected", () => console.log("successfully connected to `reservation` db"));
    mongoose.connection.on("error", (er) => console.log("Error while connecting to db: " + er));
    mongoose.connection.on("disconnected", () => console.log("mongodb is being disconnected"));
  } catch (error: any) {
    console.log(error.message);
  }
}
