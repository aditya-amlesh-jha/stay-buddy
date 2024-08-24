import User from "../models/userModel.js";
import { StatusCodes } from 'http-status-codes';

// Update User
async function updateUser(req, res) {
    try {
        const { user_id } = req.params;
        const { name, avatar } = req.body;

        const user = await User.findById(user_id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        user.name = name || user.name;
        user.avatar = avatar || user.avatar;

        await user.save();

        res.status(StatusCodes.OK).json({
            name: user.name,
            avatar: user.avatar,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update user", error: error.message });
    }
}

// Delete User
async function deleteUser(req, res) {
    try {
        const { user_id } = req.params;

        const deleted_user = await User.findByIdAndDelete(user_id);

        if (!deleted_user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        res.status(StatusCodes.OK).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete user", error: error.message });
    }
}

// Get Single User
async function getUser(req, res) {
    try {
        const { user_id } = req.params;

        if(req.user._id.toString() !== user_id ){
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Not Authorized!" });
        }

        const user = await User.findById(user_id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to get user", error: error.message });
    }
}

// Get All Users
async function getUsers(req, res) {
    try {
        const users = await User.find().select("-password");

        res.status(StatusCodes.OK).json({ users });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to get users", error: error.message });
    }
}

export {
    updateUser,
    deleteUser,
    getUser,
    getUsers
};
