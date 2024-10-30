// routes/accountProcessing.ts
import express from "express";
import AccountJobController from "../controllers/accountJobController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();
//route pour faire le processus des traitemnet de demande en creant les utilisateur correspondant
router.get("/process-accounts", authMiddleware, AccountJobController.ManualProccessing);

export default router;
