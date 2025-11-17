# Open Dental Patient Sync Guide

## Overview
This guide explains how to sync patients from your Open Dental database to OnTime Dental.

## Database Connection Details
- **Host**: 127.0.0.1
- **Port**: 3306
- **Username**: root
- **Password**: Dylan-12
- **Database**: demo

## How to Set Up Sync

### Step 1: Navigate to Settings
1. Open the OnTime Dental application
2. Click on **Settings** in the main navigation
3. Select the **Integrations** tab

### Step 2: Add Integration
1. Click the **"Add Integration"** button
2. Select **"Open Dental"** from the provider list
3. Enter the connection details:
   - **Server Host**: `127.0.0.1`
   - **Port**: `3306`
   - **Username**: `root`
   - **Password**: `Dylan-12`
4. Click **"Test Connection"** to verify credentials
5. Select **"demo"** database from the dropdown
6. Click **"Save Integration"**

### Step 3: Sync Patients
1. Find your Open Dental integration in the list
2. Click the **"Sync Patients"** button
3. Configure sync options:
   - **Full Sync**: Import all active patients (recommended for first sync)
   - **Incremental Sync**: Only import patients modified since last sync
   - **Limit**: Number of patients to import per sync (default: 100)
4. Click **"Start Sync"**

## What Data Gets Synced

The sync process imports the following patient information from Open Dental:

### Basic Information
- **First Name** (uses Preferred name if available)
- **Last Name**
- **Birthday**
- **Gender**

### Contact Information
- **Email**
- **Phone** (prioritizes: Wireless > Home > Work)
- **Address** (combines Address and Address2)
- **City**
- **State**
- **ZIP Code**

### Additional Information
- **SSN** (stored in notes for security)
- **Medicaid ID** (stored as insurance number)
- **Open Dental Patient Number** (stored in notes for reference)

## Sync Behavior

### New Patients
- Patients not found in OnTime Dental will be **created**
- Assigned to the company associated with the integration

### Existing Patients
- Matched by: Patient Number in notes OR (First Name + Last Name + Birthday)
- Existing patient records will be **updated** with latest data from Open Dental

### Skipped Patients
- Patients without a birthdate are skipped
- Patients with data errors are skipped (errors are logged)

## Sync Results

After sync completes, you'll see a summary:
- **Patients Added**: New patients created
- **Patients Updated**: Existing patients updated
- **Patients Skipped**: Patients that couldn't be synced
- **Errors**: List of any errors encountered

## Best Practices

### Initial Setup
1. **Test Connection First**: Always test the connection before saving
2. **Start Small**: For first sync, use a limit of 100-500 patients
3. **Full Sync**: Use full sync for the initial import

### Regular Syncing
1. **Incremental Sync**: Use incremental sync for regular updates
2. **Schedule**: Sync at least once daily (or after busy clinic hours)
3. **Monitor Errors**: Check sync results for any errors

### Troubleshooting

#### Connection Failed
- Verify MySQL server is running
- Check firewall settings allow connections to port 3306
- Confirm username and password are correct
- Ensure the database name is correct

#### No Patients Found
- Verify patients exist in Open Dental with PatStatus = 0 (active)
- Check the selected database contains patient data
- Ensure DateTStamp field exists in patient table

#### Partial Sync
- Review error messages in sync results
- Check patient records in Open Dental for data issues
- Increase sync limit if needed

## Technical Details

### Database Query
The sync executes the following SQL query on Open Dental:

```sql
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
AND DateTStamp > [last_sync_date] -- Only for incremental sync
LIMIT [limit]
```

### Patient Matching Logic
1. **First Check**: Search for existing patient by Patient Number in notes
2. **Second Check**: Search by First Name + Last Name + Birthday + Company ID
3. **Action**: Update if found, Create if not found

### Security Notes
- Database passwords are encrypted in storage
- SSN data is stored in notes field (not exposed in API responses)
- All sync operations are logged with timestamps

## Support

For issues or questions about patient sync:
1. Check error messages in sync results
2. Verify Open Dental database connectivity
3. Review this guide for configuration details
4. Check application logs for detailed error information
