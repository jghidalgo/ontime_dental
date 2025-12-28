import { connectToDatabase } from '@/lib/db';
import { createToken, verifyPassword, verifyToken } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import User from '@/models/User';
import DirectoryEntity from '@/models/DirectoryEntity';
import DirectoryEntry from '@/models/DirectoryEntry';
import ClinicLocation from '@/models/ClinicLocation';
import Laboratory from '@/models/Laboratory';
import FrontDeskSchedule from '@/models/FrontDeskSchedule';
import DoctorSchedule from '@/models/DoctorSchedule';
import Ticket from '@/models/Ticket';
import Patient from '@/models/Patient';
import LabCase from '@/models/LabCase';
import DocumentEntity from '@/models/Document';
import DocumentGroup from '@/models/DocumentGroup';
import Employee from '@/models/Employee';
import Company from '@/models/Company';
import PTO from '@/models/PTO';
import Notification from '@/models/Notification';
import CompanyPTOPolicy from '@/models/CompanyPTOPolicy';
import Insurance from '@/models/Insurance';
import DMSIntegration from '@/models/DMSIntegration';
import QRCode from 'qrcode';

function getBearerToken(ctx: { req?: { headers?: { get?: (key: string) => string | null } } }) {
  const authHeader = ctx?.req?.headers?.get?.('authorization') || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
}

async function getAuthedUser(ctx: { req?: { headers?: { get?: (key: string) => string | null } } }) {
  const token = getBearerToken(ctx);
  if (!token) throw new Error('Unauthorized');
  const payload = verifyToken(token);
  const userId = typeof payload.sub === 'string' ? payload.sub : '';
  if (!userId) throw new Error('Unauthorized');
  const user: any = await User.findById(userId).lean();
  if (!user) throw new Error('Unauthorized');
  return { user, payload };
}

