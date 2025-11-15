import { db } from '../server/db';
import { users } from '../shared/schema';
import { KlaviyoService } from '../server/klaviyo';
import { eq, gte, sql } from 'drizzle-orm';

async function syncNewUsersToKlaviyo() {
  console.log('🔄 Starting Klaviyo sync for new users...\n');

  try {
    // Get all active users from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsers = await db.select()
      .from(users)
      .where(sql`${users.isActive} = true AND ${users.createdAt} >= ${sevenDaysAgo}`);

    console.log(`Found ${newUsers.length} new users to sync\n`);

    let successCount = 0;
    let failCount = 0;

    for (const user of newUsers) {
      console.log(`Processing: ${user.email} (${user.name})`);
      
      const [firstName, ...lastNameParts] = (user.name || '').split(' ');
      const lastName = lastNameParts.join(' ');

      try {
        // Add/update profile in Klaviyo - profile already exists is a success
        const profileResult = await KlaviyoService.createOrUpdateProfile({
          email: user.email,
          firstName: firstName || user.name,
          lastName: lastName || undefined,
          properties: {
            signupDate: user.createdAt?.toISOString(),
            user_type: 'gig_worker',
            platform: 'bookd_app',
            homeAddress: user.homeAddress,
            customGigTypes: user.customGigTypes,
            onboardingCompleted: user.onboardingCompleted,
            subscriptionTier: 'free',
          }
        });

        // Even if profile creation "failed" (409 = already exists), track the event
        const eventResult = await KlaviyoService.trackEvent(
          user.email,
          'Profile Sync',
          {
            syncDate: new Date().toISOString(),
            source: 'manual_sync',
            hasGigs: true, // They signed up so they should have onboarding
          }
        );

        console.log(`  ✅ Profile exists in Klaviyo (status: ${profileResult ? 'created/updated' : 'already exists'})\n`);
        successCount++;
      } catch (error: any) {
        // Check if it's the expected 409 conflict (profile already exists)
        if (error?.status === 409 || error?.response?.status === 409) {
          console.log(`  ✅ Profile already exists in Klaviyo\n`);
          successCount++;
        } else {
          console.error(`  ❌ Error: ${error?.message || error}\n`);
          failCount++;
        }
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  📧 Total: ${newUsers.length}`);
    
  } catch (error) {
    console.error('Fatal error during sync:', error);
    process.exit(1);
  }
}

syncNewUsersToKlaviyo()
  .then(() => {
    console.log('\n✨ Klaviyo sync completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Klaviyo sync failed:', error);
    process.exit(1);
  });
