import { connectToDatabase } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';
import User from '@/models/User';
import DirectoryEntity from '@/models/DirectoryEntity';
import DirectoryEntry from '@/models/DirectoryEntry';
import ClinicLocation from '@/models/ClinicLocation';
import FrontDeskSchedule from '@/models/FrontDeskSchedule';
import DoctorSchedule from '@/models/DoctorSchedule';
import Ticket from '@/models/Ticket';

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
    }
  }
};
