import { Router } from "express";
import contactController from "../controllers/contactController";
import authMiddleware from "../middlewares/authMiddleware";

const contactRoute: Router = Router();

// Toutes les routes nécessitent une authentification
contactRoute.use(authMiddleware);

contactRoute.post("/", contactController.addContact.bind(contactController));
contactRoute.get("/", contactController.getContacts.bind(contactController));
contactRoute.put("/:id", contactController.updateContact.bind(contactController));
contactRoute.delete("/:id", contactController.deleteContact.bind(contactController));
contactRoute.get("/google", contactController.getGoogleContacts.bind(contactController));


export default contactRoute;