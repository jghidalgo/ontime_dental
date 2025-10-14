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

  type TicketUpdate {
    timestamp: String!
    message: String!
    user: String!
  }

  type Ticket {
    id: ID!
    subject: String!
    requester: String!
    location: String!
    channel: String!
    category: String!
    description: String!
    status: String!
    priority: String!
    createdAt: String!
    dueDate: String!
    updates: [TicketUpdate!]!
    satisfaction: String
  }

  type DocumentRecord {
    id: String!
    title: String!
    version: String!
    date: String!
    description: String!
    url: String!
    fileName: String
  }

  type DocumentGroup {
    id: String!
    name: String!
    documents: [DocumentRecord!]!
  }

  type DocumentEntity {
    id: ID!
    entityId: String!
    name: String!
    groups: [DocumentGroup!]!
  }

  type DashboardMetric {
    label: String!
    value: String!
    delta: String!
    trend: String!
  }

  type DashboardAppointment {
    time: String!
    patient: String!
    treatment: String!
    practitioner: String!
  }

  type DashboardActivity {
    id: String!
    title: String!
    timestamp: String!
    owner: String!
  }

  type DashboardAnnouncement {
    title: String!
    description: String!
    badge: String!
  }

  type RevenueTrendPoint {
    month: String!
    value: Float!
  }

  type DashboardData {
    metrics: [DashboardMetric!]!
    upcomingAppointments: [DashboardAppointment!]!
    revenueTrend: [RevenueTrendPoint!]!
    teamActivity: [DashboardActivity!]!
    announcements: [DashboardAnnouncement!]!
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

  input TicketUpdateInput {
    timestamp: String!
    message: String!
    user: String!
  }

  input TicketInput {
    subject: String!
    requester: String!
    location: String!
    channel: String!
    category: String!
    description: String!
    status: String!
    priority: String!
    dueDate: String!
    updates: [TicketUpdateInput!]
    satisfaction: String
  }

  input DocumentRecordInput {
    id: String!
    title: String!
    version: String!
    date: String!
    description: String!
    url: String!
    fileName: String
  }

  input DocumentGroupInput {
    id: String!
    name: String!
    documents: [DocumentRecordInput!]
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
    
    # Ticket queries
    tickets: [Ticket!]!
    ticket(id: ID!): Ticket
    
    # Document queries
    documentEntities: [DocumentEntity!]!
    documentEntity(entityId: String!): DocumentEntity
    
    # Dashboard query
    dashboardData: DashboardData!
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
    
    # Ticket mutations
    createTicket(input: TicketInput!): Ticket!
    updateTicket(id: ID!, input: TicketInput!): Ticket!
    deleteTicket(id: ID!): Boolean!
    
    # Document mutations
    createDocumentEntity(entityId: String!, name: String!): DocumentEntity!
    updateDocumentEntity(entityId: String!, name: String): DocumentEntity!
    deleteDocumentEntity(entityId: String!): Boolean!
    addDocumentGroup(entityId: String!, groupId: String!, groupName: String!): DocumentEntity!
    updateDocumentGroup(entityId: String!, groupId: String!, groupName: String!): DocumentEntity!
    deleteDocumentGroup(entityId: String!, groupId: String!): DocumentEntity!
    addDocument(entityId: String!, groupId: String!, document: DocumentRecordInput!): DocumentEntity!
    updateDocument(entityId: String!, groupId: String!, documentId: String!, document: DocumentRecordInput!): DocumentEntity!
    deleteDocument(entityId: String!, groupId: String!, documentId: String!): DocumentEntity!
  }
`;

export default typeDefs;