export const resolvers = {
  Query: {
    health: () => 'ok',

    notifications: async (
      _: unknown,
      { unreadOnly, limit, offset }: { unreadOnly?: boolean; limit?: number; offset?: number },
      ctx: { req?: { headers?: { get?: (key: string) => string | null } } }
    ) => {
      await connectToDatabase();
      const { user } = await getAuthedUser(ctx);

      const safeLimit = typeof limit === 'number' && limit > 0 ? Math.min(limit, 50) : 10;
      const safeOffset = typeof offset === 'number' && offset >= 0 ? offset : 0;

      const filter: any = { userId: user._id.toString() };
      if (unreadOnly) {
        filter.$or = [{ readAt: null }, { readAt: { $exists: false } }];
      }

      const rows = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .skip(safeOffset)
        .lean();

      return rows.map((n: any) => ({
        ...n,
        id: n._id.toString(),
        createdAt: n.createdAt.toISOString(),
        readAt: n.readAt ? n.readAt.toISOString() : null
      }));
    },

    unreadNotificationCount: async (
      _: unknown,
      __: unknown,
      ctx: { req?: { headers?: { get?: (key: string) => string | null } } }
    ) => {
      await connectToDatabase();
      const { user } = await getAuthedUser(ctx);
      return Notification.countDocuments({ userId: user._id.toString(), $or: [{ readAt: null }, { readAt: { $exists: false } }] });
    },

    // Directory Queries
    directoryEntities: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const entities = await DirectoryEntity.find(filter).lean();
      return entities.map((entity: any) => ({
        ...entity,
        id: entity._id.toString()
      }));
    },

    directoryEntity: async (_: unknown, { entityId, companyId }: { entityId: string; companyId?: string }) => {
      await connectToDatabase();
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      const entity: any = await DirectoryEntity.findOne(filter).lean();
      if (!entity) return null;
      return {
        ...entity,
        id: entity._id.toString()
      };
    },

    directoryEntriesByEntity: async (
      _: unknown,
      { entityId, group, companyId }: { entityId: string; group?: string; companyId?: string }
    ) => {
      await connectToDatabase();
      const filter: { entityId: string; group?: string; companyId?: string } = { entityId };
      if (group) {
        filter.group = group;
      }
      if (companyId) {
        filter.companyId = companyId;
      }
      const entries = await DirectoryEntry.find(filter).sort({ order: 1 }).lean();
      return entries.map((entry: any) => ({
        ...entry,
        id: entry._id.toString()
      }));
    },

    directoryEntityWithEntries: async (_: unknown, { entityId, companyId }: { entityId: string; companyId?: string }) => {
      await connectToDatabase();
      
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      const entity: any = await DirectoryEntity.findOne(filter).lean();
      if (!entity) {
        throw new Error('Entity not found');
      }

      const entryFilter: any = { entityId };
      if (companyId) entryFilter.companyId = companyId;

      const allEntries: any[] = await DirectoryEntry.find(entryFilter).sort({ order: 1 }).lean();

      return {
        id: entity._id.toString(),
        entityId: entity.entityId,
        name: entity.name,
        companyId: entity.companyId,
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

    allDirectoryData: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      
      const filter = companyId ? { companyId } : {};
      const entities: any[] = await DirectoryEntity.find(filter).lean();
      const entryFilter = companyId ? { companyId } : {};
      const allEntries: any[] = await DirectoryEntry.find(entryFilter).sort({ order: 1 }).lean();

      return entities.map((entity) => {
        const entityEntries = allEntries.filter((e) => e.entityId === entity.entityId);
        
        return {
          id: entity._id.toString(),
          entityId: entity.entityId,
          name: entity.name,
          companyId: entity.companyId,
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

    // Company Queries
    companies: async () => {
      await connectToDatabase();
      const companies = await Company.find().sort({ createdAt: -1 }).lean();
      return companies.map((company: any) => ({
        ...company,
        id: company._id.toString(),
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      }));
    },

    company: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const company: any = await Company.findById(id).lean();
      if (!company) return null;
      return {
        ...company,
        id: company._id.toString(),
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      };
    },

    // Company PTO Policy Queries
    companyPTOPolicies: async (_: unknown, { companyId }: { companyId: string }) => {
      await connectToDatabase();

      const defaultLeaveTypes = [
        {
          id: 'paid-pto',
          name: 'Paid PTO',
          hoursAllowed: 120,
          isPaid: true,
          isActive: true,
        },
        {
          id: 'unpaid-leave',
          name: 'Unpaid Leave',
          hoursAllowed: 9999,
          isPaid: false,
          isActive: true,
        },
      ];
      
      let policy: any = await CompanyPTOPolicy.findOne({ companyId }).lean();
      
      // If no policy exists, create one with default leave types
      if (!policy) {
        const created = await CompanyPTOPolicy.create({
          companyId,
          leaveTypes: defaultLeaveTypes,
        });
        policy = created.toObject();
      }

      // If a policy exists but has no leave types (legacy/empty), backfill defaults.
      if (!Array.isArray(policy.leaveTypes) || policy.leaveTypes.length === 0) {
        policy = await CompanyPTOPolicy.findOneAndUpdate(
          { companyId },
          { $set: { leaveTypes: defaultLeaveTypes } },
          { new: true }
        ).lean();
      }
      
      return {
        ...policy,
        id: policy._id.toString(),
        createdAt: policy.createdAt?.toISOString(),
        updatedAt: policy.updatedAt?.toISOString(),
      };
    },

    // User Queries
    users: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const users = await User.find(filter).sort({ createdAt: -1 }).lean();
      return users.map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
        phone: user.phone || null,
        position: user.position || null,
        department: user.department || null,
        isActive: user.isActive ?? true,
        permissions: user.permissions || {
          modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'laboratory', 'hr', 'insurances', 'complaints', 'licenses', 'medication', 'settings']
        },
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));
    },

    user: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const user: any = await User.findById(id).lean();
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
        phone: user.phone || null,
        position: user.position || null,
        department: user.department || null,
        isActive: user.isActive ?? true,
        permissions: user.permissions || {
          modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'laboratory', 'hr', 'insurances', 'complaints', 'licenses', 'medication', 'settings']
        },
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },

    // Clinic Location Queries
    clinicLocations: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const locations = await ClinicLocation.find(filter).lean();
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

    // Laboratory Queries
    laboratories: async () => {
      await connectToDatabase();
      const laboratories = await Laboratory.find().sort({ name: 1 }).lean();
      return laboratories.map((lab: any) => ({
        ...lab,
        id: lab._id.toString(),
        createdAt: lab.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: lab.updatedAt?.toISOString() || new Date().toISOString()
      }));
    },

    laboratory: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const laboratory: any = await Laboratory.findById(id).lean();
      if (!laboratory) return null;
      return {
        ...laboratory,
        id: laboratory._id.toString(),
        createdAt: laboratory.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: laboratory.updatedAt?.toISOString() || new Date().toISOString()
      };
    },

    // Schedule Queries
    frontDeskSchedules: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const schedules = await FrontDeskSchedule.find(filter).lean();
      return schedules.map((schedule: any) => ({
        ...schedule,
        id: schedule._id.toString()
      }));
    },

    doctorSchedules: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const schedules = await DoctorSchedule.find(filter).lean();
      return schedules.map((schedule: any) => ({
        ...schedule,
        id: schedule._id.toString()
      }));
    },

    // Ticket Queries
    tickets: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).lean();
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
    documentEntities: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const entities = await DocumentEntity.find(filter).lean();
      return entities.map((entity: any) => ({
        ...entity,
        id: entity._id.toString()
      }));
    },

    documentEntity: async (_: unknown, { entityId, companyId }: { entityId: string; companyId?: string }) => {
      await connectToDatabase();
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      const entity: any = await DocumentEntity.findOne(filter).lean();
      if (!entity) return null;
      return {
        ...entity,
        id: entity._id.toString()
      };
    },

    // Document Group Queries
    documentGroups: async () => {
      await connectToDatabase();
      const groups = await DocumentGroup.find().sort({ order: 1 }).lean();
      return groups.map((group: any) => ({
        ...group,
        id: group._id.toString()
      }));
    },

    activeDocumentGroups: async () => {
      await connectToDatabase();
      const groups = await DocumentGroup.find({ isActive: true }).sort({ order: 1 }).lean();
      return groups.map((group: any) => ({
        ...group,
        id: group._id.toString()
      }));
    },

    documentGroup: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const group: any = await DocumentGroup.findById(id).lean();
      if (!group) return null;
      return {
        ...group,
        id: group._id.toString()
      };
    },

    // Lab Case Queries
    labCases: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      const filter = companyId ? { companyId } : {};
      const cases = await LabCase.find(filter).sort({ createdAt: -1 }).lean();
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

    labCaseByNumber: async (_: unknown, { caseId, companyId }: { caseId: string; companyId?: string }) => {
      await connectToDatabase();
      const filter: any = { caseId };
      if (companyId) filter.companyId = companyId;
      const labCase: any = await LabCase.findOne(filter).lean();
      if (!labCase) return null;
      return {
        ...labCase,
        id: labCase._id.toString()
      };
    },

    productionBoardCases: async (
      _: unknown, 
      { companyId, productionStage, technicianId }: { companyId: string; productionStage?: string; technicianId?: string }
    ) => {
      await connectToDatabase();
      const filter: any = { 
        companyId,
        status: { $in: ['in-production', 'in-planning'] } // Get cases that are in production or planning
      };
      
      if (productionStage) {
        filter.productionStage = productionStage;
      }
      
      if (technicianId) {
        filter.technicianId = technicianId;
      }
      
      const cases = await LabCase.find(filter)
        .sort({ priority: -1, createdAt: -1 }) // Sort by priority first (urgent, rush, normal), then by creation date
        .lean();
        
      return cases.map((labCase: any) => ({
        ...labCase,
        id: labCase._id.toString()
      }));
    },

    billingCases: async (
      _: unknown,
      { companyId, startDate, endDate }: { companyId: string; startDate?: string; endDate?: string }
    ) => {
      await connectToDatabase();
      const filter: any = {
        companyId,
        status: 'completed' // Only get completed cases for billing
      };

      // Filter by date range if provided
      if (startDate || endDate) {
        filter.actualCompletion = {};
        if (startDate) {
          filter.actualCompletion.$gte = startDate;
        }
        if (endDate) {
          filter.actualCompletion.$lte = endDate;
        }
      }

      const cases = await LabCase.find(filter)
        .sort({ actualCompletion: -1 })
        .lean();

      return cases.map((labCase: any) => ({
        ...labCase,
        id: labCase._id.toString()
      }));
    },

    transitCases: async (
      _: unknown,
      { companyId, transitStatus }: { companyId: string; transitStatus?: string }
    ) => {
      await connectToDatabase();
      const filter: any = {
        companyId,
        status: 'in-transit' // Only get cases currently in transit
      };

      // Filter by specific transit status if provided
      if (transitStatus) {
        filter.transitStatus = transitStatus;
      }

      const cases = await LabCase.find(filter)
        .sort({ estimatedDelivery: 1, pickupDate: -1 })
        .lean();

      return cases.map((labCase: any) => ({
        ...labCase,
        id: labCase._id.toString()
      }));
    },

    transitRoutes: async (_: unknown, { companyId }: { companyId: string }) => {
      await connectToDatabase();
      
      // Get all in-transit cases for the company
      const cases = await LabCase.find({
        companyId,
        status: 'in-transit'
      }).lean();

      // Group cases by routeId
      const routesMap = new Map<string, any>();

      cases.forEach((labCase: any) => {
        const routeId = labCase.routeId || 'unassigned';
        
        if (!routesMap.has(routeId)) {
          routesMap.set(routeId, {
            routeId,
            companyId,
            routeName: routeId === 'unassigned' ? 'Unassigned' : `Route ${routeId}`,
            region: labCase.currentLocation || 'Unknown',
            cases: [],
            clinics: new Set(),
            estimatedDeparture: null,
            estimatedArrival: null,
            status: 'in-transit',
            courierService: labCase.courierService || 'Unknown'
          });
        }

        const route = routesMap.get(routeId);
        route.cases.push({
          ...labCase,
          id: labCase._id.toString()
        });
        route.clinics.add(labCase.clinic);

        // Update earliest departure and latest arrival
        if (!route.estimatedDeparture || (labCase.pickupDate && labCase.pickupDate < route.estimatedDeparture)) {
          route.estimatedDeparture = labCase.pickupDate;
        }
        if (!route.estimatedArrival || (labCase.estimatedDelivery && labCase.estimatedDelivery > route.estimatedArrival)) {
          route.estimatedArrival = labCase.estimatedDelivery;
        }
      });

      // Convert map to array and format
      return Array.from(routesMap.values()).map(route => ({
        ...route,
        totalCases: route.cases.length,
        clinics: Array.from(route.clinics)
      }));
    },

    // Patient Queries
    patients: async (_: unknown, { companyId, search }: { companyId?: string; search?: string }) => {
      await connectToDatabase();
      const filter: any = {};
      
      if (companyId) {
        filter.companyId = companyId;
      }
      
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ];
      }
      
      const patients = await Patient.find(filter).sort({ lastName: 1, firstName: 1 }).lean();
      return patients.map((patient: any) => ({
        ...patient,
        id: patient._id.toString()
      }));
    },

    patient: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const patient: any = await Patient.findById(id).lean();
      if (!patient) return null;
      return {
        ...patient,
        id: patient._id.toString()
      };
    },

    // Employee Queries
    employees: async (
      _: unknown,
      {
        companyId,
        search,
        location,
        position,
        status,
        limit = 100,
        offset = 0
      }: {
        companyId?: string;
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
      
      // Filter by company
      if (companyId) {
        filter.companyId = companyId;
      }
      
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
        filter.position = { $regex: position, $options: 'i' };
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

    employeeByEmployeeId: async (_: unknown, { employeeId, companyId }: { employeeId: string; companyId?: string }) => {
      await connectToDatabase();
      const filter: any = { employeeId };
      if (companyId) filter.companyId = companyId;
      const employee: any = await Employee.findOne(filter).lean();
      if (!employee) return null;
      return {
        ...employee,
        id: employee._id.toString(),
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString()
      };
    },

    employeeLocationDistribution: async (_: unknown, { companyId }: { companyId?: string }) => {
      await connectToDatabase();
      
      // Build filter
      const filter: any = { status: 'active' };
      if (companyId) {
        // Some seed/demo employee records may not have a companyId.
        // Include those "unassigned" employees so the widget still populates.
        filter.$or = [
          { companyId },
          { companyId: { $exists: false } },
          { companyId: null },
          { companyId: '' }
        ];
      }
      
      // Aggregate employees by location
      const distribution = await Employee.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Define colors for each location
      const colors = [
        '#34d399', // emerald
        '#60a5fa', // blue
        '#f97316', // orange
        '#a855f7', // purple
        '#f472b6', // pink
        '#38bdf8', // sky
        '#fb923c', // orange-400
        '#4ade80', // green-400
        '#818cf8', // indigo-400
        '#fbbf24'  // amber-400
      ];
      
      return distribution.map((item: any, index: number) => ({
        location: item._id || 'Not Assigned',
        count: item.count,
        color: colors[index % colors.length]
      }));
    },

    // PTO Queries
    ptos: async (_: unknown, { employeeId, companyId, status }: { employeeId?: string; companyId?: string; status?: string }) => {
      await connectToDatabase();
      const filter: any = {};
      if (employeeId) filter.employeeId = employeeId;
      if (companyId) filter.companyId = companyId;
      if (status) filter.status = status;
      
      const ptos = await PTO.find(filter).sort({ createdAt: -1 }).lean();
      return ptos.map((pto: any) => ({
        ...pto,
        id: pto._id.toString(),
        createdAt: pto.createdAt.toISOString(),
        updatedAt: pto.updatedAt.toISOString(),
        reviewedAt: pto.reviewedAt ? pto.reviewedAt.toISOString() : null
      }));
    },

    pto: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const pto: any = await PTO.findById(id).lean();
      if (!pto) return null;
      return {
        ...pto,
        id: pto._id.toString(),
        createdAt: pto.createdAt.toISOString(),
        updatedAt: pto.updatedAt.toISOString(),
        reviewedAt: pto.reviewedAt ? pto.reviewedAt.toISOString() : null
      };
    },

    employeePTOBalance: async (_: unknown, { employeeId }: { employeeId: string }) => {
      await connectToDatabase();
      const employee: any = await Employee.findOne({ employeeId }).lean();
      if (!employee) return null;
      
      const currentYear = new Date().getFullYear();
      
      // Reset PTO if it's a new year
      if (employee.ptoYear !== currentYear) {
        await Employee.findByIdAndUpdate(employee._id, {
          ptoYear: currentYear,
          ptoUsed: 0,
          ptoAvailable: employee.ptoAllowance || 15
        });
        
        return {
          ...employee,
          id: employee._id.toString(),
          ptoYear: currentYear,
          ptoUsed: 0,
          ptoAvailable: employee.ptoAllowance || 15
        };
      }
      
      return {
        ...employee,
        id: employee._id.toString()
      };
    },

    // Insurance Queries
    insurances: async (_: unknown, { companyId, isActive }: { companyId?: string; isActive?: boolean }) => {
      await connectToDatabase();
      const filter: any = {};
      if (companyId) filter.companyId = companyId;
      if (isActive !== undefined) filter.isActive = isActive;
      
      const insurances = await Insurance.find(filter).sort({ name: 1 }).lean();
      return insurances.map((ins: any) => ({
        ...ins,
        id: ins._id.toString(),
        createdAt: ins.createdAt.toISOString(),
        updatedAt: ins.updatedAt.toISOString()
      }));
    },

    insurance: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const insurance: any = await Insurance.findById(id).lean();
      if (!insurance) return null;
      return {
        ...insurance,
        id: insurance._id.toString(),
        createdAt: insurance.createdAt.toISOString(),
        updatedAt: insurance.updatedAt.toISOString()
      };
    },

    insuranceByInsurerId: async (_: unknown, { insurerId, companyId }: { insurerId: string; companyId: string }) => {
      await connectToDatabase();
      const insurance: any = await Insurance.findOne({ 
        insurerId: insurerId.toUpperCase(), 
        companyId 
      }).lean();
      if (!insurance) return null;
      return {
        ...insurance,
        id: insurance._id.toString(),
        createdAt: insurance.createdAt.toISOString(),
        updatedAt: insurance.updatedAt.toISOString()
      };
    },

    // DMS Integration Queries
    dmsIntegrations: async (_: unknown, { companyId }: { companyId: string }) => {
      await connectToDatabase();
      const integrations = await DMSIntegration.find({ companyId }).sort({ createdAt: -1 }).lean();
      return integrations.map((integration: any) => ({
        ...integration,
        id: integration._id.toString(),
        createdAt: integration.createdAt.toISOString(),
        updatedAt: integration.updatedAt.toISOString(),
        lastSyncAt: integration.lastSyncAt ? integration.lastSyncAt.toISOString() : null,
        // Don't send password to frontend
        password: undefined,
      }));
    },

    dmsIntegration: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const integration: any = await DMSIntegration.findById(id).lean();
      if (!integration) return null;
      return {
        ...integration,
        id: integration._id.toString(),
        createdAt: integration.createdAt.toISOString(),
        updatedAt: integration.updatedAt.toISOString(),
        lastSyncAt: integration.lastSyncAt ? integration.lastSyncAt.toISOString() : null,
        // Don't send password to frontend
        password: undefined,
      };
    },

    dmsSyncStatus: async (_: unknown, { integrationId }: { integrationId: string }) => {
      await connectToDatabase();
      const integration: any = await DMSIntegration.findById(integrationId).lean();
      if (!integration) {
        throw new Error('Integration not found');
      }
      return {
        integrationId: integration._id.toString(),
        isRunning: integration.isSyncing || false,
        lastSyncAt: integration.lastSyncAt ? integration.lastSyncAt.toISOString() : null,
        lastSyncResult: integration.lastSyncResult || null,
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

      // Get default permissions based on role, or use stored permissions if they exist
      const defaultPermissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['dentist'];
      const permissions = user.permissions || defaultPermissions;

      // Ensure all permission fields are present (merge with defaults)
      const completePermissions = {
        modules: permissions.modules || defaultPermissions.modules,
        canModifySchedules: permissions.canModifySchedules ?? defaultPermissions.canModifySchedules,
        canModifyDocuments: permissions.canModifyDocuments ?? defaultPermissions.canModifyDocuments,
        canViewAllTickets: permissions.canViewAllTickets ?? defaultPermissions.canViewAllTickets,
        canModifyTickets: permissions.canModifyTickets ?? defaultPermissions.canModifyTickets,
        canViewReports: permissions.canViewReports ?? defaultPermissions.canViewReports,
        canManageUsers: permissions.canManageUsers ?? defaultPermissions.canManageUsers,
        canModifyContacts: permissions.canModifyContacts ?? defaultPermissions.canModifyContacts,
        canAccessLaboratory: permissions.canAccessLaboratory ?? defaultPermissions.canAccessLaboratory,
        canManageTransit: permissions.canManageTransit ?? defaultPermissions.canManageTransit
      };

      // Return full permissions object with all granular flags
      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          permissions: completePermissions
        }
      };
    },

    // Directory Mutations
    createDirectoryEntity: async (
      _: unknown,
      { entityId, name, companyId }: { entityId: string; name: string; companyId: string }
    ) => {
      await connectToDatabase();
      const entity = await DirectoryEntity.create({ entityId, name, companyId });
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

    reorderDirectoryEntries: async (_: unknown, { entityId, group, entryIds, companyId }: { entityId: string; group: string; entryIds: string[]; companyId?: string }) => {
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
    createClinicLocation: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      const location = await ClinicLocation.create(input);
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

    updateClinic: async (
      _: unknown,
      { companyId, clinicId, clinic }: { companyId: string; clinicId: string; clinic: any }
    ) => {
      await connectToDatabase();
      const location = await ClinicLocation.findOneAndUpdate(
        { companyId, 'clinics.clinicId': clinicId },
        { $set: { 'clinics.$': clinic } },
        { new: true }
      );
      if (!location) {
        throw new Error('Clinic location or clinic not found');
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

    // Laboratory Mutations
    createLaboratory: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      const laboratory = await Laboratory.create(input);
      return {
        ...laboratory.toObject(),
        id: laboratory._id.toString(),
        createdAt: laboratory.createdAt.toISOString(),
        updatedAt: laboratory.updatedAt.toISOString(),
      };
    },

    updateLaboratory: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      console.log('Updating laboratory:', id);
      console.log('Input data:', JSON.stringify(input, null, 2));
      
      // Ensure departments are properly structured
      if (input.departments) {
        input.departments = input.departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          description: dept.description || '',
          order: dept.order
        }));
      }
      
      const laboratory = await Laboratory.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!laboratory) {
        throw new Error('Laboratory not found');
      }
      
      console.log('Laboratory updated successfully:', laboratory._id);
      
      return {
        ...laboratory.toObject(),
        id: laboratory._id.toString(),
        createdAt: laboratory.createdAt.toISOString(),
        updatedAt: laboratory.updatedAt.toISOString(),
      };
    },

    deleteLaboratory: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const laboratory = await Laboratory.findByIdAndDelete(id);
      if (!laboratory) {
        return {
          success: false,
          message: 'Laboratory not found'
        };
      }
      return {
        success: true,
        message: 'Laboratory deleted successfully'
      };
    },

    // Company Mutations
    createCompany: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      const company = await Company.create({
        ...input,
        isActive: true,
      });
      return {
        ...company.toObject(),
        id: company._id.toString(),
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      };
    },

    updateCompany: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      const company = await Company.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true }
      );
      if (!company) {
        throw new Error('Company not found');
      }
      return {
        ...company.toObject(),
        id: company._id.toString(),
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      };
    },

    deleteCompany: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const result = await Company.findByIdAndDelete(id);
      return !!result;
    },

    // User Mutations
    createUser: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      // Check if email already exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      const user = await User.create({
        ...input,
        isActive: true,
      });
      
      // Automatically create an employee record for this user
      const employeeCount = await Employee.countDocuments();
      const employeeId = `EMP-${String(employeeCount + 1).padStart(3, '0')}`;
      const today = new Date();
      const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
      
      await Employee.create({
        employeeId,
        userId: user._id.toString(),
        companyId: input.companyId || null,
        name: input.name,
        joined: formattedDate, // MM/DD/YYYY format
        dateOfBirth: '01/01/1990', // Default, should be updated later
        phone: input.phone || '(000) 000-0000',
        position: input.position || 'Staff',
        location: input.department || 'Main Office', // Use department as location
        email: input.email,
        department: input.department || 'General',
        status: 'active',
      });
      
      const userObject = user.toObject();
      return {
        id: user._id.toString(),
        name: userObject.name,
        email: userObject.email,
        role: userObject.role,
        companyId: userObject.companyId || null,
        phone: userObject.phone || null,
        position: userObject.position || null,
        department: userObject.department || null,
        isActive: userObject.isActive ?? true,
        permissions: userObject.permissions || {
          modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'laboratory', 'hr', 'insurances', 'complaints', 'licenses', 'medication', 'settings']
        },
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },

    updateUser: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      // If email is being updated, check if it's already in use
      if (input.email) {
        const existingUser = await User.findOne({ 
          email: input.email,
          _id: { $ne: id }
        });
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true }
      );
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update the corresponding employee record
      const employeeUpdate: any = {};
      if (input.name) employeeUpdate.name = input.name;
      if (input.phone) employeeUpdate.phone = input.phone;
      if (input.email) employeeUpdate.email = input.email;
      if (input.position) employeeUpdate.position = input.position;
      if (input.department) employeeUpdate.department = input.department;
      if (input.companyId !== undefined) employeeUpdate.companyId = input.companyId;
      
      if (Object.keys(employeeUpdate).length > 0) {
        await Employee.findOneAndUpdate(
          { userId: id },
          { $set: employeeUpdate },
          { new: true }
        );
      }
      
      const userObject = user.toObject();
      return {
        id: user._id.toString(),
        name: userObject.name,
        email: userObject.email,
        role: userObject.role,
        companyId: userObject.companyId || null,
        phone: userObject.phone || null,
        position: userObject.position || null,
        department: userObject.department || null,
        isActive: userObject.isActive ?? true,
        permissions: userObject.permissions || {
          modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'laboratory', 'hr', 'insurances', 'complaints', 'licenses', 'medication', 'settings']
        },
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },

    deleteUser: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      // Delete the user
      const result = await User.findByIdAndDelete(id);
      // Also delete the corresponding employee record
      if (result) {
        await Employee.findOneAndDelete({ userId: id });
      }
      return !!result;
    },

    // Schedule Mutations
    updateFrontDeskSchedule: async (
      _: unknown,
      { positionId, clinicId, employee, companyId }: { positionId: string; clinicId: string; employee?: any; companyId: string }
    ) => {
      await connectToDatabase();
      const schedule = await FrontDeskSchedule.findOneAndUpdate(
        { positionId, clinicId, companyId },
        { employee: employee || null, companyId },
        { new: true, upsert: true }
      );
      return {
        ...schedule.toObject(),
        id: schedule._id.toString()
      };
    },

    updateDoctorSchedule: async (
      _: unknown,
      { dayId, clinicId, doctor, companyId }: { dayId: string; clinicId: string; doctor?: any; companyId: string }
    ) => {
      await connectToDatabase();
      const schedule = await DoctorSchedule.findOneAndUpdate(
        { dayId, clinicId, companyId },
        { doctor: doctor || null, companyId },
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
        targetClinicId,
        companyId
      }: {
        sourcePositionId: string;
        sourceClinicId: string;
        targetPositionId: string;
        targetClinicId: string;
        companyId: string;
      }
    ) => {
      await connectToDatabase();

      const source = await FrontDeskSchedule.findOne({ positionId: sourcePositionId, clinicId: sourceClinicId, companyId });
      const target = await FrontDeskSchedule.findOne({ positionId: targetPositionId, clinicId: targetClinicId, companyId });

      const sourceEmployee = source?.employee || null;
      const targetEmployee = target?.employee || null;

      // Swap the assignments
      const updatedSource = await FrontDeskSchedule.findOneAndUpdate(
        { positionId: sourcePositionId, clinicId: sourceClinicId, companyId },
        { employee: targetEmployee, companyId },
        { new: true, upsert: true }
      );

      const updatedTarget = await FrontDeskSchedule.findOneAndUpdate(
        { positionId: targetPositionId, clinicId: targetClinicId, companyId },
        { employee: sourceEmployee, companyId },
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
        targetClinicId,
        companyId
      }: {
        sourceDayId: string;
        sourceClinicId: string;
        targetDayId: string;
        targetClinicId: string;
        companyId: string;
      }
    ) => {
      await connectToDatabase();

      const source = await DoctorSchedule.findOne({ dayId: sourceDayId, clinicId: sourceClinicId, companyId });
      const target = await DoctorSchedule.findOne({ dayId: targetDayId, clinicId: targetClinicId, companyId });

      const sourceDoctor = source?.doctor || null;
      const targetDoctor = target?.doctor || null;

      // Swap the assignments
      const updatedSource = await DoctorSchedule.findOneAndUpdate(
        { dayId: sourceDayId, clinicId: sourceClinicId, companyId },
        { doctor: targetDoctor, companyId },
        { new: true, upsert: true }
      );

      const updatedTarget = await DoctorSchedule.findOneAndUpdate(
        { dayId: targetDayId, clinicId: targetClinicId, companyId },
        { doctor: sourceDoctor, companyId },
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
      { entityId, name, companyId }: { entityId: string; name: string; companyId: string }
    ) => {
      await connectToDatabase();
      
      const entity: any = await DocumentEntity.create({
        entityId,
        name,
        companyId,
        groups: []
      });
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    updateDocumentEntity: async (
      _: unknown,
      { entityId, name, companyId }: { entityId: string; name?: string; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const updateData: any = {};
      if (name) updateData.name = name;
      
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        filter,
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
      { entityId, companyId }: { entityId: string; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      
      const result = await DocumentEntity.findOneAndDelete(filter);
      return !!result;
    },

    addDocumentEntityGroup: async (
      _: unknown,
      { entityId, groupId, groupName, companyId }: { entityId: string; groupId: string; groupName: string; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        filter,
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

    updateDocumentEntityGroup: async (
      _: unknown,
      { entityId, groupId, groupName, companyId }: { entityId: string; groupId: string; groupName: string; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId, 'groups.id': groupId };
      if (companyId) filter.companyId = companyId;
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        filter,
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

    deleteDocumentEntityGroup: async (
      _: unknown,
      { entityId, groupId, companyId }: { entityId: string; groupId: string; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      
      const entity: any = await DocumentEntity.findOneAndUpdate(
        filter,
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
      { entityId, groupId, document, companyId }: { entityId: string; groupId: string; document: any; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId };
      if (companyId) filter.companyId = companyId;
      
      // First, try to find the entity
      let entity: any = await DocumentEntity.findOne(filter);
      
      if (!entity) {
        // If entity doesn't exist, create it
        // Get the global document group to use its name
        const documentGroup: any = await DocumentGroup.findById(groupId).lean();
        if (!documentGroup) {
          throw new Error('Document group not found');
        }
        
        entity = await DocumentEntity.create({
          entityId,
          name: entityId, // You might want to pass a proper name
          companyId: companyId || undefined,
          groups: [{
            id: groupId,
            name: documentGroup.name,
            documents: [document]
          }]
        });
      } else {
        // Entity exists, check if group exists
        const groupExists = entity.groups.some((g: any) => g.id === groupId);
        
        if (!groupExists) {
          // Group doesn't exist in entity, add it
          const documentGroup: any = await DocumentGroup.findById(groupId).lean();
          if (!documentGroup) {
            throw new Error('Document group not found');
          }
          
          entity.groups.push({
            id: groupId,
            name: documentGroup.name,
            documents: [document]
          });
          await entity.save();
        } else {
          // Group exists, just add the document
          const groupIndex = entity.groups.findIndex((g: any) => g.id === groupId);
          entity.groups[groupIndex].documents.push(document);
          await entity.save();
        }
      }
      
      return {
        ...entity.toObject(),
        id: entity._id.toString()
      };
    },

    updateDocument: async (
      _: unknown,
      { entityId, groupId, documentId, document, companyId }: { entityId: string; groupId: string; documentId: string; document: any; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId, 'groups.id': groupId };
      if (companyId) filter.companyId = companyId;
      
      // Find the entity and update the specific document
      const entity: any = await DocumentEntity.findOne(filter);
      
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
      { entityId, groupId, documentId, companyId }: { entityId: string; groupId: string; documentId: string; companyId?: string }
    ) => {
      await connectToDatabase();
      
      const filter: any = { entityId, 'groups.id': groupId };
      if (companyId) filter.companyId = companyId;
      
      const entity: any = await DocumentEntity.findOne(filter);
      
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

    // Document Group Mutations
    createDocumentGroup: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      // Get the current max order
      const maxOrderGroup: any = await DocumentGroup.findOne().sort({ order: -1 }).lean();
      const nextOrder = maxOrderGroup?.order ? maxOrderGroup.order + 1 : 1;
      
      const group = await DocumentGroup.create({
        name: input.name,
        description: input.description,
        order: input.order || nextOrder,
        isActive: input.isActive !== false
      });
      
      return {
        ...group.toObject(),
        id: group._id.toString()
      };
    },

    updateDocumentGroup: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      const group: any = await DocumentGroup.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!group) {
        throw new Error('Document group not found');
      }
      
      return {
        ...group.toObject(),
        id: group._id.toString()
      };
    },

    deleteDocumentGroup: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      
      const result = await DocumentGroup.findByIdAndDelete(id);
      
      return {
        success: !!result,
        message: result ? 'Document group deleted successfully' : 'Document group not found'
      };
    },

    reorderDocumentGroups: async (_: unknown, { groupIds }: { groupIds: string[] }) => {
      await connectToDatabase();
      
      // Update order for each group
      const updatePromises = groupIds.map((id, index) =>
        DocumentGroup.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
      );
      
      const groups = await Promise.all(updatePromises);
      
      return groups
        .filter((group): group is any => group !== null)
        .map((group: any) => ({
          ...group.toObject(),
          id: group._id.toString()
        }));
    },

    // Lab Case Mutations
    createLabCase: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      let patientId = input.patientId;
      
      // If no patientId provided, check if patient exists or create new one
      if (!patientId) {
        const { patientFirstName, patientLastName, birthday, companyId } = input;
        
        if (!patientFirstName || !patientLastName || !birthday) {
          throw new Error('Patient information is required');
        }
        
        // Check if patient exists (same name, birthday, and company)
        let existingPatient: any = await Patient.findOne({
          firstName: patientFirstName,
          lastName: patientLastName,
          birthday: new Date(birthday),
          companyId: companyId
        }).lean();
        
        if (existingPatient) {
          // Use existing patient
          patientId = existingPatient._id.toString();
          console.log(`Using existing patient: ${patientId} for ${patientFirstName} ${patientLastName}`);
        } else {
          // Create new patient
          const newPatient = await Patient.create({
            firstName: patientFirstName,
            lastName: patientLastName,
            birthday: new Date(birthday),
            companyId: companyId || undefined
          });
          patientId = newPatient._id.toString();
          console.log(`Created new patient: ${patientId} for ${patientFirstName} ${patientLastName}`);
        }
      }
      
      // Generate unique case ID
      const count = await LabCase.countDocuments();
      const caseId = `LAB-${String(count + 1).padStart(6, '0')}`;
      
      // Generate QR Code data
      // Include: Case ID, Patient Name, Lab, Procedure, Date, and a verification hash
      const qrCodeData = JSON.stringify({
        caseId,
        patient: `${input.patientFirstName} ${input.patientLastName}`,
        lab: input.lab,
        procedure: input.procedure,
        date: input.reservationDate,
        clinic: input.clinic,
        timestamp: new Date().toISOString(),
        // You could add a hash here for verification if needed
        verify: Buffer.from(`${caseId}-${input.companyId}-${Date.now()}`).toString('base64').substring(0, 16)
      });
      
      // Generate QR Code as base64 image
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });
      
      // Create lab case with patient reference and QR code
      const labCase = new LabCase({
        ...input,
        caseId,
        patientId,
        qrCode: qrCodeImage,
        qrCodeData,
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

    updateTransitStatus: async (
      _: unknown,
      { id, transitStatus, location, notes }: { id: string; transitStatus: string; location?: string; notes?: string }
    ) => {
      await connectToDatabase();
      
      const labCase: any = await LabCase.findById(id);
      
      if (!labCase) {
        throw new Error('Lab case not found');
      }

      // Create transit history entry
      const historyEntry = {
        timestamp: new Date().toISOString(),
        location: location || labCase.currentLocation || 'Unknown',
        status: transitStatus,
        notes: notes || ''
      };

      // Update the case
      const updateData: any = {
        transitStatus,
        currentLocation: location || labCase.currentLocation
      };

      // Add to transit history
      if (!labCase.transitHistory) {
        labCase.transitHistory = [];
      }
      labCase.transitHistory.push(historyEntry);
      updateData.transitHistory = labCase.transitHistory;

      // If delivered, set actual delivery date
      if (transitStatus === 'delivered') {
        updateData.actualDelivery = new Date().toISOString();
        updateData.status = 'completed';
      }

      const updatedCase: any = await LabCase.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return {
        ...updatedCase.toObject(),
        id: updatedCase._id.toString()
      };
    },

    deleteLabCase: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      
      const result = await LabCase.findByIdAndDelete(id);
      return !!result;
    },

    // Patient Mutations
    createPatient: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      const patient = await Patient.create(input);
      
      return {
        ...patient.toObject(),
        id: patient._id.toString()
      };
    },

    updatePatient: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      const patient: any = await Patient.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );
      
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      return {
        ...patient.toObject(),
        id: patient._id.toString()
      };
    },

    deletePatient: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      
      // Check if patient has any lab cases
      const labCaseCount = await LabCase.countDocuments({ patientId: id });
      if (labCaseCount > 0) {
        throw new Error('Cannot delete patient with existing lab cases');
      }
      
      const result = await Patient.findByIdAndDelete(id);
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
    },

    // PTO Mutations
    createPTO: async (
      _: unknown,
      { input }: { input: any },
      ctx: { req?: { headers?: { get?: (key: string) => string | null } } }
    ) => {
      await connectToDatabase();

      const { user, payload } = await getAuthedUser(ctx);

      const requesterEmailRaw = typeof payload.email === 'string' && payload.email ? payload.email : user.email;
      const requesterEmail = typeof requesterEmailRaw === 'string' ? requesterEmailRaw.toLowerCase() : '';
      const requesterName = typeof user.name === 'string' ? user.name : 'User';

      const companyId = input.companyId || user.companyId;
      
      const pto = new PTO({
        ...input,
        companyId,
        status: 'pending'
        ,
        requestedBy: requesterEmail || requesterName
      });
      await pto.save();

      // Notify all admins for this PTO's company.
      // Also include "global" admins that don't have a companyId (legacy/system-wide).
      // Treat users as active unless isActive is explicitly false (legacy records may not have the field).
      const activeFilter: any = { $or: [{ isActive: true }, { isActive: { $exists: false } }, { isActive: null }] };

      const recipientOr: any[] = [];
      if (companyId) {
        recipientOr.push({ role: 'admin', companyId });
        recipientOr.push({ role: 'admin', companyId: { $exists: false } });
        recipientOr.push({ role: 'admin', companyId: null });
        recipientOr.push({ role: 'admin', companyId: '' });
      } else {
        recipientOr.push({ role: 'admin' });
      }

      const recipientsRaw: any[] = await User.find({ ...activeFilter, $or: recipientOr }).select('_id').lean();
      const requesterId = user._id?.toString?.() || '';

      const recipientIds = Array.from(
        new Set(
          recipientsRaw
            .map((r) => r?._id?.toString?.())
            .filter((id) => typeof id === 'string' && id.length > 0 && id !== requesterId)
        )
      );

      if (recipientIds.length > 0) {
        const title = 'New PTO request to approve';
        const messageParts = [
          `Employee: ${pto.employeeId}`,
          `Dates: ${pto.startDate} - ${pto.endDate}`
        ];

        await Notification.insertMany(
          recipientIds.map((userId) => ({
            userId,
            companyId: companyId || undefined,
            title,
            message: messageParts.join(' · '),
            readAt: null
          }))
        );
      }
      
      return {
        ...pto.toObject(),
        id: pto._id.toString(),
        createdAt: pto.createdAt.toISOString(),
        updatedAt: pto.updatedAt.toISOString()
      };
    },

    updatePTO: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();

      const existing: any = await PTO.findById(id);
      if (!existing) {
        throw new Error('PTO not found');
      }

      if (existing.status !== 'pending') {
        throw new Error('Only pending PTO requests can be modified');
      }

      const pto: any = await PTO.findByIdAndUpdate(id, { $set: { ...input } }, { new: true });
      
      if (!pto) {
        throw new Error('PTO not found');
      }
      
      return {
        ...pto.toObject(),
        id: pto._id.toString(),
        createdAt: pto.createdAt.toISOString(),
        updatedAt: pto.updatedAt.toISOString(),
        reviewedAt: pto.reviewedAt ? pto.reviewedAt.toISOString() : null
      };
    },

    approvePTO: async (
      _: unknown,
      { id, reviewedBy }: { id: string; reviewedBy: string },
      ctx: { req?: { headers?: { get?: (key: string) => string | null } } }
    ) => {
      await connectToDatabase();

      const token = getBearerToken(ctx);
      if (!token) throw new Error('Unauthorized');
      const payload = verifyToken(token);
      const role = typeof payload.role === 'string' ? payload.role.toLowerCase() : '';
      if (role !== 'admin' && role !== 'manager') {
        throw new Error('Forbidden');
      }

      const reviewer = typeof payload.email === 'string' && payload.email ? payload.email : reviewedBy;
      if (!reviewer) {
        throw new Error('Invalid reviewer');
      }
      
      const pto: any = await PTO.findById(id);
      if (!pto) {
        throw new Error('PTO not found');
      }

      if (pto.status !== 'pending') {
        throw new Error('Only pending PTO requests can be approved');
      }
      
      // Update employee PTO balance
      const employee: any = await Employee.findOne({ employeeId: pto.employeeId });
      if (employee && pto.leaveType === 'paid') {
        const newPtoUsed = (employee.ptoUsed || 0) + pto.requestedDays;
        const newPtoAvailable = (employee.ptoAllowance || 15) - newPtoUsed;
        
        await Employee.findByIdAndUpdate(employee._id, {
          ptoUsed: newPtoUsed,
          ptoAvailable: newPtoAvailable
        });
      }
      
      // Update PTO status
      pto.status = 'approved';
      pto.reviewedBy = reviewer;
      pto.reviewedAt = new Date();
      await pto.save();

      // Notify requester that PTO was approved
      const requesterEmail = typeof pto.requestedBy === 'string' ? pto.requestedBy.toLowerCase() : '';
      let requesterUser: any = null;
      if (requesterEmail.includes('@')) {
        requesterUser = await User.findOne({ email: requesterEmail }).select('_id').lean();
      }
      if (!requesterUser) {
        const employee: any = await Employee.findOne({ employeeId: pto.employeeId }).select('userId').lean();
        if (employee?.userId) {
          requesterUser = await User.findById(employee.userId).select('_id').lean();
        }
      }
      if (requesterUser) {
        await Notification.create({
          userId: requesterUser._id.toString(),
          companyId: pto.companyId || undefined,
          title: 'Your PTO was approved',
          message: `Dates: ${pto.startDate} - ${pto.endDate}`,
          readAt: null
        });
      }
      
      return {
        ...pto.toObject(),
        id: pto._id.toString(),
        reviewedAt: pto.reviewedAt.toISOString()
      };
    },

    rejectPTO: async (
      _: unknown,
      { id, reviewedBy }: { id: string; reviewedBy: string },
      ctx: { req?: { headers?: { get?: (key: string) => string | null } } }
    ) => {
      await connectToDatabase();

      const token = getBearerToken(ctx);
      if (!token) throw new Error('Unauthorized');
      const payload = verifyToken(token);
      const role = typeof payload.role === 'string' ? payload.role.toLowerCase() : '';
      if (role !== 'admin' && role !== 'manager') {
        throw new Error('Forbidden');
      }

      const reviewer = typeof payload.email === 'string' && payload.email ? payload.email : reviewedBy;
      if (!reviewer) {
        throw new Error('Invalid reviewer');
      }

      const existing: any = await PTO.findById(id);
      if (!existing) {
        throw new Error('PTO not found');
      }

      if (existing.status !== 'pending') {
        throw new Error('Only pending PTO requests can be rejected');
      }
      
      const pto: any = await PTO.findByIdAndUpdate(
        id,
        { 
          status: 'rejected',
          reviewedBy: reviewer,
          reviewedAt: new Date()
        },
        { new: true }
      );
      
      if (!pto) {
        throw new Error('PTO not found');
      }

      // Notify requester that PTO was rejected
      const requesterEmail = typeof pto.requestedBy === 'string' ? pto.requestedBy.toLowerCase() : '';
      let requesterUser: any = null;
      if (requesterEmail.includes('@')) {
        requesterUser = await User.findOne({ email: requesterEmail }).select('_id').lean();
      }
      if (!requesterUser) {
        const employee: any = await Employee.findOne({ employeeId: pto.employeeId }).select('userId').lean();
        if (employee?.userId) {
          requesterUser = await User.findById(employee.userId).select('_id').lean();
        }
      }
      if (requesterUser) {
        await Notification.create({
          userId: requesterUser._id.toString(),
          companyId: pto.companyId || undefined,
          title: 'Your PTO was rejected',
          message: `Dates: ${pto.startDate} - ${pto.endDate}`,
          readAt: null
        });
      }
      
      return {
        ...pto.toObject(),
        id: pto._id.toString(),
        reviewedAt: pto.reviewedAt.toISOString()
      };
    },

    markNotificationRead: async (
      _: unknown,
      { id }: { id: string },
      ctx: { req?: { headers?: { get?: (key: string) => string | null } } }
    ) => {
      await connectToDatabase();
      const { user } = await getAuthedUser(ctx);

      const notification: any = await Notification.findOneAndUpdate(
        { _id: id, userId: user._id.toString() },
        { $set: { readAt: new Date() } },
        { new: true }
      ).lean();

      if (!notification) {
        throw new Error('Notification not found');
      }

      return {
        ...notification,
        id: notification._id.toString(),
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt ? notification.readAt.toISOString() : null
      };
    },

    deletePTO: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      
      // Find PTO first to check if we need to restore balance
      const pto: any = await PTO.findById(id);
      if (!pto) {
        return false;
      }

      if (pto.status !== 'pending') {
        throw new Error('Only pending PTO requests can be deleted');
      }
      
      // If PTO was approved and paid, restore employee balance
      if (pto.status === 'approved' && pto.leaveType === 'paid') {
        const employee: any = await Employee.findOne({ employeeId: pto.employeeId });
        if (employee) {
          const newPtoUsed = Math.max(0, (employee.ptoUsed || 0) - pto.requestedDays);
          const newPtoAvailable = (employee.ptoAllowance || 15) - newPtoUsed;
          
          await Employee.findByIdAndUpdate(employee._id, {
            ptoUsed: newPtoUsed,
            ptoAvailable: newPtoAvailable
          });
        }
      }
      
      const result = await PTO.findByIdAndDelete(id);
      return !!result;
    },

    // Company PTO Policy Mutations
    createLeaveType: async (_: unknown, { companyId, input }: { companyId: string; input: any }) => {
      try {
        await connectToDatabase();
        
        console.log('Creating leave type for company:', companyId, 'input:', input);
        
        // Find or create company PTO policy
        let policy: any = await CompanyPTOPolicy.findOne({ companyId });
        
        if (!policy) {
          console.log('No policy found, creating new one');
          policy = await CompanyPTOPolicy.create({
            companyId,
            leaveTypes: [],
          });
          console.log('Created policy:', policy);
        }
        
        // Generate unique ID for leave type
        const leaveTypeId = `lt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Add new leave type
        const newLeaveType = {
          id: leaveTypeId,
          name: input.name,
          hoursAllowed: input.hoursAllowed,
          isPaid: input.isPaid,
          isActive: input.isActive,
        };
        
        console.log('Adding leave type:', newLeaveType);
        
        const updatedPolicy: any = await CompanyPTOPolicy.findByIdAndUpdate(
          policy._id,
          { $push: { leaveTypes: newLeaveType } },
          { new: true }
        ).lean();
        
        console.log('Updated policy:', updatedPolicy);
        
        if (!updatedPolicy) {
          throw new Error('Failed to update policy');
        }
        
        return {
          ...updatedPolicy,
          id: updatedPolicy._id.toString(),
          createdAt: updatedPolicy.createdAt?.toISOString(),
          updatedAt: updatedPolicy.updatedAt?.toISOString(),
        };
      } catch (error) {
        console.error('Error in createLeaveType resolver:', error);
        throw error;
      }
    },

    updateLeaveType: async (_: unknown, { companyId, leaveTypeId, input }: { companyId: string; leaveTypeId: string; input: any }) => {
      await connectToDatabase();
      
      const policy: any = await CompanyPTOPolicy.findOne({ companyId });
      
      if (!policy) {
        throw new Error('Company PTO policy not found');
      }
      
      // Find and update the leave type
      const leaveTypeIndex = policy.leaveTypes.findIndex((lt: any) => lt.id === leaveTypeId);
      
      if (leaveTypeIndex === -1) {
        throw new Error('Leave type not found');
      }
      
      // Update the leave type
      policy.leaveTypes[leaveTypeIndex] = {
        id: leaveTypeId,
        name: input.name,
        hoursAllowed: input.hoursAllowed,
        isPaid: input.isPaid,
        isActive: input.isActive,
      };
      
      await policy.save();
      
      const updatedPolicy: any = await CompanyPTOPolicy.findById(policy._id).lean();
      
      if (!updatedPolicy) {
        throw new Error('Failed to retrieve updated policy');
      }
      
      return {
        ...updatedPolicy,
        id: updatedPolicy._id.toString(),
        createdAt: updatedPolicy.createdAt?.toISOString(),
        updatedAt: updatedPolicy.updatedAt?.toISOString(),
      };
    },

    deleteLeaveType: async (_: unknown, { companyId, leaveTypeId }: { companyId: string; leaveTypeId: string }) => {
      await connectToDatabase();
      
      const policy: any = await CompanyPTOPolicy.findOneAndUpdate(
        { companyId },
        { $pull: { leaveTypes: { id: leaveTypeId } } },
        { new: true }
      ).lean();
      
      if (!policy) {
        throw new Error('Company PTO policy not found');
      }
      
      return {
        ...policy,
        id: policy._id.toString(),
        createdAt: policy.createdAt?.toISOString(),
        updatedAt: policy.updatedAt?.toISOString(),
      };
    },

    // Insurance Mutations
    createInsurance: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      // Check uniqueness of insurerId per company
      const existing = await Insurance.findOne({ 
        insurerId: input.insurerId.toUpperCase(), 
        companyId: input.companyId 
      }).lean();
      
      if (existing) {
        throw new Error('Insurance with this ID already exists for this company');
      }
      
      const insuranceData = { ...input, insurerId: input.insurerId.toUpperCase() };
      const insurance: any = await Insurance.create(insuranceData);
      
      return {
        ...insurance.toObject(),
        id: insurance._id.toString(),
        createdAt: insurance.createdAt.toISOString(),
        updatedAt: insurance.updatedAt.toISOString()
      };
    },

    updateInsurance: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      // If updating insurerId, ensure uniqueness
      if (input.insurerId) {
        input.insurerId = input.insurerId.toUpperCase();
        const existing: any = await Insurance.findById(id).lean();
        
        if (!existing) {
          throw new Error('Insurance not found');
        }
        
        if (input.insurerId !== existing.insurerId) {
          const duplicate = await Insurance.findOne({
            insurerId: input.insurerId,
            companyId: existing.companyId,
            _id: { $ne: id }
          }).lean();
          
          if (duplicate) {
            throw new Error('Insurance with this ID already exists for this company');
          }
        }
      }
      
      const insurance: any = await Insurance.findByIdAndUpdate(
        id, 
        { $set: input }, 
        { new: true, runValidators: true }
      );
      
      if (!insurance) {
        throw new Error('Insurance not found');
      }
      
      return {
        ...insurance.toObject(),
        id: insurance._id.toString(),
        createdAt: insurance.createdAt.toISOString(),
        updatedAt: insurance.updatedAt.toISOString()
      };
    },

    deleteInsurance: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const result = await Insurance.findByIdAndDelete(id);
      return !!result;
    },

    // DMS Integration Mutations
    testDMSConnection: async (_: unknown, { input }: { input: any }) => {
      try {
        // Connect to MySQL server to test credentials and fetch databases
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
          host: input.serverHost,
          port: input.serverPort,
          user: input.username,
          password: input.password,
        });

        try {
          // Fetch list of databases
          const [rows]: any = await connection.execute('SHOW DATABASES');
          
          // Filter out system databases
          const databases = rows
            .map((row: any) => row.Database)
            .filter((db: string) => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db));
          
          await connection.end();
          
          return {
            success: true,
            message: 'Connection successful',
            databases,
          };
        } catch (error: any) {
          await connection.end();
          throw error;
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Connection failed. Please check your credentials.',
          databases: [],
        };
      }
    },

    createDMSIntegration: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      // Check if integration already exists for this company/provider
      const existing = await DMSIntegration.findOne({ 
        companyId: input.companyId,
        provider: input.provider 
      }).lean();
      
      if (existing) {
        throw new Error('Integration for this provider already exists for this company');
      }
      
      const integration: any = await DMSIntegration.create(input);
      
      return {
        ...integration.toObject(),
        id: integration._id.toString(),
        createdAt: integration.createdAt.toISOString(),
        updatedAt: integration.updatedAt.toISOString(),
        lastSyncAt: integration.lastSyncAt ? integration.lastSyncAt.toISOString() : null,
        password: undefined, // Don't return password
      };
    },

    updateDMSIntegration: async (_: unknown, { id, input }: { id: string; input: any }) => {
      await connectToDatabase();
      
      const integration: any = await DMSIntegration.findByIdAndUpdate(
        id, 
        { $set: input }, 
        { new: true, runValidators: true }
      );
      
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      return {
        ...integration.toObject(),
        id: integration._id.toString(),
        createdAt: integration.createdAt.toISOString(),
        updatedAt: integration.updatedAt.toISOString(),
        lastSyncAt: integration.lastSyncAt ? integration.lastSyncAt.toISOString() : null,
        password: undefined, // Don't return password
      };
    },

    deleteDMSIntegration: async (_: unknown, { id }: { id: string }) => {
      await connectToDatabase();
      const result = await DMSIntegration.findByIdAndDelete(id);
      return {
        success: !!result,
        message: result ? 'Integration deleted successfully' : 'Integration not found'
      };
    },

    syncPatientsFromDMS: async (_: unknown, { input }: { input: any }) => {
      await connectToDatabase();
      
      const { integrationId, fullSync = false, limit = 100 } = input;
      
      // Find the integration
      const integration: any = await DMSIntegration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (!integration.isActive) {
        throw new Error('Integration is not active');
      }

      if (integration.isSyncing) {
        throw new Error('Sync already in progress');
      }

      // Mark as syncing
      integration.isSyncing = true;
      await integration.save();

      try {
        // Connect to the DMS database
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
          host: integration.serverHost,
          port: integration.serverPort,
          user: integration.username,
          password: integration.password,
          database: integration.database,
        });

        try {
          // Query patients from Open Dental database
          // PatStatus = 0 means active patients
          let query = `
            SELECT 
              PatNum, 
              LName, 
              FName, 
              MiddleI,
              Preferred,
              Birthdate, 
              Email, 
              HmPhone,
              WkPhone,
              WirelessPhone,
              Address,
              Address2, 
              City, 
              State, 
              Zip,
              Gender,
              SSN,
              MedicaidID,
              DateTStamp
            FROM patient 
            WHERE PatStatus = 0
          `;

          const params: any[] = [];

          // If not full sync, only get patients modified since last sync
          if (!fullSync && integration.lastSyncAt) {
            query += ` AND DateTStamp > ?`;
            params.push(integration.lastSyncAt);
          }

          // Apply limit
          query += ` LIMIT ?`;
          params.push(parseInt(limit));

          const [rows]: any = await connection.execute(query, params);
          
          const simulatedPatients = rows;

          let patientsAdded = 0;
          let patientsUpdated = 0;
          let patientsSkipped = 0;
          const errors: string[] = [];

          for (const dmsPatient of simulatedPatients) {
          try {
            // Skip patients without a birthdate
            if (!dmsPatient.Birthdate) {
              patientsSkipped++;
              continue;
            }

            // Use preferred name if available, otherwise first name
            const firstName = dmsPatient.Preferred || dmsPatient.FName;
            
            // Determine best phone number (prefer wireless, then home, then work)
            const phone = dmsPatient.WirelessPhone || dmsPatient.HmPhone || dmsPatient.WkPhone;

            // Combine address fields
            const address = dmsPatient.Address2 
              ? `${dmsPatient.Address}, ${dmsPatient.Address2}`
              : dmsPatient.Address;

            // Check if patient already exists by PatNum in notes or by name and birthday
            const existingPatient = await Patient.findOne({
              $or: [
                { notes: { $regex: `Patient #${dmsPatient.PatNum}\\)`, $options: 'i' } },
                {
                  firstName: firstName,
                  lastName: dmsPatient.LName,
                  birthday: new Date(dmsPatient.Birthdate),
                  companyId: integration.companyId,
                }
              ]
            });

            const patientData = {
              firstName: firstName,
              lastName: dmsPatient.LName,
              birthday: new Date(dmsPatient.Birthdate),
              email: dmsPatient.Email || undefined,
              phone: phone || undefined,
              address: address || undefined,
              city: dmsPatient.City || undefined,
              state: dmsPatient.State || undefined,
              zip: dmsPatient.Zip || undefined,
              insuranceNumber: dmsPatient.MedicaidID || undefined,
              companyId: integration.companyId,
              notes: `Synced from ${integration.provider} (Patient #${dmsPatient.PatNum})${dmsPatient.SSN ? ` - SSN: ${dmsPatient.SSN}` : ''}${dmsPatient.Gender ? ` - Gender: ${dmsPatient.Gender}` : ''}`,
            };

            if (existingPatient) {
              // Update existing patient
              await Patient.findByIdAndUpdate(existingPatient._id, patientData);
              patientsUpdated++;
            } else {
              // Create new patient
              await Patient.create(patientData);
              patientsAdded++;
            }
          } catch (error: any) {
            const patientName = `${dmsPatient.FName || dmsPatient.Preferred || ''} ${dmsPatient.LName || ''}`.trim();
            errors.push(`Error syncing patient ${patientName} (PatNum: ${dmsPatient.PatNum}): ${error.message}`);
            patientsSkipped++;
          }
        }

        // Update integration with sync results
        const syncResult = {
          success: true,
          message: `Successfully synced ${patientsAdded + patientsUpdated} patients`,
          patientsAdded,
          patientsUpdated,
          patientsSkipped,
          errors,
        };

        integration.lastSyncAt = new Date();
        integration.lastSyncResult = syncResult;
        integration.isSyncing = false;
        await integration.save();

        return syncResult;
        } finally {
          // Always close the connection
          await connection.end();
        }
      } catch (error: any) {
        // Update integration with error
        const errorResult = {
          success: false,
          message: `Sync failed: ${error.message}`,
          patientsAdded: 0,
          patientsUpdated: 0,
          patientsSkipped: 0,
          errors: [error.message],
        };

        integration.lastSyncResult = errorResult;
        integration.isSyncing = false;
        await integration.save();

        throw error;
      }
    }
  }
};
