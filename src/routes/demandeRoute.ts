import { Router } from "express";
import DemandeController from "../controllers/demandeController";
import { upload, handleMulterError } from "../config/multer";

const router = Router();
router.post(
    "/",
        upload.fields([
            { name: "idCardFrontPhoto", maxCount: 1 },
            { name: "idCardBackPhoto", maxCount: 1 }
        ]),
    DemandeController.createDemande
);

router.get("/", DemandeController.listRequests);

router.post("/:id/status", DemandeController.updateStatus);

// Middleware de gestion d'erreur global
router.use(handleMulterError);
export default router;