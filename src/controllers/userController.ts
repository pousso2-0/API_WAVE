import { Request, Response } from "express";
import userService from "../services/userService";
import {createUserSchema} from "../utils/validator/userValidate";
import {creatUser} from "../interfaces/UserInterface";


export default new class userController {
    async createAgent(req:Request, res:Response){
        const validatedData = createUserSchema.parse(req.body) as creatUser;

        try{
            const user = await userService.createAgent(validatedData);
            res.status(201).json({message: 'Agent créé avec succès', data: user, error: false});
        }
        catch(error){
            res.status(500).json({message: 'Erreur lors de la création de l\'agent', error, data: null});
        }
    }

}
