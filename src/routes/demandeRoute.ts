import { Router } from "express";
import demandeController from "../controllers/demandeController";

const contactRoute: Router = Router();

contactRoute.post("/demande", demandeController.createDemande);
contactRoute.get("/demandes", demandeController.listDemandes);
contactRoute.put("/demande/:id", demandeController.updateDemande);
contactRoute.delete("/demande/:id", demandeController.deleteDemande);

export default contactRoute;
