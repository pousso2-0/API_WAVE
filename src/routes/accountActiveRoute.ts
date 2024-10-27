// routes/accountActiveRoute.ts
import express from 'express';
import AccountActivationController from '../controllers/accountActivationController';

const router = express.Router();

router.post('/verify-code', AccountActivationController.verifyCode);
router.post('/update-password', AccountActivationController.updatePassword);

export default router;