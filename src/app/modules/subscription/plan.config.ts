import { Feature } from './features.enum';

type PlanConfig = {
  [key: string]: {
    durationDays: number;
    features:
      | {
          [feature: string]: any;
        }
      | 'ALL';
  };
};

export const PLAN_CONFIG: PlanConfig = {
  BASIC: {
    durationDays: 30,
    features: {
      [Feature.JOB_POSTING]: { maxActive: 5 },
      [Feature.EDIT_JOB]: false,
      [Feature.CANDIDATE_SEARCH]: { perJob: 2, resetDays: 30 },
      [Feature.CANDIDATE_MATCH]: { perJob: 1, resetDays: 30 },
      [Feature.APPOINTMENTS]: { perCandidate: 1, total: 5, resetDays: 30 },
      [Feature.AI_MATCHING]: false,
      [Feature.AI_SALARY_INSIGHTS]: false,
      [Feature.AI_JOB_TRENDS]: false,
      [Feature.AI_OTHER_TOOLS]: false,
      [Feature.SHIFT_PLANNER]: false,
      [Feature.MOVE_UP_JOB]: false,
    },
  },

  STANDARD: {
    durationDays: 30,
    features: 'ALL',
  },

  BOOSTER: {
    durationDays: 90,
    features: 'ALL',
  },
};
