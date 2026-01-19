import { IPolicy } from './policy.interface';
import { Policy } from './policy.model';

// create/update policy
const createUpdatePolicyToDB = async (
  payload: Partial<IPolicy>,
): Promise<IPolicy> => {
  // create or update policy
  const result = await Policy.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  });
  return result;
};

// get policy
const getPolicy = async () => {
  const result = await Policy.findOne();
  return result;
};

export const PolicyServices = {
  createUpdatePolicyToDB,
  getPolicy,
};
