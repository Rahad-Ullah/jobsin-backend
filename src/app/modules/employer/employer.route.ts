import express from 'express';
import { EmployerController } from './employer.controller';

const router = express.Router();

router.get('/', EmployerController);

export const employerRoutes = router;