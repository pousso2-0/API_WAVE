import { Router } from "express";
import googleAuthController from "../controllers/googleAuthController";
import authMiddleware from "../middlewares/authMiddleware";

const googleAuthRoute: Router = Router();

googleAuthRoute.get("/url", authMiddleware, googleAuthController.getAuthUrl.bind(googleAuthController));
googleAuthRoute.get("/callback", googleAuthController.handleCallback.bind(googleAuthController));
googleAuthRoute.post("/import-contacts", authMiddleware, googleAuthController.importContacts.bind(googleAuthController));

export default googleAuthRoute;