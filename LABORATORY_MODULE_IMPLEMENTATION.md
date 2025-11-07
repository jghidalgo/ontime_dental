# Laboratory Module - Backend & UI Implementation

## Overview
This document explains the complete implementation of the Laboratory Reservations calendar system with backend integration.

## Architecture

### Components
1. **Laboratory Reservations Page** (`src/app/laboratory/reservations/page.tsx`)
   - Calendar view (month/week/day)
   - Displays cases with procedure counts per day
   - Modal to view cases for a specific day/procedure
   
2. **Create Case Modal** (`src/app/laboratory/reservations/CreateCaseModal.tsx`)
   - Simplified form for creating lab cases
   - Supports new and existing patients
   - Full field validation
   - Direct GraphQL integration

### Backend Integration

#### GraphQL Mutations
- **CREATE_LAB_CASE**: Creates a new laboratory case
  - Located in: `src/graphql/lab-mutations.ts`
  - Input fields:
    - Patient info: firstName, lastName, birthday
    - Case details: procedure, category, priority
    - Lab info: lab, clinic, doctor
    - Technical: shadeGuide, materialType, toothNumbers
    - Scheduling: reservationDate, estimatedCompletion
    - Other: notes, technician

#### GraphQL Queries
- **GET_LAB_CASES**: Fetches all laboratory cases
  - Located in: `src/graphql/lab-queries.ts`
  - Returns complete case information

### Data Flow

1. **Calendar Display**:
   ```
   GET_LAB_CASES → Transform to ReservationCase → Group by date/procedure → Display counts
   ```

2. **Case Creation**:
   ```
   User fills form → CREATE_LAB_CASE mutation → Refetch cases → Update calendar
   ```

3. **Case Viewing**:
   ```
   Click date/procedure → Filter cases by date → Show in modal → Option to create new case
   ```

## Key Features

### 1. Calendar Navigation
- Month/Week/Day views
- Procedure grouping per day
- Visual indicators for case counts
- Color-coded by procedure type

### 2. Case Management
- View all cases for a specific day
- Filter by procedure
- Create new cases with full details
- Patient type selection (new/existing)

### 3. Form Fields

**Patient Information:**
- First Name (required)
- Last Name (required)
- Birthday (required)
- Patient Type selection

**Case Details:**
- Procedure (required)
- Category (required) - Crowns & Bridges, Implants, etc.
- Priority - normal, rush, urgent
- Lab selection (required)
- Clinic selection (required)
- Doctor selection (required)

**Technical Specifications:**
- Shade Guide (optional)
- Material Type (optional)
- Tooth Numbers (optional, comma-separated)
- Estimated Completion Date (optional)
- Technician (optional)

**Notes:**
- Free-form text for special instructions

## Status Values

The system uses these status values (aligned with backend):
- `in-planning`: Case is being planned
- `in-production`: Currently being fabricated
- `in-transit`: Ready for delivery/in transit
- `completed`: Delivered and completed

## Usage Instructions

### For Developers

1. **Adding new fields to the form:**
   - Update `CreateCaseModalProps` type
   - Add form field in CreateCaseModal.tsx
   - Update GraphQL mutation input
   - Update backend schema and resolver

2. **Customizing calendar view:**
   - Modify grouping logic in the page component
   - Update procedure colors in palette array
   - Adjust date filtering logic

3. **Adding patient search:**
   - Create GET_PATIENTS query
   - Add autocomplete component
   - Update patientType === 'existing' form section

### For Users

1. **Creating a case:**
   - Click on a day in the calendar
   - Select a procedure or create custom
   - Click "Create new case" button
   - Fill in patient and case details
   - Submit form

2. **Viewing cases:**
   - Click on any day with cases (shows count)
   - Modal displays all cases for that day
   - Grouped by procedure
   - Shows patient, doctor, clinic, status

## Next Steps

### Recommended Enhancements

1. **Patient Management Integration:**
   - Link to existing patient records
   - Autocomplete for existing patients
   - Patient history view

2. **Case Status Updates:**
   - In-place status changes
   - Progress tracking
   - Timeline view

3. **Advanced Filtering:**
   - Filter by lab
   - Filter by status
   - Search by patient name
   - Date range selection

4. **Reporting:**
   - Cases by lab
   - Turnaround time analytics
   - Lab performance metrics

5. **Notifications:**
   - Due date alerts
   - Status change notifications
   - Overdue cases warnings

## File Structure

```
src/
├── app/
│   └── laboratory/
│       ├── page.tsx                    # Main dashboard
│       └── reservations/
│           ├── page.tsx                # Calendar view
│           └── CreateCaseModal.tsx     # Case creation form
├── graphql/
│   ├── lab-queries.ts                  # Lab case queries
│   └── lab-mutations.ts                # Lab case mutations
└── models/
    └── LabCase.ts                      # MongoDB model
```

## Testing

To test the implementation:

1. Start the development server: `npm run dev`
2. Navigate to `/laboratory/reservations`
3. Click on any day in the calendar
4. Click "Create new case"
5. Fill in the form and submit
6. Verify the case appears in the calendar
7. Check MongoDB to confirm data storage

## Troubleshooting

**Cases not showing:**
- Check GraphQL endpoint is running
- Verify MongoDB connection
- Check browser console for errors

**Form submission fails:**
- Validate all required fields
- Check network tab for GraphQL errors
- Verify backend schema matches frontend

**Calendar not updating:**
- Check refetch is being called
- Verify query caching settings
- Force reload the page
