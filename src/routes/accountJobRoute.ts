// routes/accountProcessing.ts
import express from "express";
import AccountJobController from "../controllers/accountJobController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/process-accounts", authMiddleware, AccountJobController.ManualProccessing);

export default router;
