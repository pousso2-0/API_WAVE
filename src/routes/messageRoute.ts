// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { MessageController } from "../controllers/MessageController";

// Créer une instance du routeur
const messageRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const messageController: MessageController = container.get<MessageController>(CONTROLLER.Message);

    messageRoute.get("/all", authMiddleware, messageController.getAll.bind(messageController));

    messageRoute.get("/:id", authMiddleware, messageController.getById.bind(messageController));

    messageRoute.get("/all/user", authMiddleware, messageController.getAllForUser.bind(messageController));

    messageRoute.get("/all/user/receive/:id", authMiddleware, messageController.getAllReceiveByUser.bind(messageController));

    messageRoute.get("/all/user/send/:id", authMiddleware, messageController.getAllSendByUser.bind(messageController));

    messageRoute.get("/all/discussion/:id", authMiddleware, messageController.getDiscussion.bind(messageController));

    messageRoute.post("/send/:id", authMiddleware, messageController.create.bind(messageController));

    messageRoute.put("/:id", authMiddleware, messageController.update.bind(messageController));

    messageRoute.delete("/:id", authMiddleware, messageController.remove.bind(messageController));

}, 200);


export default messageRoute;