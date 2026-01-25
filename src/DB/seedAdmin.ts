import { USER_ROLES } from '../app/modules/user/user.constant';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { logger } from '../shared/logger';

const payload = {
  name: 'Administrator',
  email: config.super_admin.email,
  role: USER_ROLES.SUPER_ADMIN,
  password: config.super_admin.password,
  isVerified: true,
};

export const seedSuperAdmin = async () => {
  // create/update super admin user
  const existingSuperAdmin = await User.exists({
    role: USER_ROLES.SUPER_ADMIN,
  });
  if (existingSuperAdmin) {
    await User.findByIdAndUpdate(existingSuperAdmin._id, payload);
    logger.info('✨ Super Admin account has been successfully updated!');
  } else {
    await User.create(payload);
    logger.info('✨ Super Admin account has been successfully created!');
  }
};;
