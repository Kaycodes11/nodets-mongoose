export default {
  development: {
    MONGO_URL: process.env.MONGO_URL as string,
    options: {}
  },
  production: {
    MONGO_URL: process.env.MONGO_URL as string,
    options: {}
  },
};