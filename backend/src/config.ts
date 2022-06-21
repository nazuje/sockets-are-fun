import dotenv from "dotenv";
dotenv.config();

export const config = {
  redis: {
    host: process.env.REDISHOST || "localhost",
    port: process.env.REDISPORT || 6379,
  },
  server: {
    port: process.env.PORT || 8080,
  },
};
