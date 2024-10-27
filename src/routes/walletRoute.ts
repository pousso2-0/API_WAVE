// src/routes/walletRoute.ts
import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import authMiddleware from '../middlewares/authMiddleware';

// Créer une instance du routeur
const walletRoute: Router = Router();
const walletController = new WalletController();

// Middleware d'authentification pour toutes les routes
walletRoute.use(authMiddleware);

// Définir les routes
walletRoute.post('/', (req, res) => walletController.createWallet(req, res));
walletRoute.get('/:id', (req, res) => walletController.getWallet(req, res));
walletRoute.get('/user/:userId', (req, res) => walletController.getUserWallets(req, res));
walletRoute.patch('/:id/limits', (req, res) => walletController.updateWalletLimits(req, res));
walletRoute.get('/:walletId/balance', (req, res) => walletController.getBalance(req, res));
walletRoute.patch('/:id', (req, res) => walletController.updateWalletProperties(req, res));
walletRoute.delete('/:id', (req, res) => walletController.deleteWallet(req, res));
walletRoute.get('/:id/is-active', (req, res) => walletController.isWalletActive(req, res));

export default walletRoute;
