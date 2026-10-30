import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { uploadLogo } from "../middleware/upload.js";
import {
  getMyCompany,
  saveMyCompany,
  uploadMyLogo,
  deleteMyLogo,
  completeMySetup,
} from "../controllers/company.controller.js";

const router = Router();
router.use(auth);

router.get("/me", getMyCompany);
router.put("/me", saveMyCompany);
router.post("/me/logo", uploadLogo, uploadMyLogo);
router.delete("/me/logo", deleteMyLogo);
router.post("/me/complete", completeMySetup);

export default router;
