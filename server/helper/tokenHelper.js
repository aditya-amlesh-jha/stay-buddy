import jwt from "jsonwebtoken";
import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const ACCESS_TIME = '1d'

function generate_token(user_id){
    const token = jwt.sign({ user_id }, TOKEN_SECRET, { expiresIn: ACCESS_TIME });
    return token;
}

function verify_token( token ){
    const decoded_token = jwt.verify(token, TOKEN_SECRET);
    return decoded_token;
}


export {
    generate_token,
    verify_token,
}