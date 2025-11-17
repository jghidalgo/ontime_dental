import { gql } from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    companyId: String
    phone: String
    position: String
    department: String
    isActive: Boolean!
    permissions: UserPermissions
    createdAt: String!
    updatedAt: String!
  }

  type UserPermissions {
    modules: [String!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DeleteResult {
    success: Boolean!
    message: String
  }

  type DirectoryEntity {
    id: ID!
    entityId: String!
    name: String!
    companyId: String!
  }

  type DirectoryEntry {
    id: ID!
    entityId: String!
    companyId: String!
    group: String!
    location: String!
    phone: String!
    extension: String!
    department: String!
    employee: String!
    order: Int!
  }

  type DocumentGroup {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  type DirectoryEntityWithEntries {
    id: ID!
    entityId: String!
    name: String!
    companyId: String!
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
    description: String
    mapCenter: Coordinates!
    clinics: [Clinic!]!
  }

  type TurnaroundTime {
    standard: Int!
    rush: Int!
  }

  type Laboratory {
    id: ID!
    name: String!
    shortName: String!
    contactPerson: String!
    phone: String!
    email: String!
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
    website: String
    taxId: String
    specialties: [String!]!
    turnaroundTime: TurnaroundTime!
    procedures: [Procedure!]
    departments: [Department!]
    notes: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Procedure {
    name: String!
    dailyCapacity: Int!
    price: Float
  }

  type Department {
    id: String!
    name: String!
    description: String!
    order: Int!
  }

  type EmergencyContact {
    name: String!
    relationship: String!
    phone: String!
  }

  type Employee {
    id: ID!
    employeeId: String!
    userId: String
    companyId: String
    name: String!
    joined: String!
    dateOfBirth: String!
    phone: String!
    position: String!
    location: String!
    email: String
    department: String
    status: String!
    emergencyContact: EmergencyContact
    ptoAllowance: Int
    ptoUsed: Int
    ptoAvailable: Int
    ptoYear: Int
    createdAt: String!
    updatedAt: String!
  }

  type EmployeeBasic {
    id: String!
    name: String!
  }

  type LocationDistribution {
    location: String!
    count: Int!
    color: String!
  }

  type PTO {
    id: ID!
    employeeId: String!
    companyId: String
    leaveType: String!
    startDate: String!
    endDate: String!
    requestedDays: Int!
    status: String!
    comment: String
    requestedBy: String!
    reviewedBy: String
    reviewedAt: String
    createdAt: String!
    updatedAt: String!
  }

  input PTOCreateInput {
    employeeId: String!
    companyId: String
    leaveType: String!
    startDate: String!
    endDate: String!
    requestedDays: Int!
    comment: String
    requestedBy: String!
  }

  input PTOUpdateInput {
    leaveType: String
    startDate: String
    endDate: String
    requestedDays: Int
    status: String
    comment: String
    reviewedBy: String
  }

  type FrontDeskSchedule {
    id: ID!
    positionId: String!
    clinicId: String!
    companyId: String!
    employee: EmployeeBasic
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
    companyId: String!
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
    companyId: String!
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

  type DocumentEntityGroup {
    id: String!
    name: String!
    documents: [DocumentRecord!]!
  }

  type DocumentEntity {
    id: ID!
    entityId: String!
    name: String!
    companyId: String!
    groups: [DocumentEntityGroup!]!
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

  input EmergencyContactInput {
    name: String!
    relationship: String!
    phone: String!
  }

  input EmployeeCreateInput {
    employeeId: String!
    companyId: String!
    name: String!
    joined: String!
    dateOfBirth: String!
    phone: String!
    position: String!
    location: String!
    email: String
    department: String
    status: String
    emergencyContact: EmergencyContactInput
  }

  input EmployeeUpdateInput {
    companyId: String
    name: String
    joined: String
    dateOfBirth: String
    phone: String
    position: String
    location: String
    email: String
    department: String
    status: String
    emergencyContact: EmergencyContactInput
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

  input ClinicLocationInput {
    companyId: String!
    companyName: String!
    headquarters: String!
    description: String
    mapCenter: CoordinatesInput!
    clinics: [ClinicInput!]!
  }

  input TurnaroundTimeInput {
    standard: Int!
    rush: Int!
  }

  input CreateLaboratoryInput {
    name: String!
    shortName: String!
    contactPerson: String!
    phone: String!
    email: String!
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
    website: String
    taxId: String
    specialties: [String!]
    turnaroundTime: TurnaroundTimeInput!
    notes: String
    isActive: Boolean
  }

  input UpdateLaboratoryInput {
    name: String
    shortName: String
    contactPerson: String
    phone: String
    email: String
    address: String
    city: String
    state: String
    zip: String
    country: String
    website: String
    taxId: String
    specialties: [String!]
    turnaroundTime: TurnaroundTimeInput
    procedures: [ProcedureInput!]
    departments: [DepartmentInput!]
    notes: String
    isActive: Boolean
  }

  input ProcedureInput {
    name: String!
    dailyCapacity: Int!
    price: Float
  }

  input DepartmentInput {
    id: String!
    name: String!
    description: String!
    order: Int!
  }

  input DirectoryEntryInput {
    entityId: String!
    companyId: String!
    group: String!
    location: String!
    phone: String!
    extension: String!
    department: String!
    employee: String!
    order: Int
  }

  input DocumentGroupInput {
    name: String!
    description: String
    isActive: Boolean
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
    companyId: String!
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

  input DocumentEntityGroupInput {
    id: String!
    name: String!
    documents: [DocumentRecordInput!]
  }

  type Patient {
    id: ID!
    firstName: String!
    lastName: String!
    birthday: String!
    email: String
    phone: String
    address: String
    city: String
    state: String
    zip: String
    insuranceProvider: String
    insuranceNumber: String
    notes: String
    companyId: String
    createdAt: String!
    updatedAt: String!
  }

  type LabCase {
    id: ID!
    caseId: String!
    companyId: String!
    patientId: String!
    labId: String
    lab: String!
    clinicId: String
    clinic: String!
    patientFirstName: String!
    patientLastName: String!
    birthday: String!
    reservationDate: String!
    doctorId: String
    doctor: String!
    procedure: String!
    status: String!
    productionStage: String
    category: String!
    priority: String!
    shadeGuide: String
    materialType: String
    notes: String
    toothNumbers: [String!]
    estimatedCompletion: String
    actualCompletion: String
    technicianId: String
    technician: String
    qrCode: String
    qrCodeData: String
    createdAt: String!
    updatedAt: String!
  }

  input PatientInput {
    firstName: String!
    lastName: String!
    birthday: String!
    email: String
    phone: String
    address: String
    city: String
    state: String
    zip: String
    notes: String
    companyId: String
  }

  input LabCaseInput {
    companyId: String!
    labId: String
    lab: String!
    clinicId: String
    clinic: String!
    patientId: String
    patientFirstName: String!
    patientLastName: String!
    birthday: String!
    reservationDate: String!
    doctorId: String
    doctor: String!
    procedure: String!
    category: String!
    priority: String
    productionStage: String
    shadeGuide: String
    materialType: String
    notes: String
    toothNumbers: [String!]
    estimatedCompletion: String
    technicianId: String
    technician: String
  }

  input LabCaseUpdateInput {
    labId: String
    lab: String
    clinicId: String
    clinic: String
    patientFirstName: String
    patientLastName: String
    birthday: String
    reservationDate: String
    doctorId: String
    doctor: String
    procedure: String
    status: String
    productionStage: String
    category: String
    priority: String
    shadeGuide: String
    materialType: String
    notes: String
    toothNumbers: [String!]
    estimatedCompletion: String
    actualCompletion: String
    technicianId: String
    technician: String
  }

  type Company {
    id: ID!
    name: String!
    shortName: String!
    location: String!
    address: String
    phone: String
    email: String
    taxId: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateCompanyInput {
    name: String!
    shortName: String!
    location: String!
    address: String
    phone: String
    email: String
    taxId: String
  }

  input UpdateCompanyInput {
    name: String
    shortName: String
    location: String
    address: String
    phone: String
    email: String
    taxId: String
    isActive: Boolean
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: String!
    companyId: String
    phone: String
    position: String
    department: String
  }

  input UpdateUserInput {
    name: String
    email: String
    password: String
    role: String
    companyId: String
    phone: String
    position: String
    department: String
    isActive: Boolean
    permissions: UserPermissionsInput
  }

  input UserPermissionsInput {
    modules: [String!]!
  }

  type LeaveType {
    id: ID!
    name: String!
    hoursAllowed: Float!
    isPaid: Boolean!
    isActive: Boolean!
  }

  type CompanyPTOPolicy {
    id: ID!
    companyId: ID!
    leaveTypes: [LeaveType!]!
    createdAt: String!
    updatedAt: String!
  }

  input LeaveTypeInput {
    name: String!
    hoursAllowed: Float!
    isPaid: Boolean!
    isActive: Boolean!
  }

  type Insurance {
    id: ID!
    insurerId: String!
    name: String!
    companyId: ID!
    contactName: String
    phone: String
    email: String
    address: String
    city: String
    state: String
    zip: String
    website: String
    policyPrefix: String
    notes: String
    isActive: Boolean!
    createdAt: String
    updatedAt: String
  }

  input InsuranceInput {
    insurerId: String!
    name: String!
    companyId: ID!
    contactName: String
    phone: String
    email: String
    address: String
    city: String
    state: String
    zip: String
    website: String
    policyPrefix: String
    notes: String
    isActive: Boolean
  }

  input InsuranceUpdateInput {
    insurerId: String
    name: String
    contactName: String
    phone: String
    email: String
    address: String
    city: String
    state: String
    zip: String
    website: String
    policyPrefix: String
    notes: String
    isActive: Boolean
  }

  # DMS Integration Types
  type DMSIntegration {
    id: ID!
    companyId: ID!
    provider: String!
    serverHost: String!
    serverPort: Int!
    username: String!
    database: String!
    isActive: Boolean!
    lastSyncAt: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateDMSIntegrationInput {
    companyId: ID!
    provider: String!
    serverHost: String!
    serverPort: Int!
    username: String!
    password: String!
    database: String!
    isActive: Boolean
  }

  input UpdateDMSIntegrationInput {
    serverHost: String
    serverPort: Int
    username: String
    password: String
    database: String
    isActive: Boolean
  }

  input TestDMSConnectionInput {
    provider: String!
    serverHost: String!
    serverPort: Int!
    username: String!
    password: String!
  }

  type TestDMSConnectionResult {
    success: Boolean!
    message: String!
    databases: [String!]
  }

  type DMSSyncResult {
    success: Boolean!
    message: String!
    patientsAdded: Int!
    patientsUpdated: Int!
    patientsSkipped: Int!
    errors: [String!]
  }

  type DMSSyncStatus {
    integrationId: ID!
    isRunning: Boolean!
    lastSyncAt: String
    lastSyncResult: DMSSyncResult
  }

  input SyncPatientsInput {
    integrationId: ID!
    fullSync: Boolean
    limit: Int
  }

  type Query {
    health: String!
    
    # Directory queries
    directoryEntities(companyId: ID): [DirectoryEntity!]!
    directoryEntity(entityId: String!, companyId: ID): DirectoryEntity
    directoryEntriesByEntity(entityId: String!, group: String, companyId: ID): [DirectoryEntry!]!
    directoryEntityWithEntries(entityId: String!, companyId: ID): DirectoryEntityWithEntries
    allDirectoryData(companyId: ID): [DirectoryEntityWithEntries!]!
    
    # Company queries
    companies: [Company!]!
    company(id: ID!): Company
    
    # Company PTO Policy queries
    companyPTOPolicies(companyId: ID!): CompanyPTOPolicy
    
    # User queries
    users(companyId: ID): [User!]!
    user(id: ID!): User
    
    # Clinic location queries
    clinicLocations(companyId: ID): [ClinicLocation!]!
    clinicLocation(companyId: String!): ClinicLocation
    
    # Laboratory queries
    laboratories: [Laboratory!]!
    laboratory(id: ID!): Laboratory
    
    # Schedule queries
    frontDeskSchedules(companyId: ID): [FrontDeskSchedule!]!
    doctorSchedules(companyId: ID): [DoctorSchedule!]!
    
    # Ticket queries
    tickets(companyId: ID): [Ticket!]!
    ticket(id: ID!): Ticket
    
    # Document queries
    documentEntities(companyId: ID): [DocumentEntity!]!
    documentEntity(entityId: String!, companyId: ID): DocumentEntity
    
    # Document Group queries
    documentGroups: [DocumentGroup!]!
    activeDocumentGroups: [DocumentGroup!]!
    documentGroup(id: ID!): DocumentGroup
    
    # Lab Case queries
    labCases(companyId: ID): [LabCase!]!
    labCase(id: ID!): LabCase
    labCaseByNumber(caseId: String!, companyId: ID): LabCase
    productionBoardCases(companyId: ID!, productionStage: String, technicianId: String): [LabCase!]!
    
    # Patient queries
    patients(companyId: ID, search: String): [Patient!]!
    patient(id: ID!): Patient
    
    # Employee queries
    employees(
      companyId: ID
      search: String
      location: String
      position: String
      status: String
      limit: Int
      offset: Int
    ): [Employee!]!
    employee(id: ID!): Employee
    employeeByEmployeeId(employeeId: String!, companyId: ID): Employee
    employeeLocationDistribution(companyId: ID): [LocationDistribution!]!
    
    # PTO queries
    ptos(employeeId: String, companyId: ID, status: String): [PTO!]!
    pto(id: ID!): PTO
    employeePTOBalance(employeeId: String!): Employee
    
    # Insurance queries
    insurances(companyId: ID, isActive: Boolean): [Insurance!]!
    insurance(id: ID!): Insurance
    insuranceByInsurerId(insurerId: String!, companyId: ID!): Insurance
    
    # DMS Integration queries
    dmsIntegrations(companyId: ID!): [DMSIntegration!]!
    dmsIntegration(id: ID!): DMSIntegration
    dmsSyncStatus(integrationId: ID!): DMSSyncStatus
    
    # Dashboard query
    dashboardData: DashboardData!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    
    # Directory mutations
    createDirectoryEntity(entityId: String!, name: String!, companyId: String!): DirectoryEntity!
    createDirectoryEntry(input: DirectoryEntryInput!): DirectoryEntry!
    updateDirectoryEntry(id: ID!, input: DirectoryEntryInput!): DirectoryEntry!
    deleteDirectoryEntry(id: ID!): Boolean!
    reorderDirectoryEntries(entityId: String!, group: String!, entryIds: [ID!]!, companyId: ID): [DirectoryEntry!]!
    
    # Clinic location mutations
    createClinicLocation(input: ClinicLocationInput!): ClinicLocation!
    updateClinicLocation(
      companyId: String!
      companyName: String
      headquarters: String
      description: String
      mapCenter: CoordinatesInput
      clinics: [ClinicInput!]
    ): ClinicLocation!
    addClinic(companyId: String!, clinic: ClinicInput!): ClinicLocation!
    updateClinic(companyId: String!, clinicId: String!, clinic: ClinicInput!): ClinicLocation!
    removeClinic(companyId: String!, clinicId: String!): ClinicLocation!
    
    # Laboratory mutations
    createLaboratory(input: CreateLaboratoryInput!): Laboratory!
    updateLaboratory(id: ID!, input: UpdateLaboratoryInput!): Laboratory!
    deleteLaboratory(id: ID!): DeleteResult!
    
    # Company mutations
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
    deleteCompany(id: ID!): Boolean!
    
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Schedule mutations
    updateFrontDeskSchedule(positionId: String!, clinicId: String!, companyId: String!, employee: EmployeeInput): FrontDeskSchedule!
    updateDoctorSchedule(dayId: String!, clinicId: String!, companyId: String!, doctor: DoctorAssignmentInput): DoctorSchedule!
    swapFrontDeskAssignments(
      companyId: String!
      sourcePositionId: String!
      sourceClinicId: String!
      targetPositionId: String!
      targetClinicId: String!
    ): [FrontDeskSchedule!]!
    swapDoctorAssignments(
      companyId: String!
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
    createDocumentEntity(entityId: String!, name: String!, companyId: String!): DocumentEntity!
    updateDocumentEntity(entityId: String!, name: String, companyId: ID): DocumentEntity!
    deleteDocumentEntity(entityId: String!, companyId: ID): Boolean!
    addDocumentEntityGroup(entityId: String!, groupId: String!, groupName: String!, companyId: ID): DocumentEntity!
    updateDocumentEntityGroup(entityId: String!, groupId: String!, groupName: String!, companyId: ID): DocumentEntity!
    deleteDocumentEntityGroup(entityId: String!, groupId: String!, companyId: ID): DocumentEntity!
    addDocument(entityId: String!, groupId: String!, document: DocumentRecordInput!, companyId: ID): DocumentEntity!
    updateDocument(entityId: String!, groupId: String!, documentId: String!, document: DocumentRecordInput!, companyId: ID): DocumentEntity!
    deleteDocument(entityId: String!, groupId: String!, documentId: String!, companyId: ID): DocumentEntity!
    
    # Document Group mutations
    createDocumentGroup(input: DocumentGroupInput!): DocumentGroup!
    updateDocumentGroup(id: ID!, input: DocumentGroupInput!): DocumentGroup!
    deleteDocumentGroup(id: ID!): DeleteResult!
    reorderDocumentGroups(groupIds: [ID!]!): [DocumentGroup!]!
    
    # Lab Case mutations
    createLabCase(input: LabCaseInput!): LabCase!
    updateLabCase(id: ID!, input: LabCaseUpdateInput!): LabCase!
    deleteLabCase(id: ID!): Boolean!
    
    # Patient mutations
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: PatientInput!): Patient!
    deletePatient(id: ID!): Boolean!
    
    # Employee mutations
    createEmployee(input: EmployeeCreateInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeUpdateInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    
    # PTO mutations
    createPTO(input: PTOCreateInput!): PTO!
    updatePTO(id: ID!, input: PTOUpdateInput!): PTO!
    approvePTO(id: ID!, reviewedBy: String!): PTO!
    rejectPTO(id: ID!, reviewedBy: String!): PTO!
    deletePTO(id: ID!): Boolean!
    
    # Company PTO Policy mutations
    createLeaveType(companyId: ID!, input: LeaveTypeInput!): CompanyPTOPolicy!
    updateLeaveType(companyId: ID!, leaveTypeId: ID!, input: LeaveTypeInput!): CompanyPTOPolicy!
    deleteLeaveType(companyId: ID!, leaveTypeId: ID!): CompanyPTOPolicy!
    
    # Insurance mutations
    createInsurance(input: InsuranceInput!): Insurance!
    updateInsurance(id: ID!, input: InsuranceUpdateInput!): Insurance!
    deleteInsurance(id: ID!): Boolean!
    
    # DMS Integration mutations
    testDMSConnection(input: TestDMSConnectionInput!): TestDMSConnectionResult!
    createDMSIntegration(input: CreateDMSIntegrationInput!): DMSIntegration!
    updateDMSIntegration(id: ID!, input: UpdateDMSIntegrationInput!): DMSIntegration!
    deleteDMSIntegration(id: ID!): DeleteResult!
    syncPatientsFromDMS(input: SyncPatientsInput!): DMSSyncResult!
  }
`;

export default typeDefs;
