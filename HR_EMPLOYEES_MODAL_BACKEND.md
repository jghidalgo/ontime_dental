# HR Employees - Add Employee Modal with Backend Integration

## Overview
The Add Employee modal has been enhanced with:
- **Dark/Light mode support** - Fully styled for both themes
- **Backend integration** - Connected to GraphQL mutations
- **Real-time updates** - Automatic employee list refresh after creation
- **Form validation** - Required fields and error handling
- **Loading states** - Visual feedback during submission

## Features

### 1. Dark Mode Support
The modal automatically adapts to the current theme:
- Light mode: White background with subtle borders
- Dark mode: Dark slate background with enhanced contrast
- All form inputs, labels, and buttons are theme-aware
- Error messages styled for both themes

### 2. Backend Integration

#### GraphQL Mutation
The modal uses the `CREATE_EMPLOYEE` mutation:

```graphql
mutation CreateEmployee($input: EmployeeCreateInput!) {
  createEmployee(input: $input) {
    id
    employeeId
    name
    joined
    dateOfBirth
    phone
    position
    location
    email
    department
    status
    createdAt
    updatedAt
  }
}
```

#### Form Fields Mapping
The modal collects and transforms data:

| UI Field | Backend Field | Required | Type |
|----------|---------------|----------|------|
| Employee ID | employeeId | ✅ | String |
| First Name + Last Name | name | ✅ | String (combined) |
| Email | email | ❌ | String |
| Phone Number | phone | ✅ | String |
| Date of Birth | dateOfBirth | ✅ | String (MM/DD/YYYY) |
| Start Date | joined | ✅ | String (MM/DD/YYYY) |
| Location | location | ✅ | String (select) |
| Department | department | ❌ | String (select) |
| Position | position | ✅ | String (select) |
| Status | status | ✅ | Enum (active/inactive/on-leave) |

### 3. Form Validation

#### Required Fields
- Employee ID
- First Name
- Last Name
- Phone Number
- Date of Birth (Month, Day, Year)
- Start Date (Month, Day, Year)
- Location
- Position
- Status

#### Date Format
Dates are collected via dropdowns and formatted as `MM/DD/YYYY`:
```typescript
const formatDateString = (month: string, day: string, year: string): string => {
  const monthIndex = monthOptions.indexOf(month) + 1;
  return `${monthIndex.toString().padStart(2, '0')}/${day}/${year}`;
};
```

### 4. Dropdown Options

#### Locations
- Little Havana
- Pembroke Pines
- Tamami
- Coral Gables
- Coral Way
- Homestead
- Miami Lakes
- Miracle Mile
- Bird Road
- Lab
- Corporate

#### Departments
- Clinical
- Laboratory
- Operations
- Finance
- HR
- Management
- Compliance
- Billing
- Accounting
- Customer Service

#### Positions
- Dental Assistant
- Dentist
- Dental Hygienist
- Doctor
- Front Desk
- Hygienist
- Office Manager
- Operations Manager
- Treatment Coordinator
- Lab Technician
- Billing Specialist
- HR Manager
- Compliance Officer

#### Status
- Active
- Inactive
- On Leave

## Usage

### Opening the Modal
The modal is controlled by state in the parent component:

```typescript
const [isAddModalOpen, setIsAddModalOpen] = useState(false);

// Open modal
<button onClick={() => setIsAddModalOpen(true)}>
  Add employee
</button>

// Render modal
<AddEmployeeModal 
  isOpen={isAddModalOpen} 
  onClose={() => setIsAddModalOpen(false)} 
/>
```

### Form Submission Flow
1. User fills in form fields
2. User clicks "Save" button
3. Loading state activates (spinner shown)
4. Dates are formatted from dropdowns
5. GraphQL mutation is called with formatted data
6. On success:
   - Employee list automatically refreshes
   - Modal closes
   - Form resets
7. On error:
   - Error message displayed in modal
   - Form remains open for corrections

### Auto-Refresh
After successful creation, the employee list automatically updates:
```typescript
const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
  refetchQueries: [{ query: GET_EMPLOYEES, variables: { limit: 1000 } }],
  onCompleted: () => {
    setFormState(initialState);
    onClose();
  }
});
```

## Error Handling

### Display Errors
Errors are shown below the form fields:
```typescript
{error && (
  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 
                  p-3 text-sm text-red-600 
                  dark:border-red-900/50 dark:bg-red-900/20 
                  dark:text-red-400">
    {error.message || t('Failed to create employee. Please try again.')}
  </div>
)}
```

### Common Errors
- **Duplicate Employee ID**: "Employee with this ID already exists"
- **Network Error**: GraphQL connection issues
- **Validation Error**: Missing required fields

## Styling

### Dark Mode Classes
All inputs use Tailwind's dark mode prefix:
```typescript
className="... 
  dark:border-slate-700 
  dark:bg-slate-800 
  dark:text-slate-100 
  dark:placeholder:text-slate-500
  dark:focus:border-primary-500
  dark:focus:ring-primary-500/20"
```

### Loading State
Submit button shows spinner during submission:
```typescript
{loading && (
  <div className="h-4 w-4 animate-spin rounded-full 
                  border-2 border-current border-t-transparent" />
)}
```

## Testing

### Manual Testing Checklist
1. ✅ Open modal by clicking "Add employee"
2. ✅ Verify all fields render correctly
3. ✅ Test required field validation
4. ✅ Select dates from dropdowns
5. ✅ Select location, department, position, status
6. ✅ Submit form with valid data
7. ✅ Verify loading state appears
8. ✅ Verify modal closes on success
9. ✅ Verify new employee appears in list
10. ✅ Test dark mode rendering
11. ✅ Test error display for duplicate Employee ID

### Test Employee Data
```typescript
{
  employeeId: "EMP-TEST-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@ontimedental.com",
  phone: "(305) 555-1234",
  birthMonth: "January",
  birthDay: "15",
  birthYear: "1990",
  startMonth: "March",
  startDay: "01",
  startYear: "2023",
  location: "Little Havana",
  department: "Clinical",
  position: "Dental Hygienist",
  status: "active"
}
```

## Future Enhancements
- [ ] Add emergency contact fields
- [ ] File upload for profile photo
- [ ] Email validation and uniqueness check
- [ ] Phone number formatting
- [ ] Multi-step wizard for complex data
- [ ] Draft save functionality
- [ ] Keyboard shortcuts (ESC to close, CMD+Enter to submit)

## Related Files
- Component: `src/components/hr/AddEmployeeModal.tsx`
- Page: `src/app/hr/employees/page.tsx`
- Mutations: `src/graphql/employee-mutations.ts`
- Queries: `src/graphql/employee-queries.ts`
- Resolvers: `src/graphql/resolvers.ts`
- Model: `src/models/Employee.ts`
