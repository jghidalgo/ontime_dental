import { connectToDatabase } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';
import User from '@/models/User';
import DirectoryEntity from '@/models/DirectoryEntity';
import DirectoryEntry from '@/models/DirectoryEntry';
import ClinicLocation from '@/models/ClinicLocation';
import type { Types } from 'mongoose';

interface MongoDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

export const resolvers = {
  Query: {
    health: () => 'ok',

    // Directory Queries
    directoryEntities: async () => {
      await connectToDatabase();
      return await DirectoryEntity.find().lean();
    },

    directoryEntity: async (_: unknown, { entityId }: { entityId: string }) => {
      await connectToDatabase();
      return await DirectoryEntity.findOne({ entityId }).lean();
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
      return await DirectoryEntry.find(filter).lean();
    },

    directoryEntityWithEntries: async (_: unknown, { entityId }: { entityId: string }) => {
      await connectToDatabase();
      
      const entity = await DirectoryEntity.findOne({ entityId }).lean();
      if (!entity) {
        throw new Error('Entity not found');
      }

      const allEntries = await DirectoryEntry.find({ entityId }).lean();

      return {
        id: (entity as MongoDocument)._id.toString(),
        entityId: (entity as any).entityId,
        name: (entity as any).name,
        corporate: allEntries
          .filter((e: any) => e.group === 'corporate')
          .map((e: any) => ({ ...e, id: e._id.toString() })),
        frontdesk: allEntries
          .filter((e: any) => e.group === 'frontdesk')
          .map((e: any) => ({ ...e, id: e._id.toString() })),
        offices: allEntries
          .filter((e: any) => e.group === 'offices')
          .map((e: any) => ({ ...e, id: e._id.toString() }))
      };
    },

    allDirectoryData: async () => {
      await connectToDatabase();
      
      const entities = await DirectoryEntity.find().lean();
      const allEntries = await DirectoryEntry.find().lean();

      return entities.map((entity: any) => {
        const entityEntries = allEntries.filter((e: any) => e.entityId === entity.entityId);
        
        return {
          id: entity._id.toString(),
          entityId: entity.entityId,
          name: entity.name,
          corporate: entityEntries
            .filter((e: any) => e.group === 'corporate')
            .map((e: any) => ({ ...e, id: e._id.toString() })),
          frontdesk: entityEntries
            .filter((e: any) => e.group === 'frontdesk')
            .map((e: any) => ({ ...e, id: e._id.toString() })),
          offices: entityEntries
            .filter((e: any) => e.group === 'offices')
            .map((e: any) => ({ ...e, id: e._id.toString() }))
        };
      });
    },

    // Clinic Location Queries
    clinicLocations: async () => {
      await connectToDatabase();
      return await ClinicLocation.find().lean();
    },

    clinicLocation: async (_: unknown, { companyId }: { companyId: string }) => {
      await connectToDatabase();
      return await ClinicLocation.findOne({ companyId }).lean();
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
      return entity.toObject();
    },

    createDirectoryEntry: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      const entry = await DirectoryEntry.create(input);
      return entry.toObject();
    },

    updateDirectoryEntry: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      const entry = await DirectoryEntry.findByIdAndUpdate(id, input, { new: true });
      if (!entry) {
        throw new Error('Directory entry not found');
      }
      return entry.toObject();
    },

    deleteDirectoryEntry: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const result = await DirectoryEntry.findByIdAndDelete(id);
      return !!result;
    },

    // Clinic Location Mutations
    createClinicLocation: async (_: unknown, args: any) => {
      await connectToDatabase();
      const location = await ClinicLocation.create(args);
      return location.toObject();
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
      return location.toObject();
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
      return location.toObject();
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
      return location.toObject();
    }
  }
};

