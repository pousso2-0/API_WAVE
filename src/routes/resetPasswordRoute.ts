import { Router } from "express";
import { ResetPasswordController } from "../controllers/ResetPasswordController";
import container from "../config";
import { CONTROLLER } from "../types";


const resetPasswordRoute: Router = Router();


setTimeout(() => {
    const resetPasswordController: ResetPasswordController = container.get<ResetPasswordController>(CONTROLLER.ResetPassword);

    resetPasswordRoute.post("/demande", resetPasswordController.demandeReinitialisation.bind(resetPasswordController));

    resetPasswordRoute.post("/reset", resetPasswordController.reinitialisationMotDePasse.bind(resetPasswordController));

}, 200);

export default resetPasswordRoute;