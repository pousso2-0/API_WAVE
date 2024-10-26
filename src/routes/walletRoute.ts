// src/routes/walletRoute.ts
import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import authMiddleware from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

// Créer une instance du routeur
const walletRoute: Router = Router();
const walletController = new WalletController();

// Définir les routes avec les middlewares
walletRoute.post('/', authMiddleware, walletController.createWallet.bind(walletController));
walletRoute.get('/:id', authMiddleware, walletController.getWallet.bind(walletController));
walletRoute.get('/user/:userId', authMiddleware, walletController.getUserWallets.bind(walletController));
walletRoute.patch('/:id/limits', authMiddleware, roleMiddleware(["admin"]), walletController.updateWalletLimits.bind(walletController));
walletRoute.get('/:walletId/balance', authMiddleware, walletController.getBalance.bind(walletController));
walletRoute.patch('/:id', authMiddleware, walletController.updateWalletProperties.bind(walletController));
walletRoute.delete('/:id', authMiddleware, roleMiddleware(["admin"]), walletController.deleteWallet.bind(walletController));
walletRoute.get('/:id/is-active', authMiddleware, roleMiddleware(["admin"]), walletController.isWalletActive.bind(walletController));

export default walletRoute;
