# Live Course Feature Implementation

## Overview
The platform now supports both **Recorded Courses** and **Live Courses** with full scheduling and meeting integration.

## Features Added

### 1. Database Schema Updates
- Added new fields to the Course model:
  - `courseType`: "recorded" or "live"
  - `meetingLink`: URL for Zoom, Google Meet, Teams, etc.
  - `meetingPlatform`: Platform identifier (zoom, google-meet, teams, custom)
  - `scheduledStartTime`: When the live session starts
  - `scheduledEndTime`: When the live session ends
  - `isRecurring`: Boolean for recurring sessions
  - `recurringSchedule`: Description of recurring schedule (e.g., "Every Monday at 7 PM")

### 2. Admin Features

#### Course Creation Form (`/admin/courses/create`)
- **Course Type Selector**: Radio button choice between Recorded and Live courses
- **Live Course Fields** (shown when "Live" is selected):
  - Meeting Platform dropdown (Zoom, Google Meet, Teams, Custom)
  - Meeting Link input field
  - Start Date & Time picker
  - End Date & Time picker
  - Recurring Session toggle
  - Recurring Schedule description (when recurring is enabled)

#### Course Edit Form (`/admin/courses/[id]/edit`)
- Same fields as creation form
- Pre-populated with existing course data
- Can switch between course types

### 3. Student Features

#### Course Detail Page (`/courses/[id]`)
- **For Enrolled Students in Live Courses**:
  - Prominent "Live Session" card showing:
    - Scheduled date and time (formatted in user-friendly format)
    - Session duration (start to end time)
    - Recurring schedule (if applicable)
    - Meeting platform information
    - "Join Live Session" button that opens meeting link in new tab
  
- **Course Type Badge**: Shows "recorded" or "live" in course details

#### Learning Page (`/courses/[id]/learn`)
- **Live Session Quick Access Card** in sidebar:
  - Displays next session time
  - Shows recurring schedule
  - Quick "Join Session" button
  - Always visible while learning for easy access

### 4. API Updates

#### Create Course API (`/api/admin/courses` - POST)
- Accepts all new live course fields
- Validates required fields for live courses
- Converts date strings to ISO format

#### Update Course API (`/api/admin/courses/[id]` - PUT)
- Updates all course fields including live course data
- Validates live course requirements
- Handles course type switching

#### Get Course API (`/api/courses/[id]` - GET)
- Returns all course data including live session information
- Available to enrolled students

## Usage Guide

### Creating a Live Course

1. **Navigate to Admin Panel** → Courses → Create New Course

2. **Select Course Type**:
   - Choose "Live Course" option

3. **Fill Basic Information**:
   - Course title
   - Description
   - Category, level
   - Duration (e.g., "2 hours" for session length)
   - Pricing

4. **Configure Live Session**:
   - Select meeting platform (Zoom, Google Meet, Teams, or Custom)
   - Enter meeting link (e.g., `https://zoom.us/j/123456789`)
   - Set start date and time
   - Set end date and time
   - Optional: Enable recurring and describe schedule

5. **Publish Course**

### Student Experience

#### Joining a Live Course

1. **Enroll in the course** (if paid)

2. **View Session Details**:
   - On course page, see highlighted live session card
   - View scheduled time in your timezone
   - See recurring schedule if applicable

3. **Join Live Session**:
   - Click "Join Live Session" button
   - Opens meeting platform in new tab
   - Meeting link available on both course page and learning interface

#### During Course

- Live session details always visible in sidebar
- One-click access to join meeting
- Can still access recorded materials (if any lessons added)

## Meeting Platform Support

### Supported Platforms
1. **Zoom**: Full support for meeting links
2. **Google Meet**: Direct meeting link integration
3. **Microsoft Teams**: Meeting link support
4. **Custom**: Any other platform with shareable link

### Meeting Link Format Examples
- Zoom: `https://zoom.us/j/123456789?pwd=xxxxx`
- Google Meet: `https://meet.google.com/xxx-xxxx-xxx`
- Teams: `https://teams.microsoft.com/l/meetup-join/...`
- Custom: Any valid URL

## Recurring Sessions

### How It Works
- Enable "Recurring Session" toggle when creating/editing
- Enter a description like:
  - "Every Monday at 7 PM JST"
  - "Weekly on Tuesdays and Thursdays"
  - "First Saturday of each month"
- Students see this schedule on course pages
- Update meeting link as needed for each session

### Best Practices
- Update `scheduledStartTime` and `scheduledEndTime` for each new session
- Keep the same `meetingLink` if using same Zoom room
- Change meeting link if generating new session links
- Update `recurringSchedule` description if schedule changes

## Design Highlights

### Visual Indicators
- 🎥 Video icon for recorded courses
- 📅 Calendar icon for live courses
- 🔁 Recurring icon for repeated sessions
- 🔗 External link icon for join buttons

### Color Coding
- Live session cards use primary color theme
- Highlighted with accent background
- Border styling for emphasis
- Green badges for enrolled status

## Technical Notes

### Date Handling
- Dates stored as ISO strings in database
- Converted to user-friendly format on display
- Uses `datetime-local` input for easy scheduling
- Supports timezone display via browser locale

### Validation
- Live courses require meeting link
- Start and end times required for live courses
- Recorded course fields cleared when switching types
- Form validation prevents incomplete submissions

### Performance
- Lazy loading of course type specific fields
- Conditional rendering based on course type
- Optimized API responses with only needed data

## Future Enhancements (Potential)

1. **Calendar Integration**: Export to Google Calendar, Outlook
2. **Reminder System**: Email/notification before sessions
3. **Recording Links**: Add recording links after live sessions
4. **Attendance Tracking**: Track who joined live sessions
5. **Chat Integration**: In-platform chat during sessions
6. **Breakout Rooms**: Support for multiple session rooms
7. **Waitlist**: For limited capacity sessions

## Support

For any issues or questions about the live course feature:
- Check meeting link validity
- Verify platform selection matches actual platform
- Ensure dates are in correct timezone
- Test meeting link before sharing with students
