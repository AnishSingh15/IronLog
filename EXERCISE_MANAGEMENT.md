# Exercise Management System

A comprehensive web-based exercise management system for IronLog fitness tracking application.

## Features

### ✅ Core Functionality

- **Add Exercises**: Create new exercises with name, muscle group, default sets/reps
- **Edit Exercises**: Modify existing exercise details
- **Delete Exercises**: Remove exercises (with safety checks for used exercises)
- **Search & Filter**: Search by name and filter by muscle group
- **Responsive Design**: Works seamlessly on desktop and mobile

### ✅ User Experience

- **Real-time Search**: Instant filtering as you type
- **Animated UI**: Smooth transitions and hover effects
- **Success/Error Feedback**: Toast notifications for all actions
- **Form Validation**: Prevents invalid data entry
- **Confirmation Dialogs**: Prevents accidental deletions

### ✅ Data Safety

- **Usage Protection**: Cannot delete exercises that are used in workout records
- **Duplicate Prevention**: Prevents creating exercises with duplicate names
- **Error Handling**: Graceful handling of API failures

## Usage

### Accessing Exercise Management

1. Navigate to the **Exercises** tab in the main navigation
2. The page is accessible to all authenticated users
3. Future versions will include admin-only access control

### Adding New Exercises

1. Click the **floating + button** in the bottom-right corner
2. Fill in the exercise details:
   - **Name**: Exercise name (e.g., "Bench Press")
   - **Muscle Group**: Select from predefined groups
   - **Default Sets**: Number of sets (1-10)
   - **Default Reps**: Number of reps (1-100)
3. Click **Add Exercise** to save

### Editing Exercises

1. Find the exercise you want to edit
2. Click the **edit icon** (pencil) on the exercise card
3. Modify the details in the dialog
4. Click **Update Exercise** to save changes

### Deleting Exercises

1. Find the exercise you want to delete
2. Click the **delete icon** (trash) on the exercise card
3. Confirm the deletion in the popup
4. **Note**: Exercises used in workout records cannot be deleted

### Search and Filtering

- **Search Bar**: Type to search by exercise name
- **Muscle Group Filter**: Select a specific muscle group
- **Clear Filters**: Reset all filters to show all exercises

## Technical Implementation

### Frontend Components

- **`/exercises` Page**: Main exercise management interface
- **`useExercises` Hook**: Custom hook for exercise CRUD operations
- **API Client**: Extended with exercise management endpoints

### Backend API Endpoints

- `GET /api/v1/exercises` - List all exercises with filtering
- `GET /api/v1/exercises/popular` - Get most used exercises
- `GET /api/v1/exercises/:id` - Get specific exercise details
- `POST /api/v1/exercises` - Create new exercise
- `PUT /api/v1/exercises/:id` - Update existing exercise
- `DELETE /api/v1/exercises/:id` - Delete exercise (with safety checks)

### Database Schema

The `Exercise` model includes:

- `id`: Unique identifier
- `name`: Exercise name (unique)
- `muscleGroup`: Muscle group category
- `defaultSets`: Default number of sets
- `defaultReps`: Default number of reps
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

## Deployment Considerations

### Local Development

1. Start the backend server: `npm run dev` (in `/apps/server`)
2. Start the frontend: `npm run dev` (in `/apps/web`)
3. Navigate to `http://localhost:3000/exercises`

### Production Deployment

1. **Environment Variables**: Ensure proper API URLs are configured
2. **Authentication**: Currently uses JWT tokens from localStorage
3. **Database**: Prisma migrations should be run in production
4. **Security**: Consider implementing admin-only access control

### Security Enhancements (Future)

- **Role-based Access Control**: Restrict exercise management to admin users
- **Audit Logging**: Track who creates/modifies/deletes exercises
- **Rate Limiting**: Prevent abuse of the exercise management API
- **Input Sanitization**: Additional validation for exercise names

## File Structure

```
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   └── exercises/
│   │   │       └── page.tsx          # Main exercise management page
│   │   ├── components/
│   │   │   └── AppHeader.tsx         # Updated with Exercises nav
│   │   ├── hooks/
│   │   │   └── useExercises.ts       # Exercise management hook
│   │   ├── lib/
│   │   │   └── api.ts                # Extended API client
│   │   └── middleware.ts             # Route protection
│   └── package.json
└── server/
    ├── src/
    │   ├── routes/
    │   │   └── exercises.ts          # Exercise API endpoints
    │   └── scripts/
    │       └── manage-exercises.ts   # Legacy script (still available)
    └── package.json
```

## Migration from Script-based Management

The system now provides both options:

1. **Web UI** (Recommended): User-friendly interface at `/exercises`
2. **Script-based** (Legacy): Still available at `/apps/server/src/scripts/manage-exercises.ts`

### Benefits of Web UI over Scripts:

- ✅ Real-time feedback and validation
- ✅ No need for server access or technical knowledge
- ✅ Works in both development and production
- ✅ Integrated with the main application
- ✅ Better error handling and user experience
- ✅ Mobile-friendly interface

## Support

For issues or feature requests related to exercise management:

1. Check the browser console for error messages
2. Verify API connectivity to the backend
3. Ensure proper authentication tokens are present
4. Review the database for constraint violations

## Future Enhancements

- **Exercise Categories**: Additional categorization beyond muscle groups
- **Exercise Instructions**: Add descriptions and form instructions
- **Exercise Images**: Visual guides for proper form
- **Usage Analytics**: Statistics on exercise popularity
- **Bulk Operations**: Import/export exercises via CSV
- **Exercise Templates**: Pre-defined workout templates
