import { Router } from "express";
import {
  createBookingController,
  deleteBookingController,
  getBookingController,
  listBookingsController,
  updateBookingController
} from "../controllers/bookingController";
import { requireAuth } from "../middleware/auth";
import { requireFeatureFlag } from "../middleware/requireFeatureFlag";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);
router.use(requireFeatureFlag("scheduling"));

router.get("/", asyncHandler(listBookingsController));
router.post("/", asyncHandler(createBookingController));
router.get("/:id", asyncHandler(getBookingController));
router.patch("/:id", asyncHandler(updateBookingController));
router.delete("/:id", asyncHandler(deleteBookingController));

export default router;
