import { db } from './db';
import { users, gigs, expenses } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function createDemoAccount() {
  try {
    console.log('🎬 Creating demo account for Apple Review...');

    // Hash the password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Check if demo user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'demo@bookd.app'))
      .limit(1);

    let userId: number;

    if (existingUser) {
      console.log('✅ Demo user already exists, updating...');
      userId = existingUser.id;
      
      // Update password and profile
      await db
        .update(users)
        .set({
          passwordHash,
          name: 'Demo User',
          firstName: 'Demo',
          lastName: 'User',
          homeAddress: '313 16th Street, Huntington Beach CA 92648',
          defaultTaxPercentage: 30,
          onboardingCompleted: true,
          isActive: true,
          isDeleted: false
        })
        .where(eq(users.id, userId));
    } else {
      console.log('✨ Creating new demo user...');
      
      // Create new demo user
      const [newUser] = await db
        .insert(users)
        .values({
          email: 'demo@bookd.app',
          passwordHash,
          name: 'Demo User',
          firstName: 'Demo',
          lastName: 'User',
          homeAddress: '313 16th Street, Huntington Beach CA 92648',
          defaultTaxPercentage: 30,
          onboardingCompleted: true,
          isActive: true,
          isDeleted: false,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      userId = newUser.id;
    }

    console.log(`✅ Demo user ready (ID: ${userId})`);

    // Clear existing demo data (expenses first due to foreign key constraint)
    await db.delete(expenses).where(eq(expenses.userId, userId));
    await db.delete(gigs).where(eq(gigs.userId, userId));

    console.log('🧹 Cleared old demo data');

    // Create sample gigs with dates in November/December 2025
    const gigData = [
      {
        gigType: 'Photographer',
        eventName: 'Corporate Gala Photography',
        clientName: 'Sunset Studios',
        gigAddress: '1234 Sunset Blvd, Los Angeles, CA 90028',
        date: '2025-11-15',
        startDate: '2025-11-15',
        endDate: null,
        expectedPay: '500.00',
        status: 'upcoming',
        notes: 'Event photography for corporate gala'
      },
      {
        gigType: 'Model',
        eventName: 'Fall Collection Editorial',
        clientName: 'Fashion Forward Agency',
        gigAddress: '456 Melrose Ave, Los Angeles, CA 90038',
        date: '2025-11-20',
        startDate: '2025-11-20',
        endDate: null,
        expectedPay: '350.00',
        status: 'upcoming',
        notes: 'Editorial photoshoot for fall collection'
      },
      {
        gigType: 'Actor',
        eventName: 'Feature Film Background',
        clientName: 'Paramount Pictures',
        gigAddress: '5555 Melrose Ave, Los Angeles, CA 90038',
        date: '2025-11-25',
        startDate: '2025-11-25',
        endDate: null,
        expectedPay: '800.00',
        status: 'upcoming',
        notes: 'Background role for feature film'
      },
      {
        gigType: 'Brand Ambassador',
        eventName: 'Product Launch Event',
        clientName: 'Nike LA',
        gigAddress: '1234 Fairfax Ave, Los Angeles, CA 90019',
        date: '2025-12-01',
        startDate: '2025-12-01',
        endDate: null,
        expectedPay: '400.00',
        status: 'upcoming',
        notes: 'Product launch event at The Grove'
      },
      {
        gigType: 'Magician',
        eventName: 'Private Party Magic Show',
        clientName: 'Magic Castle',
        gigAddress: '7001 Franklin Ave, Los Angeles, CA 90028',
        date: '2025-11-05',
        startDate: '2025-11-05',
        endDate: null,
        expectedPay: '600.00',
        actualPay: '600.00',
        status: 'completed',
        notes: 'Private party performance',
        gotPaidDate: new Date('2025-11-06')
      }
    ];

    const createdGigs = await db
      .insert(gigs)
      .values(gigData.map(gig => ({
        ...gig,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })))
      .returning();

    console.log(`✅ Created ${createdGigs.length} sample gigs`);

    // Add some expenses for the completed gig
    const completedGig = createdGigs.find(g => g.status === 'completed');
    if (completedGig) {
      await db.insert(expenses).values([
        {
          userId,
          gigId: completedGig.id,
          merchant: 'Shell',
          amount: '45.50',
          category: 'gas',
          date: '2025-11-04',
          businessPurpose: 'Gas for gig',
          createdAt: new Date()
        },
        {
          userId,
          gigId: completedGig.id,
          merchant: 'Party City',
          amount: '35.99',
          category: 'supplies',
          date: '2025-11-03',
          businessPurpose: 'Props for magic show',
          createdAt: new Date()
        },
        {
          userId,
          merchant: 'Starbucks',
          amount: '6.75',
          category: 'meals',
          date: '2025-11-04',
          businessPurpose: 'Pre-show coffee',
          createdAt: new Date()
        }
      ]);

      console.log('✅ Added sample expenses');
    }

    console.log('\n🎉 Demo account setup complete!');
    console.log('\n📋 Login credentials for Apple Review:');
    console.log('   Email: demo@bookd.app');
    console.log('   Password: password123');
    console.log('\n✨ Sample data includes:');
    console.log('   - 5 gigs (photographer, model, actor, brand ambassador, magician)');
    console.log('   - 3 business expenses');
    console.log('   - Home address: 313 16th Street, Huntington Beach CA 92648');
    console.log('   - Tax rate: 30%');

  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    throw error;
  }
}

// Run the script
createDemoAccount()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
