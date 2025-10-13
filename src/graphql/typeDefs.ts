import { gql } from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DirectoryEntity {
    id: ID!
    entityId: String!
    name: String!
  }

  type DirectoryEntry {
    id: ID!
    entityId: String!
    group: String!
    location: String!
    phone: String!
    extension: String!
    department: String!
    employee: String!
    order: Int!
  }

  type DirectoryEntityWithEntries {
    id: ID!
    entityId: String!
    name: String!
    corporate: [DirectoryEntry!]!
    frontdesk: [DirectoryEntry!]!
    offices: [DirectoryEntry!]!
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type Clinic {
    clinicId: String!
    name: String!
    address: String!
    city: String!
    zip: String!
    phone: String!
    email: String!
    hours: String!
    coordinates: Coordinates!
  }

  type ClinicLocation {
    id: ID!
    companyId: String!
    companyName: String!
    headquarters: String!
    description: String!
    mapCenter: Coordinates!
    clinics: [Clinic!]!
  }

  type Employee {
    id: String!
    name: String!
  }

  type FrontDeskSchedule {
    id: ID!
    positionId: String!
    clinicId: String!
    employee: Employee
  }

  type DoctorAssignment {
    id: String!
    name: String!
    shift: String!
  }

  type DoctorSchedule {
    id: ID!
    dayId: String!
    clinicId: String!
    doctor: DoctorAssignment
  }

  input CoordinatesInput {
    lat: Float!
    lng: Float!
  }

  input ClinicInput {
    clinicId: String!
    name: String!
    address: String!
    city: String!
    zip: String!
    phone: String!
    email: String!
    hours: String!
    coordinates: CoordinatesInput!
  }

  input DirectoryEntryInput {
    entityId: String!
    group: String!
    location: String!
    phone: String!
    extension: String!
    department: String!
    employee: String!
    order: Int
  }

  input EmployeeInput {
    id: String!
    name: String!
  }

  input DoctorAssignmentInput {
    id: String!
    name: String!
    shift: String!
  }

  type Query {
    health: String!
    
    # Directory queries
    directoryEntities: [DirectoryEntity!]!
    directoryEntity(entityId: String!): DirectoryEntity
    directoryEntriesByEntity(entityId: String!, group: String): [DirectoryEntry!]!
    directoryEntityWithEntries(entityId: String!): DirectoryEntityWithEntries
    allDirectoryData: [DirectoryEntityWithEntries!]!
    
    # Clinic location queries
    clinicLocations: [ClinicLocation!]!
    clinicLocation(companyId: String!): ClinicLocation
    
    # Schedule queries
    frontDeskSchedules: [FrontDeskSchedule!]!
    doctorSchedules: [DoctorSchedule!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    
    # Directory mutations
    createDirectoryEntity(entityId: String!, name: String!): DirectoryEntity!
    createDirectoryEntry(input: DirectoryEntryInput!): DirectoryEntry!
    updateDirectoryEntry(id: ID!, input: DirectoryEntryInput!): DirectoryEntry!
    deleteDirectoryEntry(id: ID!): Boolean!
    reorderDirectoryEntries(entityId: String!, group: String!, entryIds: [ID!]!): [DirectoryEntry!]!
    
    # Clinic location mutations
    createClinicLocation(
      companyId: String!
      companyName: String!
      headquarters: String!
      description: String!
      mapCenter: CoordinatesInput!
      clinics: [ClinicInput!]!
    ): ClinicLocation!
    updateClinicLocation(
      companyId: String!
      companyName: String
      headquarters: String
      description: String
      mapCenter: CoordinatesInput
      clinics: [ClinicInput!]
    ): ClinicLocation!
    addClinic(companyId: String!, clinic: ClinicInput!): ClinicLocation!
    removeClinic(companyId: String!, clinicId: String!): ClinicLocation!
    
    # Schedule mutations
    updateFrontDeskSchedule(positionId: String!, clinicId: String!, employee: EmployeeInput): FrontDeskSchedule!
    updateDoctorSchedule(dayId: String!, clinicId: String!, doctor: DoctorAssignmentInput): DoctorSchedule!
    swapFrontDeskAssignments(
      sourcePositionId: String!
      sourceClinicId: String!
      targetPositionId: String!
      targetClinicId: String!
    ): [FrontDeskSchedule!]!
    swapDoctorAssignments(
      sourceDayId: String!
      sourceClinicId: String!
      targetDayId: String!
      targetClinicId: String!
    ): [DoctorSchedule!]!
  }
`;

export default typeDefs;
