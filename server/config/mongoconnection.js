import mongoose from "mongoose";
 
const MONGOURI = process.env.MONGODB_URI;

const InitiateMongoServer = async function(){
    return new Promise((resolve, reject) => {
        try {
            mongoose.connect(MONGOURI);
            resolve({
                message: "Connection to Database established!"
            })
        } catch (error) {
            reject({
                message: "Error in connecting to database!"
            })
        }
    })
}

export default InitiateMongoServer;