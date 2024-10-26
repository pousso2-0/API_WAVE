import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';
import { validateRequest } from '../middlewares/validateRequest';
import { createWalletSchema, updateWalletLimitsSchema, updateWalletPropertiesSchema } from '../validations/walletRequest';
import Controller from './controller'; 
import { ApiResponse } from '../interfaces/ApiResponse'; // Assurez-vous que le chemin est correct

export class WalletController extends Controller {
    private walletService: WalletService;

    constructor() {
        super(); // Appeler le constructeur de la classe parente
        this.walletService = WalletService.getInstance(); 
    }

    async createWallet(req: Request, res: Response) {
        const validatedData = validateRequest(createWalletSchema, req.body);

        await this.trycatch(async () => {
            const wallet = await this.walletService.createWallet(validatedData);
            const response: ApiResponse<typeof wallet> = {
                data: wallet,
                message: 'Portefeuille créé avec succès',
                error: false
            };
            res.status(201).json(response);
        }, res);
    }

    async getWallet(req: Request, res: Response) {
        const { id } = req.params;

        await this.trycatch(async () => {
            const wallet = await this.walletService.getWallet(id);
            const response: ApiResponse<typeof wallet> = {
                data: wallet,
                message: wallet ? 'Portefeuille récupéré avec succès' : 'Portefeuille non trouvé',
                error: !wallet
            };
            res.json(response);
        }, res);
    }

    async getUserWallets(req: Request, res: Response) {
        const { userId } = req.params;

        await this.trycatch(async () => {
            const wallets = await this.walletService.getUserWallets(userId);
            const response: ApiResponse<typeof wallets> = {
                data: wallets,
                message: 'Portefeuilles de l\'utilisateur récupérés avec succès',
                error: false
            };
            res.json(response);
        }, res);
    }

    async updateWalletLimits(req: Request, res: Response) {
        const { id } = req.params;
        const validatedData = validateRequest(updateWalletLimitsSchema, req.body);

        await this.trycatch(async () => {
            const wallet = await this.walletService.updateWalletLimits(id, validatedData);
            const response: ApiResponse<typeof wallet> = {
                data: wallet,
                message: 'Limites du portefeuille mises à jour avec succès',
                error: false
            };
            res.json(response);
        }, res);
    }

    async getBalance(req: Request, res: Response) {
        const { walletId } = req.params;

        await this.trycatch(async () => {
            const balance = await this.walletService.getBalance(walletId);
            const response: ApiResponse<typeof balance> = {
                data: balance,
                message: 'Solde récupéré avec succès',
                error: false
            };
            res.json(response);
        }, res);
    }

    async updateWalletProperties(req: Request, res: Response) {
        const { id } = req.params;
        const validatedData = validateRequest(updateWalletPropertiesSchema, req.body);

        await this.trycatch(async () => {
            const wallet = await this.walletService.updateWalletProperties(id, validatedData);
            const response: ApiResponse<typeof wallet> = {
                data: wallet,
                message: 'Propriétés du portefeuille mises à jour avec succès',
                error: false
            };
            res.json(response);
        }, res);
    }

    async deleteWallet(req: Request, res: Response) {
        const { id } = req.params;

        await this.trycatch(async () => {
            await this.walletService.deleteWallet(id);
            const response: ApiResponse<null> = {
                data: null,
                message: 'Portefeuille supprimé avec succès',
                error: false
            };
            res.status(204).json(response);
        }, res);
    }

    async isWalletActive(req: Request, res: Response) {
        const { id } = req.params;

        await this.trycatch(async () => {
            const isActive = await this.walletService.isWalletActive(id);
            const response: ApiResponse<typeof isActive> = {
                data: isActive,
                message: 'Statut d\'activité du portefeuille récupéré avec succès',
                error: false
            };
            res.json(response);
        }, res);
    }
}
