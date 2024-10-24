// src/routes/utilisateurRoute.ts
import authMiddleware from "../middlewares/authMiddleware";
import container from "../config";
import { VueController } from "../controllers/VueController";
import { Router } from "express";
import { CONTROLLER } from "../types";


// Créer une instance du routeur
const vueRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const vueController: VueController = container.get<VueController>(CONTROLLER.Vue);

    // Les différentes routes

    vueRoute.get("/all", authMiddleware, vueController.getAllVue.bind(vueController));

    vueRoute.get("/user", authMiddleware, vueController.allVueUser.bind(vueController));

    vueRoute.post("/create/:id", authMiddleware, vueController.create.bind(vueController));

    vueRoute.get("/:id", authMiddleware, vueController.getAllVueFromPublication.bind(vueController));

}, 200);


export default vueRoute;

