import { Request, Response } from "express";
import userService from "../services/userService";
import {createUserSchema, createUserWithKycSchema, kycSchema, updateUserSchema} from "../validations/userValidate";
import {CreateUserKyc, creatUser, UpdateUser} from "../interfaces/UserInterface";
import {z, ZodError} from "zod";
import {RoleEnum} from "../enums/RoleEnum";
import jwt from "jsonwebtoken";

export default new class userController {
    async createAgentOrAdmin(req: Request, res: Response) {
        // Transformation de la date de naissance
        if (req.body.dateOfBirth) {
            req.body.dateOfBirth = new Date(req.body.dateOfBirth);
        }

        try {
            // Validation des données d'entrée avec le schéma Zod
            const validatedData = createUserSchema.parse(req.body) as creatUser;
            // Création de l'agent de l'admin
            const user = await userService.createAgentOrAdmin(validatedData);
            res.status(201).json({ message: 'Agent créé avec succès', data: user, error: false });
        } catch (error) {
            // Gestion des erreurs et renvoi des erreurs de validation Zod
            if (error instanceof ZodError) {
                res.status(400).json({ message: 'Erreur de validation', errors: error.errors });
            } else {
                // Déterminer le message d'erreur en fonction du rôle
                const role = req.body.role; // Assurez-vous que le rôle est inclus dans req.body
                let errorMessage = 'Erreur lors de la création de l\'agent';

                if (role === 'ADMIN') {
                    errorMessage = 'Erreur lors de la création de l\'administrateur';
                } else if (role === 'AGENT') {
                    errorMessage = 'Erreur lors de la création de l\'agent';
                }
                res.status(500).json({ message: errorMessage, error, data: null });
            }
        }
    }

    async createClientByAgent(req: Request, res: Response) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (req.body.dateOfBirth) {
            req.body.dateOfBirth = new Date(req.body.dateOfBirth);
        }

        try {
            // Valider les données de base
            const validatedUserData = createUserSchema.parse(req.body);

            // Vérifier la présence des fichiers obligatoires
            if (!files.idCardFrontPhoto?.[0] || !files.idCardBackPhoto?.[0]) {
                throw new Error("Les photos recto et verso de la pièce d'identité sont obligatoires");
            }

            console.log('les donné arrive dans le req body', req.body);
            const  kyc = kycSchema.parse(
                {
                    documentType: req.body.documentType,
                    documentNumber: req.body.documentNumber,
                    idCardFrontPhoto: files.idCardFrontPhoto[0].path,
                    idCardBackPhoto: files.idCardBackPhoto[0].path,
                    verificationStatus: 'PENDING',
                    verificationMethod: 'Manuel',
                    rejectionReason: ""
                }
            )
            // Créer l'objet de données complet avec le bon typage
            const completeData: CreateUserKyc = {
                ...validatedUserData,
                kyc
            };

            console.log('les donné au complet', completeData);
            // Création du client
            const user = await userService.createClientByAgent(completeData);
            res.status(201).json({message: 'Client créé avec succès', data: user, error: false});
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({message: 'Erreur de validation', errors: error.errors});
            } else {
                res.status(500).json({
                    message: 'Erreur lors de la création du client',
                    errors: error instanceof Error ? error.message : error,
                    data: null
                });
            }
        }
    }
    // Endpoint pour récupérer un utilisateur par son ID
    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await userService.getUserById(userId);

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé', data: null, error: true });
            }

            res.status(200).json({ message: 'Utilisateur récupéré avec succès', data: user, error: false });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error, data: null });
        }
    }

    // Endpoint pour lister les utilisateurs avec option de filtre par rôle
    async listUsers(req: Request, res: Response) {
        try {
            const { role } = req.query;
            const users = await userService.listUsers(role as RoleEnum);
            res.status(200).json({ message: 'Utilisateurs récupérés avec succès', data: users, error: false });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error, data: null });
        }
    }
    async deleteUser(req: Request, res: Response) {
        const userId = req.params.id;

        try {
            await userService.deleteUser(userId);
            res.status(200).json({ message: 'Utilisateur supprimé avec succès', error: false });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error, data: null });
        }
    }
    async DmandeParseData (req: Request, res: Response){
        try {
            const id = req.params.id;
             const data = await userService.handleAccountRequest(id);
             res.status(200).json({ message: 'Demande de données traitée avec succès', data, error: false });
        }catch (error) {
            res.status(500).json({ message: 'Erreur lors du traitement de la demande de données', error, data: null });
        }
    }

    async getCurrentUser(req: Request, res: Response) {
        console.log('azerty');
        try {
            console.log('azerty');
            // Récupérer l'ID de l'utilisateur depuis le token
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'Token non fourni', data: null, error: true });
            }
            console.log(authHeader)

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
            console.log('decoded', decoded)
            console.log('userId', decoded.userId)

            // Utiliser le service existant pour récupérer l'utilisateur
            const user = await userService.getUserById(decoded.userId);

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé', data: null, error: true });
            }

            res.status(200).json({ message: 'Utilisateur récupéré avec succès', data: user, error: false });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Token invalide', data: null, error: true });
            }
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error, data: null });
        }
    }

    async updateUser(req: Request, res: Response) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        try {
            const userId = req.params.id;

            // Conversion de la date si elle est fournie
            if (req.body.dateOfBirth) {
                req.body.dateOfBirth = new Date(req.body.dateOfBirth);
            }

            // Validation des données d'entrée
            const validatedData = updateUserSchema.parse({
                ...req.body,
                photo: files?.photo?.[0]?.path
            });
            const updateData: UpdateUser = {
                ...validatedData,
                id: userId  // Mettre l'ID à la fin pour s'assurer qu'il ne sera pas écrasé
            };


            // Mise à jour de l'utilisateur avec l'ID séparé des données validées
            const updatedUser = await userService.updateUser(updateData);

            res.status(200).json({
                message: 'Utilisateur mis à jour avec succès',
                data: updatedUser,
                error: false
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: 'Erreur de validation',
                    errors: error.errors
                });
            } else {
                res.status(500).json({
                    message: 'Erreur lors de la mise à jour de l\'utilisateur',
                    error: error instanceof Error ? error.message : error,
                    data: null
                });
            }
        }
    }

    async searchUser(req: Request, res: Response) {
        const searchTerm = req.query.searchTerm as string;
        const users = await userService.searchUser(searchTerm);
        res.status(200).json({ message: 'Utilisateurs trouvés avec succès', data: users, error: false });
    }
}
