import { fileURLToPath } from 'url';
import Logger from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const logger = Logger(__filename);

const loggerMiddleware = function (req, res, next){
    logger.info(`Requested method :: ${req.method}`);
    logger.info(`Requested url :: ${req.url}`)
    next();
}

export default loggerMiddleware;