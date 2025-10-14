import mongoose from 'mongoose';
import Ticket from '../src/models/Ticket';

const MONGODB_URI = 'mongodb://localhost:27017/ontime_dental';

const ticketsData = [
  {
    subject: 'Equipment maintenance required',
    requester: 'Dr. Sarah Johnson',
    location: 'Downtown Clinic',
    channel: 'Phone',
    category: 'Equipment',
    description: 'Dental chair in room 3 needs immediate servicing. The backrest is not adjusting properly.',
    status: 'Open',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    updates: [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        message: 'Ticket created and assigned to maintenance team',
        user: 'System'
      }
    ]
  },
  {
    subject: 'Supply order urgent',
    requester: 'Maria Garcia',
    location: 'Westside Branch',
    channel: 'Email',
    category: 'Supplies',
    description: 'Running low on dental gloves (size M) and disposable masks. Need restock by end of week.',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    updates: [
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        message: 'Order placed with supplier',
        user: 'John Smith'
      },
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        message: 'Confirmed delivery scheduled for Thursday',
        user: 'John Smith'
      }
    ]
  },
  {
    subject: 'Software access issue',
    requester: 'Tom Wilson',
    location: 'Downtown Clinic',
    channel: 'In Person',
    category: 'IT Support',
    description: 'Unable to access patient records system. Getting authentication error when trying to log in.',
    status: 'Open',
    priority: 'High',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    updates: [
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        message: 'IT team notified. Investigating credential issue.',
        user: 'Support Team'
      }
    ]
  },
  {
    subject: 'Patient complaint follow-up',
    requester: 'Lisa Chen',
    location: 'Eastside Office',
    channel: 'Phone',
    category: 'Patient Care',
    description: 'Patient expressed dissatisfaction with wait times during last visit. Need to review scheduling.',
    status: 'Resolved',
    priority: 'Low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (past due but resolved)
    updates: [
      {
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        message: 'Spoke with patient, apologized for inconvenience',
        user: 'Lisa Chen'
      },
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        message: 'Adjusted scheduling protocol for better time management',
        user: 'Practice Manager'
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        message: 'Patient called back to express satisfaction with resolution',
        user: 'Lisa Chen'
      }
    ],
    satisfaction: 'Satisfied'
  },
  {
    subject: 'Facility cleaning deep clean needed',
    requester: 'Mike Rodriguez',
    location: 'Westside Branch',
    channel: 'Email',
    category: 'Facilities',
    description: 'Quarterly deep cleaning scheduled. All treatment rooms and common areas.',
    status: 'Scheduled',
    priority: 'Low',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    updates: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        message: 'Cleaning service confirmed for next month',
        user: 'Facilities Team'
      }
    ]
  },
  {
    subject: 'Billing system error',
    requester: 'Amanda Lee',
    location: 'Downtown Clinic',
    channel: 'In Person',
    category: 'IT Support',
    description: 'Billing software freezing when processing insurance claims. Affecting multiple workstations.',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    updates: [
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        message: 'IT investigating potential server issue',
        user: 'IT Support'
      },
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        message: 'Applied software patch, testing now',
        user: 'IT Support'
      }
    ]
  },
  {
    subject: 'New equipment installation',
    requester: 'Dr. Michael Brown',
    location: 'Eastside Office',
    channel: 'Email',
    category: 'Equipment',
    description: 'New digital X-ray system arriving next week. Need technician for installation and staff training.',
    status: 'Scheduled',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    updates: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        message: 'Installation scheduled for Tuesday 9am',
        user: 'Equipment Coordinator'
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        message: 'Training session arranged for Wednesday afternoon',
        user: 'Equipment Coordinator'
      }
    ]
  },
  {
    subject: 'Staff training request',
    requester: 'Jennifer White',
    location: 'Westside Branch',
    channel: 'Phone',
    category: 'Training',
    description: 'Request for advanced infection control training for all clinical staff.',
    status: 'Open',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
    updates: [
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        message: 'Researching available training providers',
        user: 'HR Department'
      }
    ]
  },
  {
    subject: 'Parking lot lighting issue',
    requester: 'Security Team',
    location: 'Downtown Clinic',
    channel: 'In Person',
    category: 'Facilities',
    description: 'Several parking lot lights not working. Safety concern for evening staff and patients.',
    status: 'Open',
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    updates: [
      {
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        message: 'Electrician contacted, scheduled for inspection tomorrow',
        user: 'Facilities Manager'
      }
    ]
  },
  {
    subject: 'Patient referral coordination',
    requester: 'Dr. Emily Davis',
    location: 'Eastside Office',
    channel: 'Email',
    category: 'Patient Care',
    description: 'Need to coordinate specialist referral for patient requiring oral surgery. Insurance pre-auth needed.',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    updates: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        message: 'Pre-authorization request submitted to insurance',
        user: 'Front Desk'
      },
      {
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        message: 'Insurance approved, contacting specialist office',
        user: 'Front Desk'
      }
    ]
  }
];

async function seedTickets() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the entire collection to remove old indexes
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropCollection('tickets').catch(() => {
        console.log('Tickets collection does not exist, creating new one');
      });
    }
    console.log('Cleared existing tickets collection');

    // Insert new tickets with createdAt based on their updates
    const ticketsWithDates = ticketsData.map(ticket => ({
      ...ticket,
      createdAt: ticket.updates[0].timestamp // Use first update timestamp as creation time
    }));

    const result = await Ticket.insertMany(ticketsWithDates);
    console.log(`Successfully seeded ${result.length} tickets`);

    // Display summary
    console.log('\n=== Tickets Summary ===');
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('By Status:');
    statusCounts.forEach(item => console.log(`  ${item._id}: ${item.count}`));

    const priorityCounts = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    console.log('\nBy Priority:');
    priorityCounts.forEach(item => console.log(`  ${item._id}: ${item.count}`));

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding tickets:', error);
    process.exit(1);
  }
}

seedTickets();
