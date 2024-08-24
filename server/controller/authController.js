import User from "../models/userModel.js";
import { generate_token } from "../helper/tokenHelper.js";
import { StatusCodes } from 'http-status-codes';

// Register User
async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(StatusCodes.CONFLICT).json({ message: "User already exists" });
        }

        const user = new User({
            name,
            email,
            password,
        });

        await user.save();

        const token = generate_token(user._id);

        res.status(StatusCodes.CREATED).json({
            user_id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to register user", error: error.message });
    }
}

// Login User
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid email or password" });
        }

        if (!(await user.comparePassword(password))) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid email or password" });
        }

        const token = generate_token(user._id);

        res.status(StatusCodes.OK).json({
            user_id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to login user", error: error.message });
    }
}

export {
    registerUser,
    loginUser,
};
