import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  secure: false,
  requireTLS: true,
  auth: {
    user: "b91e2f7af858f2",
    pass: "a3ebc2267fd2cc",
  },
  debug: process.env.MODE === 'development',
  logger: process.env.MODE === 'development',
});

export default transporter;