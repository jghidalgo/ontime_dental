import { connectToDatabase } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';
import User from '@/models/User';
import DirectoryEntity from '@/models/DirectoryEntity';
import DirectoryEntry from '@/models/DirectoryEntry';
import ClinicLocation from '@/models/ClinicLocation';
import FrontDeskSchedule from '@/models/FrontDeskSchedule';
import DoctorSchedule from '@/models/DoctorSchedule';
import Ticket from '@/models/Ticket';
import DocumentEntity from '@/models/Document';
import LabCase from '@/models/LabCase';
import Employee from '@/models/Employee';

export const resolvers = {
  Query: {
    health: () => 'ok',

    // Directory Queries
    directoryEntities: async () => {
      await connectToDatabase();
      const entities = await DirectoryEntity.find().lean();
      return entities.map((entity: any) => ({
        ...entity,
        id: entity._id.toString()
      }));
    },

    directoryEntity: async (_: unknown, { entityId }: { entityId: string }) => {
      await connectToDatabase();
      const entity: any = await DirectoryEntity.findOne({ entityId }).lean();
      if (!entity) return null;
      return {
        ...entity,
        id: entity._id.toString()
      };
    },

    directoryEntriesByEntity: async (
      _: unknown,
      { entityId, group }: { entityId: string; group?: string }
    ) => {
      await connectToDatabase();
      const filter: { entityId: string; group?: string } = { entityId };
      if (group) {
        filter.group = group;
      }
      const entries = await DirectoryEntry.find(filter).sort({ order: 1 }).lean();
      return entries.map((entry: any) => ({
        ...entry,
        id: entry._id.toString()
      }));
    },

    directoryEntityWithEntries: async (_: unknown, { entityId }: { entityId: string }) => {
      await connectToDatabase();
      
      const entity: any = await DirectoryEntity.findOne({ entityId }).lean();
      if (!entity) {
        throw new Error('Entity not found');
      }

      const allEntries: any[] = await DirectoryEntry.find({ entityId }).sort({ order: 1 }).lean();

      return {
        id: entity._id.toString(),
        entityId: entity.entityId,
        name: entity.name,
        corporate: allEntries
          .filter((e) => e.group === 'corporate')
          .map((e) => ({ ...e, id: e._id.toString() })),
        frontdesk: allEntries
          .filter((e) => e.group === 'frontdesk')
          .map((e) => ({ ...e, id: e._id.toString() })),
        offices: allEntries
          .filter((e) => e.group === 'offices')
          .map((e) => ({ ...e, id: e._id.toString() }))
      };
    },

    allDirectoryData: async () => {
      await connectToDatabase();
      
      const entities: any[] = await DirectoryEntity.find().lean();
      const allEntries: any[] = await DirectoryEntry.find().sort({ order: 1 }).lean();

      return entities.map((entity) => {
        const entityEntries = allEntries.filter((e) => e.entityId === entity.entityId);
        
        return {
          id: entity._id.toString(),
          entityId: entity.entityId,
          name: entity.name,
          corporate: entityEntries
            .filter((e) => e.group === 'corporate')
            .map((e) => ({ ...e, id: e._id.toString() })),
          frontdesk: entityEntries
            .filter((e) => e.group === 'frontdesk')
            .map((e) => ({ ...e, id: e._id.toString() })),
          offices: entityEntries
            .filter((e) => e.group === 'offices')
            .map((e) => ({ ...e, id: e._id.toString() }))
        };
      });
    },

    // Clinic Location Queries
    clinicLocations: async () => {
      await connectToDatabase();
      const locations = await ClinicLocation.find().lean();
      return locations.map((location: any) => ({
        ...location,
        id: location._id.toString()
      }));
    },

    clinicLocation: async (_: unknown, { companyId }: { companyId: string }) => {
      await connectToDatabase();
      const location: any = await ClinicLocation.findOne({ companyId }).lean();
      if (!location) return null;
      return {
        ...location,
        id: location._id.toString()
      };
    },

    // Schedule Queries
    frontDeskSchedules: async () => {
      await connectToDatabase();
      const schedules = await FrontDeskSchedule.find().lean();
      return schedules.map((schedule: any) => ({
        ...schedule,
        id: schedule._id.toString()
      }));
    },

    doctorSchedules: async () => {
      await connectToDatabase();
      const schedules = await DoctorSchedule.find().lean();
      return schedules.map((schedule: any) => ({
        ...schedule,
        id: schedule._id.toString()
      }));
    },

    // Ticket Queries
    tickets: async () => {
      await connectToDatabase();
      const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();
      return tickets.map((ticket: any) => ({
        ...ticket,
        id: ticket._id.toString()
      }));
    },

    ticket: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const ticket: any = await Ticket.findById(id).lean();
      if (!ticket) return null;
      return {
        ...ticket,
        id: ticket._id.toString()
      };
    },

    // Document Queries
    documentEntities: async () => {
      await connectToDatabase();
      const entities = await DocumentEntity.find().lean();
      return entities.map((entity: any) => ({
        ...entity,
        id: entity._id.toString()
      }));
    },

    documentEntity: async (_: unknown, { entityId }: { entityId: string }) => {
      await connectToDatabase();
      const entity: any = await DocumentEntity.findOne({ entityId }).lean();
      if (!entity) return null;
      return {
        ...entity,
        id: entity._id.toString()
      };
    },

    // Lab Case Queries
    labCases: async () => {
      await connectToDatabase();
      const cases = await LabCase.find().sort({ createdAt: -1 }).lean();
      return cases.map((labCase: any) => ({
        ...labCase,
        id: labCase._id.toString()
      }));
    },

    labCase: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const labCase: any = await LabCase.findById(id).lean();
      if (!labCase) return null;
      return {
        ...labCase,
        id: labCase._id.toString()
      };
    },

    labCaseByNumber: async (_: unknown, { caseId }: { caseId: string }) => {
      await connectToDatabase();
      const labCase: any = await LabCase.findOne({ caseId }).lean();
      if (!labCase) return null;
      return {
        ...labCase,
        id: labCase._id.toString()
      };
    },

    // Employee Queries
    employees: async (
      _: unknown,
      {
        search,
        location,
        position,
        status,
        limit = 100,
        offset = 0
      }: {
        search?: string;
        location?: string;
        position?: string;
        status?: string;
        limit?: number;
        offset?: number;
      }
    ) => {
      await connectToDatabase();
      
      const filter: any = {};
      
      // Text search across name, position, and location
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { position: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (location) {
        filter.location = location;
      }
      
      if (position) {
        filter.position = position;
      }
      
      if (status) {
        filter.status = status;
      }
      
      const employees = await Employee.find(filter)
        .sort({ name: 1 })
        .limit(limit)
        .skip(offset)
        .lean();
        
      return employees.map((employee: any) => ({
        ...employee,
        id: employee._id.toString(),
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString()
      }));
    },

    employee: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const employee: any = await Employee.findById(id).lean();
      if (!employee) return null;
      return {
        ...employee,
        id: employee._id.toString(),
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString()
      };
    },

    employeeByEmployeeId: async (_: unknown, { employeeId }: { employeeId: string }) => {
      await connectToDatabase();
      const employee: any = await Employee.findOne({ employeeId }).lean();
      if (!employee) return null;
      return {
        ...employee,
        id: employee._id.toString(),
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString()
      };
    },

    // Dashboard Query
    dashboardData: async () => {
      await connectToDatabase();

      // Aggregate ticket metrics
      const tickets = await Ticket.find().lean();
      const openTickets = tickets.filter((t: any) => t.status !== 'Resolved').length;
      const urgentTickets = tickets.filter((t: any) => t.priority === 'High').length;
      const resolvedThisWeek = tickets.filter((t: any) => {
        const createdDate = new Date(t.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return t.status === 'Resolved' && createdDate >= weekAgo;
      }).length;

      // Aggregate schedule coverage
      const frontDeskSchedules = await FrontDeskSchedule.find().lean();
      const doctorSchedules = await DoctorSchedule.find().lean();
      const staffCoverage = frontDeskSchedules.filter((s: any) => s.employee).length;
      const totalFrontDeskPositions = frontDeskSchedules.length;
      const coveragePercent = totalFrontDeskPositions > 0 
        ? Math.round((staffCoverage / totalFrontDeskPositions) * 100) 
        : 0;

      // Aggregate documents
      const documentEntities = await DocumentEntity.find().lean();
      const totalDocuments = documentEntities.reduce((sum: number, entity: any) => {
        return sum + entity.groups.reduce((groupSum: number, group: any) => {
          return groupSum + group.documents.length;
        }, 0);
      }, 0);

      // Aggregate contact entries
      const directoryEntries = await DirectoryEntry.find().lean();
      const totalContacts = directoryEntries.length;

      // Calculate metrics
      const metrics = [
        {
          label: 'Open Tickets',
          value: openTickets.toString(),
          delta: `${urgentTickets} urgent`,
          trend: urgentTickets > 0 ? 'negative' : 'positive'
        },
        {
          label: 'Staff Coverage',
          value: `${coveragePercent}%`,
          delta: `${staffCoverage} of ${totalFrontDeskPositions} positions`,
          trend: coveragePercent >= 80 ? 'positive' : 'neutral'
        },
        {
          label: 'Active Documents',
          value: totalDocuments.toString(),
          delta: `${documentEntities.length} entities`,
          trend: 'neutral'
        },
        {
          label: 'Contact Directory',
          value: totalContacts.toString(),
          delta: `${resolvedThisWeek} tickets resolved this week`,
          trend: 'positive'
        }
      ];

      // Generate upcoming appointments from doctor schedules
      const upcomingAppointments = [];
      const appointmentTimes = ['09:30 AM', '10:15 AM', '01:00 PM', '03:45 PM'];
      const treatments = ['Routine Checkup', 'Implant Consultation', 'Hygiene Maintenance', 'Crown Fitting', 'Orthodontic Adjustment'];
      const patients = ['Sarah Johnson', 'Michael Chen', 'Emma Rodriguez', 'James Wilson'];
      
      for (let i = 0; i < Math.min(4, doctorSchedules.length); i++) {
        const schedule: any = doctorSchedules[i];
        if (schedule.doctor) {
          upcomingAppointments.push({
            time: appointmentTimes[i % appointmentTimes.length],
            patient: patients[i % patients.length],
            treatment: treatments[i % treatments.length],
            practitioner: schedule.doctor.name
          });
        }
      }

      // Generate revenue trend (mock data based on ticket resolution rates)
      const revenueTrend = [
        { month: 'Apr', value: 42 + Math.floor(Math.random() * 10) },
        { month: 'May', value: 48 + Math.floor(Math.random() * 10) },
        { month: 'Jun', value: 51 + Math.floor(Math.random() * 10) },
        { month: 'Jul', value: 57 + Math.floor(Math.random() * 10) },
        { month: 'Aug', value: 62 + Math.floor(Math.random() * 10) },
        { month: 'Sep', value: 66 + Math.floor(Math.random() * 10) }
      ];

      // Generate team activity from recent tickets
      const sortedTickets = [...tickets].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const recentTickets = sortedTickets.slice(0, 3);
      
      const teamActivity = recentTickets.map((ticket: any, index: number) => {
        const minutesAgo = [12, 43, 67][index] || (index + 1) * 20;
        const timeAgo = minutesAgo < 60 ? `${minutesAgo} minutes ago` : `${Math.floor(minutesAgo / 60)} hour ago`;
        
        return {
          id: ticket._id.toString(),
          title: `${ticket.status === 'Resolved' ? 'Resolved' : 'Working on'}: ${ticket.subject}`,
          timestamp: timeAgo,
          owner: ticket.requester
        };
      });

      // Generate announcements based on system data
      const announcements = [];
      
      if (urgentTickets > 0) {
        announcements.push({
          title: `${urgentTickets} Urgent ${urgentTickets === 1 ? 'Ticket' : 'Tickets'} Require Attention`,
          description: 'Please review and prioritize high-priority tickets in the support queue.',
          badge: 'Priority'
        });
      }

      if (coveragePercent < 100) {
        const unfilled = totalFrontDeskPositions - staffCoverage;
        announcements.push({
          title: `${unfilled} ${unfilled === 1 ? 'Position' : 'Positions'} Need Assignment`,
          description: 'Front desk schedule has open positions. Please review staff assignments.',
          badge: 'Staffing'
        });
      }

      // Add a default announcement if none generated
      if (announcements.length === 0) {
        announcements.push({
          title: 'System Operating Normally',
          description: 'All modules are functioning properly. No urgent actions required.',
          badge: 'Status'
        });
      }

      // Add a second announcement about documents
      announcements.push({
        title: `${totalDocuments} Documents Available`,
        description: `Access ${documentEntities.length} document entities across ${documentEntities.reduce((sum: number, e: any) => sum + e.groups.length, 0)} categories.`,
        badge: 'Documentation'
      });

      return {
        metrics,
        upcomingAppointments,
        revenueTrend,
        teamActivity,
        announcements: announcements.slice(0, 2) // Limit to 2 announcements
      };
    }
  },

  Mutation: {
    async login(_: unknown, args: { email: string; password: string }) {
      const { email, password } = args;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      await connectToDatabase();

      const user: any = await User.findOne({ email }).lean();

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await verifyPassword(password, user.password);

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = createToken({ sub: user._id.toString(), role: user.role, email: user.email });

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    },

    // Directory Mutations
    createDirectoryEntity: async (
      _: unknown,
      { entityId, name }: { entityId: string; name: string }
    ) => {
      await connectToDatabase();
      const entity = await DirectoryEntity.create({ entityId, name });
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    createDirectoryEntry: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      const entry = await DirectoryEntry.create(input);
      return {
        ...entry.toObject(),
        id: entry._id.toString()
      };
    },

    updateDirectoryEntry: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      const entry = await DirectoryEntry.findByIdAndUpdate(id, input, { new: true });
      if (!entry) {
        throw new Error('Directory entry not found');
      }
      return {
        ...entry.toObject(),
        id: entry._id.toString()
      };
    },

    deleteDirectoryEntry: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const result = await DirectoryEntry.findByIdAndDelete(id);
      return !!result;
    },

    reorderDirectoryEntries: async (_: unknown, { entityId, group, entryIds }: { entityId: string; group: string; entryIds: string[] }) => {
      await connectToDatabase();
      
      // Update the order field for each entry based on its position in the array
      const updatePromises = entryIds.map((id, index) => 
        DirectoryEntry.findByIdAndUpdate(
          id,
          { order: index },
          { new: true }
        )
      );
      
      const updatedEntries = await Promise.all(updatePromises);
      
      // Filter out any null results and map to GraphQL format
      return updatedEntries
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .map((entry: any) => ({
          ...entry.toObject(),
          id: entry._id.toString()
        }));
    },

    // Clinic Location Mutations
    createClinicLocation: async (_: unknown, args: any) => {
      await connectToDatabase();
      const location = await ClinicLocation.create(args);
      return {
        ...location.toObject(),
        id: location._id.toString()
      };
    },

    updateClinicLocation: async (_: unknown, { companyId, ...updates }: any) => {
      await connectToDatabase();
      const location = await ClinicLocation.findOneAndUpdate(
        { companyId },
        { $set: updates },
        { new: true }
      );
      if (!location) {
        throw new Error('Clinic location not found');
      }
      return {
        ...location.toObject(),
        id: location._id.toString()
      };
    },

    addClinic: async (_: unknown, { companyId, clinic }: { companyId: string; clinic: any }) => {
      await connectToDatabase();
      const location = await ClinicLocation.findOneAndUpdate(
        { companyId },
        { $push: { clinics: clinic } },
        { new: true }
      );
      if (!location) {
        throw new Error('Clinic location not found');
      }
      return {
        ...location.toObject(),
        id: location._id.toString()
      };
    },

    removeClinic: async (
      _: unknown,
      { companyId, clinicId }: { companyId: string; clinicId: string }
    ) => {
      await connectToDatabase();
      const location = await ClinicLocation.findOneAndUpdate(
        { companyId },
        { $pull: { clinics: { clinicId } } },
        { new: true }
      );
      if (!location) {
        throw new Error('Clinic location not found');
      }
      return {
        ...location.toObject(),
        id: location._id.toString()
      };
    },

    // Schedule Mutations
    updateFrontDeskSchedule: async (
      _: unknown,
      { positionId, clinicId, employee }: { positionId: string; clinicId: string; employee?: any }
    ) => {
      await connectToDatabase();
      const schedule = await FrontDeskSchedule.findOneAndUpdate(
        { positionId, clinicId },
        { employee: employee || null },
        { new: true, upsert: true }
      );
      return {
        ...schedule.toObject(),
        id: schedule._id.toString()
      };
    },

    updateDoctorSchedule: async (
      _: unknown,
      { dayId, clinicId, doctor }: { dayId: string; clinicId: string; doctor?: any }
    ) => {
      await connectToDatabase();
      const schedule = await DoctorSchedule.findOneAndUpdate(
        { dayId, clinicId },
        { doctor: doctor || null },
        { new: true, upsert: true }
      );
      return {
        ...schedule.toObject(),
        id: schedule._id.toString()
      };
    },

    swapFrontDeskAssignments: async (
      _: unknown,
      {
        sourcePositionId,
        sourceClinicId,
        targetPositionId,
        targetClinicId
      }: {
        sourcePositionId: string;
        sourceClinicId: string;
        targetPositionId: string;
        targetClinicId: string;
      }
    ) => {
      await connectToDatabase();

      const source = await FrontDeskSchedule.findOne({ positionId: sourcePositionId, clinicId: sourceClinicId });
      const target = await FrontDeskSchedule.findOne({ positionId: targetPositionId, clinicId: targetClinicId });

      const sourceEmployee = source?.employee || null;
      const targetEmployee = target?.employee || null;

      // Swap the assignments
      const updatedSource = await FrontDeskSchedule.findOneAndUpdate(
        { positionId: sourcePositionId, clinicId: sourceClinicId },
        { employee: targetEmployee },
        { new: true, upsert: true }
      );

      const updatedTarget = await FrontDeskSchedule.findOneAndUpdate(
        { positionId: targetPositionId, clinicId: targetClinicId },
        { employee: sourceEmployee },
        { new: true, upsert: true }
      );

      return [
        { ...updatedSource.toObject(), id: updatedSource._id.toString() },
        { ...updatedTarget.toObject(), id: updatedTarget._id.toString() }
      ];
    },

    swapDoctorAssignments: async (
      _: unknown,
      {
        sourceDayId,
        sourceClinicId,
        targetDayId,
        targetClinicId
      }: {
        sourceDayId: string;
        sourceClinicId: string;
        targetDayId: string;
        targetClinicId: string;
      }
    ) => {
      await connectToDatabase();

      const source = await DoctorSchedule.findOne({ dayId: sourceDayId, clinicId: sourceClinicId });
      const target = await DoctorSchedule.findOne({ dayId: targetDayId, clinicId: targetClinicId });

      const sourceDoctor = source?.doctor || null;
      const targetDoctor = target?.doctor || null;

      // Swap the assignments
      const updatedSource = await DoctorSchedule.findOneAndUpdate(
        { dayId: sourceDayId, clinicId: sourceClinicId },
        { doctor: targetDoctor },
        { new: true, upsert: true }
      );

      const updatedTarget = await DoctorSchedule.findOneAndUpdate(
        { dayId: targetDayId, clinicId: targetClinicId },
        { doctor: sourceDoctor },
        { new: true, upsert: true }
      );

      return [
        { ...updatedSource.toObject(), id: updatedSource._id.toString() },
        { ...updatedTarget.toObject(), id: updatedTarget._id.toString() }
      ];
    },

    // Ticket Mutations
    createTicket: async (
      _: unknown,
      { input }: { input: any }
    ) => {
      await connectToDatabase();
      
      const ticketData = {
        ...input,
        createdAt: new Date().toISOString()
      };
      
      const ticket: any = await Ticket.create(ticketData);
      return {
        ...ticket.toObject(),
        id: ticket._id.toString()
      };
    },

    updateTicket: async (
      _: unknown,
      { id, input }: { id: string; input: any }
    ) => {
      await connectToDatabase();
      
      const ticket: any = await Ticket.findByIdAndUpdate(
        id,
        input,
        { new: true }
      );
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      return {
        ...ticket.toObject(),
        id: ticket._id.toString()
      };
    },

    deleteTicket: async (
      _: unknown,
      { id }: { id: string }
    ) => {
      await connectToDatabase();
      
      const result = await Ticket.findByIdAndDelete(id);
      return !!result;
    },

    // Document Mutations
    createDocumentEntity: async (
      _: unknown,
      { entityId, name }: { entityId: string; name: string }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.create({
        entityId,
        name,
        groups: []
      });
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    updateDocumentEntity: async (
      _: unknown,
      { entityId, name }: { entityId: string; name?: string }
    ) => {
      await connectToDatabase();
      
      const updateData: any = {};
      if (name) updateData.name = name;
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        { entityId },
        updateData,
        { new: true }
      );
      
      if (!entity) {
        throw new Error('Document entity not found');
      }
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    deleteDocumentEntity: async (
      _: unknown,
      { entityId }: { entityId: string }
    ) => {
      await connectToDatabase();
      
      const result = await DocumentEntity.findOneAndDelete({ entityId });
      return !!result;
    },

    addDocumentGroup: async (
      _: unknown,
      { entityId, groupId, groupName }: { entityId: string; groupId: string; groupName: string }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        { entityId },
        {
          $push: {
            groups: {
              id: groupId,
              name: groupName,
              documents: []
            }
          }
        },
        { new: true }
      );
      
      if (!entity) {
        throw new Error('Document entity not found');
      }
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    updateDocumentGroup: async (
      _: unknown,
      { entityId, groupId, groupName }: { entityId: string; groupId: string; groupName: string }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        { entityId, 'groups.id': groupId },
        {
          $set: {
            'groups.$.name': groupName
          }
        },
        { new: true }
      );
      
      if (!entity) {
        throw new Error('Document entity or group not found');
      }
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    deleteDocumentGroup: async (
      _: unknown,
      { entityId, groupId }: { entityId: string; groupId: string }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        { entityId },
        {
          $pull: {
            groups: { id: groupId }
          }
        },
        { new: true }
      );
      
      if (!entity) {
        throw new Error('Document entity not found');
      }
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    addDocument: async (
      _: unknown,
      { entityId, groupId, document }: { entityId: string; groupId: string; document: any }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        { entityId, 'groups.id': groupId },
        {
          $push: {
            'groups.$.documents': document
          }
        },
        { new: true }
      );
      
      if (!entity) {
        throw new Error('Document entity or group not found');
      }
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    updateDocument: async (
      _: unknown,
      { entityId, groupId, documentId, document }: { entityId: string; groupId: string; documentId: string; document: any }
    ) => {
      await connectToDatabase();
      
      // Find the entity and update the specific document
      const entity: any = await DocumentEntity.findOne({ entityId, 'groups.id': groupId });
      
      if (!entity) {
        throw new Error('Document entity or group not found');
      }
      
      const group = entity.groups.find((g: any) => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      const docIndex = group.documents.findIndex((d: any) => d.id === documentId);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }
      
      // Update the document
      group.documents[docIndex] = { ...group.documents[docIndex], ...document };
      
      await entity.save();
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    deleteDocument: async (
      _: unknown,
      { entityId, groupId, documentId }: { entityId: string; groupId: string; documentId: string }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.findOne({ entityId, 'groups.id': groupId });
      
      if (!entity) {
        throw new Error('Document entity or group not found');
      }
      
      const group = entity.groups.find((g: any) => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      group.documents = group.documents.filter((d: any) => d.id !== documentId);
      
      await entity.save();
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    // Lab Case Mutations
    createLabCase: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      // Generate unique case ID
      const count = await LabCase.countDocuments();
      const caseId = `LAB-${String(count + 1).padStart(6, '0')}`;
      
      const labCase = new LabCase({
        ...input,
        caseId,
        status: 'in-planning'
      });
      
      await labCase.save();
      
      return {
        ...labCase.toObject(),
        id: labCase._id.toString()
      };
    },

    updateLabCase: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      const labCase: any = await LabCase.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!labCase) {
        throw new Error('Lab case not found');
      }
      
      return {
        ...labCase.toObject(),
        id: labCase._id.toString()
      };
    },

    deleteLabCase: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      
      const result = await LabCase.findByIdAndDelete(id);
      return !!result;
    },

    // Employee Mutations
    createEmployee: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      // Check if employeeId already exists
      const existing = await Employee.findOne({ employeeId: input.employeeId });
      if (existing) {
        throw new Error(`Employee with ID ${input.employeeId} already exists`);
      }
      
      const employee = await Employee.create({
        ...input,
        status: input.status || 'active'
      });
      
      return {
        ...employee.toObject(),
        id: employee._id.toString(),
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString()
      };
    },

    updateEmployee: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      const employee: any = await Employee.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      ).lean();
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      return {
        ...employee,
        id: employee._id.toString(),
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString()
      };
    },

    deleteEmployee: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      
      const result = await Employee.findByIdAndDelete(id);
      return !!result;
    }
  }
};
