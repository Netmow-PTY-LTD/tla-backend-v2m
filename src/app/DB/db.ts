import { UserProfile } from '../module/User/user.model';
import { User } from '../module/Auth/auth.model';
import { USER_ROLE } from '../constant';
import config from '../config';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { USER_PROFILE } from '../module/User/user.constant';

const seedAdminUser = async () => {
    const isAdminExists = await User.findOne({ role: USER_ROLE.ADMIN });

    if (!isAdminExists) {
        console.log('🌱 Seeding Admin User...');

        // create admin
        const adminData = {
            email: config.admin_email || 'admin@example.com',
            password: config.admin_password || 'Admin@123',
            role: USER_ROLE.ADMIN,
            regUserType: 'admin',
            regType: 'manual',
            needsPasswordChange: false,
            isPhoneVerified: true,
            isVerifiedAccount: true,
            accountStatus: USER_STATUS.APPROVED,
        };

        const createdUser = await User.create(adminData);

        // create profile
        const profileData = {
            user: createdUser._id,
            name: 'Admin',
            profileType: USER_PROFILE.ADMIN,
            phone: '+1234567890',
            credits: 0,
            firmMembershipStatus: 'approved',
            isFirmMemberRequest: false,
            isFirmMemberRequestRejected: false,
            activeFirmRequestId: null,
            createdBy: createdUser._id,
            updatedBy: createdUser._id,
        };

        const createdProfile = await UserProfile.create(profileData);

        // Link profile to user
        await User.findByIdAndUpdate(createdUser._id, { profile: createdProfile._id });

        console.log('✅ Admin User Seeded Successfully');
    }
};

export default seedAdminUser;
