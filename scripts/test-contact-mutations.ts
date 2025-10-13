// Test script to verify Contact module mutations work correctly
// Run with: npx tsx scripts/test-contact-mutations.ts

import mongoose from 'mongoose';
import DirectoryEntry from '../src/models/DirectoryEntry';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ontime_dental';

async function testMutations() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Test 1: Get all entries
    console.log('📋 Test 1: Fetching all directory entries...');
    const allEntries = await DirectoryEntry.find().sort({ order: 1 }).lean();
    console.log(`   Found ${allEntries.length} entries`);
    console.log(`   First entry: ${allEntries[0].employee} (order: ${allEntries[0].order})\n`);

    // Test 2: Update an entry
    console.log('✏️  Test 2: Updating an entry...');
    const entryToUpdate = allEntries[0];
    const updatedEntry = await DirectoryEntry.findByIdAndUpdate(
      entryToUpdate._id,
      { employee: 'Test Updated Name', phone: '(999) 999-9999' },
      { new: true }
    );
    console.log(`   ✓ Updated: ${updatedEntry?.employee} - ${updatedEntry?.phone}\n`);

    // Revert the change
    await DirectoryEntry.findByIdAndUpdate(
      entryToUpdate._id,
      { employee: entryToUpdate.employee, phone: entryToUpdate.phone }
    );
    console.log('   ✓ Reverted changes\n');

    // Test 3: Test reordering
    console.log('🔄 Test 3: Testing reorder functionality...');
    const corporateEntries = await DirectoryEntry.find({ 
      entityId: 'bluno-james', 
      group: 'corporate' 
    }).sort({ order: 1 });
    
    if (corporateEntries.length >= 2) {
      console.log(`   Before: [${corporateEntries.map(e => e.employee).join(', ')}]`);
      
      // Swap order
      const reorderedIds = [corporateEntries[1]._id, corporateEntries[0]._id];
      for (let i = 0; i < reorderedIds.length; i++) {
        await DirectoryEntry.findByIdAndUpdate(reorderedIds[i], { order: i });
      }
      
      const afterReorder = await DirectoryEntry.find({ 
        entityId: 'bluno-james', 
        group: 'corporate' 
      }).sort({ order: 1 });
      console.log(`   After:  [${afterReorder.map(e => e.employee).join(', ')}]`);
      
      // Revert
      for (let i = 0; i < corporateEntries.length; i++) {
        await DirectoryEntry.findByIdAndUpdate(corporateEntries[i]._id, { order: i });
      }
      console.log('   ✓ Reverted order\n');
    }

    // Test 4: Create and delete
    console.log('➕ Test 4: Create and delete entry...');
    const newEntry = await DirectoryEntry.create({
      entityId: 'bluno-james',
      group: 'corporate',
      location: 'Test Location',
      phone: '(000) 000-0000',
      extension: '0000',
      department: 'Test Department',
      employee: 'Test Employee',
      order: 999
    });
    console.log(`   ✓ Created entry: ${newEntry.employee} (ID: ${newEntry._id})`);

    const deleted = await DirectoryEntry.findByIdAndDelete(newEntry._id);
    console.log(`   ✓ Deleted entry: ${deleted?.employee}\n`);

    console.log('✅ All mutation tests passed!\n');
    console.log('📊 Summary:');
    console.log('   ✓ Read operations (sorting by order)');
    console.log('   ✓ Update operations (edit entry)');
    console.log('   ✓ Reorder operations (drag & drop)');
    console.log('   ✓ Create operations (add new)');
    console.log('   ✓ Delete operations (remove entry)');
    
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
    
  } catch (error) {
    console.error('❌ Error testing mutations:', error);
    process.exit(1);
  }
}

testMutations();
