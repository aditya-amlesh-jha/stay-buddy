import express from "express";
import cors from "cors";
import { fileURLToPath } from 'url';

import authRoute from "./router/auth.js";
import userRoute from "./router/user.js";
import roomRoute from "./router/rooms.js";
import bookingRoute from "./router/booking.js"

import Logger from "./config/logger.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js"
import limiter from "./middleware/rateLimit.js";

import InitiateMongoServer from "./config/mongoconnection.js"

const __filename = fileURLToPath(import.meta.url);
const logger = Logger(__filename);

const SERVER_PORT = process.env.SERVER_PORT;

const app = express();

// @Middleware
app.use(limiter)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(loggerMiddleware)

// @Route
app.use('/auth', authRoute);
app.use('/user',userRoute);
app.use('/room',roomRoute);
app.use('/book', bookingRoute);

InitiateMongoServer().then((resolve)=>{
    app.listen(SERVER_PORT,()=>{
        logger.info(`SERVER Running on PORT : ${SERVER_PORT}`);
    })
})
.catch((error) =>{
    logger.warn(error);
})
