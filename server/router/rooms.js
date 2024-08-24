import { Router } from "express";
import { 
    getAllRooms,
    searchRoom,
    getSingleRoom,
    addRoom,
    updateRoom,
    deleteRoom,
    reviewRoom,
 } from "../controller/roomController.js";
import { checkAdmin, verifyIdentity } from "../middleware/authMiddleware.js";


const router = Router();

router.get('/', getAllRooms);
router.get('/search', searchRoom);
router.get("/:room_id", getSingleRoom);
router.post('/', verifyIdentity, checkAdmin, addRoom);
router.post('/:room_id/review',verifyIdentity, reviewRoom);
router.put('/:room_id', verifyIdentity, checkAdmin, updateRoom)
router.delete('/:room_id', verifyIdentity, checkAdmin, deleteRoom);


export default router;