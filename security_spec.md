# Aura Fitness - Security Specification

## 1. Data Invariants
- A workout cannot be logged without a valid userId matching the authenticated user.
- Calories must be a non-negative number.
- Duration must be a positive integer.
- User profiles can only be created/modified by the owner of the UID.
- Training plans are private to the user.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. Creating a user profile for a different UID.
2. Updating `userId` in a workout to point to another user.
3. Logging negative calories.
4. Logging a workout with a 1MB string in the `notes` field.
5. Reading another user's workout list.
6. Reading another user's training plan.
7. Deleting another user's milestone.
8. Creating a training plan with a script tag in the content.
9. Updating a workout's `timestamp` to a future date (if enforced).
10. Creating a workout without a `userId`.
11. Reading all users' profiles.
12. Attempting to update a workout's `id` or immutable fields.

## 3. Test Runner (Conceptual)
All the above payloads will be tested against the generated rules and must return `PERMISSION_DENIED`.
