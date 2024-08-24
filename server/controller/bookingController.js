import Booking from '../models/bookingModel.js';
import mongoose from 'mongoose';
import moment from 'moment';
import momentRange from 'moment-range';
import { StatusCodes } from 'http-status-codes';

const momentExtended = momentRange.extendMoment(moment);

// Check if the room is available for booking
async function checkRoomIsAvailable(req, res) {
    try {
        const { room_id, checkInDate, checkOutDate } = req.body;

        if (!room_id || !checkInDate || !checkOutDate) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required fields' });
        }

        const room = await Booking.find({
            room: room_id,
            $and: [
                { checkInDate: { $lte: checkOutDate } },
                { checkOutDate: { $gte: checkInDate } }
            ]
        });

        const isRoomAvailable = room.length === 0;

        res.status(StatusCodes.OK).json({ isRoomAvailable });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to check room availability', error: error.message });
    }
}

// Create a new booking with transaction handling to avoid race conditions
async function newBooking(req, res) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { room, checkInDate, checkOutDate, amountPaid, daysOfStay, paymentInfo } = req.body;

        const conflictingBooking = await Booking.findOne({
            room,
            $and: [
                { checkInDate: { $lte: checkOutDate } },
                { checkOutDate: { $gte: checkInDate } }
            ]
        }).session(session);

        if (conflictingBooking) {
            throw new Error('Room is already booked during the selected dates');
        }

        const booking = await Booking.create([{
            room,
            user: req.user._id,
            checkInDate,
            checkOutDate,
            amountPaid,
            daysOfStay,
            paymentInfo,
            paidAt: Date.now(),
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(StatusCodes.CREATED).json(booking);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Failed to create booking', error: error.message });
    }
}

// Get all booked dates for a specific room
async function getBookedDates(req, res) {
    try {
        const { roomId } = req.params;
        const bookings = await Booking.find({ room: roomId });

        if (!bookings) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'No bookings found for this room' });
        }

        let bookedDates = [];
        const timeDifference = moment().utcOffset() / 60;

        bookings.forEach((booking) => {
            const checkInDate = moment(booking.checkInDate).add(timeDifference, 'hours');
            const checkOutDate = moment(booking.checkOutDate).add(timeDifference, 'hours');

            const range = momentExtended.range(moment(checkInDate), moment(checkOutDate));
            const dates = Array.from(range.by('day'));

            bookedDates = bookedDates.concat(dates);
        });

        res.status(StatusCodes.OK).json(bookedDates);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get booked dates', error: error.message });
    }
}

// Get all bookings with pagination
async function getAllBookings(req, res) {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const count = await Booking.countDocuments();
        const bookings = await Booking.find({})
            .populate("room", "name")
            .populate("user", "name email")
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(StatusCodes.OK).json({
            bookings,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to retrieve bookings', error: error.message });
    }
}

// Delete a booking by ID
async function deleteBooking(req, res) {
    try {
        const { booking_id } = req.params;

        const booking = await Booking.findByIdAndDelete(booking_id);

        if (!booking) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
        }

        res.status(StatusCodes.OK).json({ message: 'Booking deleted!' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete booking', error: error.message });
    }
}

async function getMyBookings(req, res){
    try{

        const bookings = await Booking.find({ user: req.user._id})
        .populate("user", "name email")
        .populate("room", "name images");

        res.status(StatusCodes.OK).json({
            bookings
        })
    }
    catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get bookings', error: error.message });
    }
}

export {
    checkRoomIsAvailable,
    newBooking,
    getBookedDates,
    getAllBookings,
    deleteBooking,
    getMyBookings
};
