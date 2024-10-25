import { Request, Response } from "express";
import userService from "../services/userService";
import { createUserSchema } from "../utils/validator/userValidate";
import { creatUser } from "../interfaces/UserInterface";
import {ZodError} from "zod";

export default new class userController {
    async createAgent(req: Request, res: Response) {
        // Transformation de la date de naissance
        if (req.body.dateOfBirth) {
            req.body.dateOfBirth = new Date(req.body.dateOfBirth);
        }

        try {
            // Validation des données d'entrée avec le schéma Zod
            const validatedData = createUserSchema.parse(req.body) as creatUser;

            // Création de l'agent
            const user = await userService.createAgent(validatedData);
            res.status(201).json({ message: 'Agent créé avec succès', data: user, error: false });
        } catch (error) {
            // Gestion des erreurs et renvoi des erreurs de validation Zod
            if (error instanceof ZodError) {
                res.status(400).json({ message: 'Erreur de validation', errors: error.errors });
            } else {
                res.status(500).json({ message: 'Erreur lors de la création de l\'agent', error, data: null });
            }
        }
    }
}
