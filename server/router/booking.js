import express from "express";
import { 
    checkRoomIsAvailable,
    newBooking,
    getBookedDates,
    getAllBookings,
    deleteBooking,
    getMyBookings 
} from "../controller/bookingController.js"
import { checkAdmin, verifyIdentity } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyIdentity, checkAdmin, getAllBookings);
router.get("/my-bookings", verifyIdentity, getMyBookings);
router.get("/dates/:room_id", getBookedDates);
router.post("/", verifyIdentity, newBooking);
router.post("/check", checkRoomIsAvailable);
router.delete("/:booking_id", verifyIdentity, checkAdmin, deleteBooking);

export default router;