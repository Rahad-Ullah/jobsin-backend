import express from 'express';
import { ShiftPlanController } from './shiftPlan.controller';

const router = express.Router();

router.get('/', ShiftPlanController);

export const shiftPlanRoutes = router;