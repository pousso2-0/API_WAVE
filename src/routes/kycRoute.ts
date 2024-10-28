import { Router } from "express";
import multer from "multer";
import kycController from "../controllers/kycController";

const upload = multer({ storage: multer.memoryStorage() });

const kycRouter = Router();

kycRouter.post("/save",   upload.fields([
  { name: "idCardFrontPhoto", maxCount: 1 },
  { name: "idCardBackPhoto", maxCount: 1 }
]),kycController.saveKYC);


export default kycRouter;