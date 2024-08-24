import Room from "../models/roomModel.js";
import { StatusCodes } from 'http-status-codes';

// Get All Rooms with Pagination and Filters
async function getAllRooms(req, res) {
    try {
        const page_size = 10;
        const page = Number(req.query.page_number) || 1;

        const count = await Room.countDocuments();
        const rooms = await Room.find()
            .limit(page_size)
            .skip(page_size * (page - 1));

        res.status(StatusCodes.OK).json({
            rooms,
            page,
            pages: Math.ceil(count / page_size),
            count,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to get rooms", error: error.message });
    }
}

// Search Room
async function searchRoom(req, res) {
    try {
        const page_size = 10;
        const page = Number(req.query.page_number) || 1;

        const keyword = req.query.keyword
            ? {
                  $or: [
                      { name: { $regex: req.query.keyword, $options: "i" } },
                      { description: { $regex: req.query.keyword, $options: "i" } },
                  ],
              }
            : {};

        const numOfBeds = req.query.numOfBeds ? { numOfBeds: req.query.numOfBeds } : {};
        const category = req.query.roomType ? { category: req.query.roomType } : {};

        const count = await Room.countDocuments({ ...keyword, ...numOfBeds, ...category });
        const rooms = await Room.find({ ...keyword, ...numOfBeds, ...category })
            .limit(page_size)
            .skip(page_size * (page - 1));

        res.status(StatusCodes.OK).json({
            rooms,
            page,
            pages: Math.ceil(count / page_size),
            count,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to get rooms", error: error.message });
    }
}

// Get Single Room
async function getSingleRoom(req, res) {
    try {
        const { room_id } = req.params;
        const room = await Room.findById(room_id);

        if (!room) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Room not found" });
        }

        res.status(StatusCodes.OK).json({ room });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to get room", error: error.message });
    }
}

// Add New Room
async function addRoom(req, res) {
    try {
        const room_property = req.body;
        const room = await Room.create(room_property);

        res.status(StatusCodes.CREATED).json({ room });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add room", error: error.message });
    }
}

// Update Room
async function updateRoom(req, res) {
    try {
        const { room_id } = req.params;
        const updated_room_property = req.body;

        const room = await Room.findByIdAndUpdate(room_id, updated_room_property, { new: true });

        if (!room) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Room not found" });
        }

        res.status(StatusCodes.OK).json({ room });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update room", error: error.message });
    }
}

// Delete Room
async function deleteRoom(req, res) {
    try {
        const { room_id } = req.params;

        const room = await Room.findByIdAndDelete(room_id);

        if (!room) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Room not found" });
        }

        res.status(StatusCodes.OK).json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete room", error: error.message });
    }
}

// Review Room -- > add a review
async function reviewRoom(req, res) {
    try {
        const { room_id } = req.params;

        const room = await Room.findById(room_id);

        if (!room) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Room not found" });
        }

        const is_already_reviewed =
            room.reviews &&
            room.reviews.some(review => review.user.toString() === req.user._id.toString());

        if (is_already_reviewed) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Room already reviewed" });
        }

        const { rating, comment } = req.body;

        if (!rating) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Rating is required" });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };

        if (!room.reviews) {
            room.reviews = [];
        }

        room.reviews.push(review);

        room.numOfReviews = room.reviews.length;

        room.ratings = room.reviews.reduce((totalRating, review) => totalRating + review.rating, 0) / room.numOfReviews;

        await room.save();

        res.status(StatusCodes.CREATED).json({ message: "Review added" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add review", error: error.message });
    }
}

export {
    getAllRooms,
    searchRoom,
    getSingleRoom,
    addRoom,
    updateRoom,
    deleteRoom,
    reviewRoom,
};