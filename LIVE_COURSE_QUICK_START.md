# Live Course Feature - Quick Start Guide

## For Admins: Creating a Live Course

### Step 1: Choose Course Type
When creating a new course, you'll see two options:
```
┌─────────────────────────────────────────────────────────┐
│ Course Type *                                           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │ 🎥 Recorded Course   │  │ 📅 Live Course      │   │
│  │ Pre-recorded video   │  │ Scheduled live      │   │
│  │ lessons              │  │ sessions            │   │
│  └──────────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Fill Live Session Details
When you select "Live Course", additional fields appear:

```
┌─────────────────────────────────────────────────────────┐
│ 📅 Live Session Details                                │
├─────────────────────────────────────────────────────────┤
│ Meeting Platform *                                      │
│ [Zoom ▼]                                               │
│                                                         │
│ Meeting Link *                                         │
│ [https://zoom.us/j/123456789        ]                 │
│                                                         │
│ Start Date & Time *    │ End Date & Time *             │
│ [2024-01-15 19:00]     │ [2024-01-15 21:00]           │
│                                                         │
│ Recurring Session                          [Toggle]    │
│ Recurring Schedule                                     │
│ [Every Monday at 7 PM JST          ]                  │
└─────────────────────────────────────────────────────────┘
```

## For Students: Joining a Live Course

### On Course Detail Page

When enrolled in a live course, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│ Course Access                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🎥 Live Session                                       │
│  ┌───────────────────────────────────────────────┐    │
│  │ 📅 Scheduled Time                             │    │
│  │ Monday, January 15, 2024 at 7:00 PM          │    │
│  │ to 9:00 PM                                    │    │
│  │                                               │    │
│  │ 🔁 Every Monday at 7 PM JST                   │    │
│  │                                               │    │
│  │ ┌───────────────────────────────────────┐    │    │
│  │ │  🔗 Join Live Session                │    │    │
│  │ └───────────────────────────────────────┘    │    │
│  │                                               │    │
│  │ Platform: Zoom                                │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│ ─────────────────────────────────────────────────────  │
│ Type: live                                             │
│ Lessons: 5                                             │
│ Duration: 2 hours                                      │
│ Level: intermediate                                    │
└─────────────────────────────────────────────────────────┘
```

### In Learning Interface

While learning, quick access is available in the sidebar:

```
┌─────────────────────────────────────────┐
│ 🎥 Live Session                        │
├─────────────────────────────────────────┤
│ 📅 Next Session                        │
│ Jan 15, 2024, 7:00 PM                  │
│ 🔁 Every Monday at 7 PM                │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │  🔗 Join Session               │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📚 Course Content                      │
├─────────────────────────────────────────┤
│ [Lesson list here...]                  │
└─────────────────────────────────────────┘
```

## Example Use Cases

### Use Case 1: Weekly Coding Workshop
```yaml
Course Type: Live
Title: "JavaScript Weekly Workshop"
Meeting Platform: Zoom
Meeting Link: https://zoom.us/j/987654321
Start Time: 2024-01-15 18:00
End Time: 2024-01-15 20:00
Recurring: Yes
Schedule: "Every Monday at 6 PM JST"
```

### Use Case 2: One-Time Masterclass
```yaml
Course Type: Live
Title: "React Hooks Masterclass"
Meeting Platform: Google Meet
Meeting Link: https://meet.google.com/abc-defg-hij
Start Time: 2024-02-10 14:00
End Time: 2024-02-10 17:00
Recurring: No
```

### Use Case 3: Monthly Q&A Session
```yaml
Course Type: Live
Title: "Monthly Developer Q&A"
Meeting Platform: Teams
Meeting Link: https://teams.microsoft.com/l/meetup-join/...
Start Time: 2024-01-20 15:00
End Time: 2024-01-20 16:00
Recurring: Yes
Schedule: "First Saturday of each month at 3 PM"
```

## Tips & Best Practices

### ✅ DO:
- Test your meeting link before publishing
- Set reminders for yourself before sessions
- Include timezone in recurring schedule descriptions
- Update meeting link if it changes
- Add recorded materials after live sessions

### ❌ DON'T:
- Use expired meeting links
- Forget to update recurring session times
- Make sessions too long (2-3 hours max recommended)
- Forget to inform students of schedule changes

## Switching Between Course Types

You can switch a course from Recorded to Live (or vice versa) by:
1. Go to Admin → Courses
2. Click Edit on your course
3. Change the Course Type radio button
4. Fill in the required fields for the new type
5. Save changes

**Note**: When switching from Live to Recorded, live session data is cleared.

## Common Questions

**Q: Can I have both recorded lessons and live sessions?**
A: Yes! Even for live courses, you can still add lesson materials that students can access anytime.

**Q: What happens if I change the meeting link?**
A: Just edit the course and update the meeting link. Students will see the new link immediately.

**Q: Can students see past session information?**
A: Currently, the system shows the scheduled session. Consider updating the schedule for the next session.

**Q: How do I notify students about live sessions?**
A: Students can see session times on the course page. Consider sending email reminders separately.

**Q: Can I schedule multiple sessions?**
A: Currently, set one session at a time. Use recurring schedule for regular patterns, and update times as needed.
