import { Router } from "express";
import { updateUser, deleteUser, getUser, getUsers } from "../controller/userController.js";
import { verifyIdentity, checkAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.put('/update/:user_id', verifyIdentity, updateUser);
router.delete('/delete/:user_id', verifyIdentity, checkAdmin, deleteUser);
router.get('/get/:user_id', verifyIdentity, getUser);
router.get('/get', verifyIdentity, checkAdmin, getUsers);

export default router;