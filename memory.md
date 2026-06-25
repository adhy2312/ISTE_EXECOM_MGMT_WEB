# Antigravity Context Memory

## Current Project
**Name:** ISTE SC MBCET Executive Management & Accountability Mobile Client
**Path:** `e:\iste apps\New folder`

## Architecture Context
- **State Management:** Riverpod.
- **Theme:** Dark mode, tech aesthetic (midnight blues, electric blues, neon accents).
- **Security:** 
  - `flutter_secure_storage` handling local mock tokens.
  - Role-Based Access Control (RBAC) powered by `auth_controller.dart`. Strict routing guards for `AdminDashboardScreen` and `FacultyPortalScreen`.

## Completion Status
- `pubspec.yaml`: includes `flutter_secure_storage`.
- Models: `ExecomMember` (upgraded with `UserRole` and `UserStatus`), `TaskItem`, `LeaderboardSnapshot`.
- Views: 
  - `MainLayout` (dynamic RBAC routing with debug Role Switcher)
  - `ChairpersonPanel` (provisioning members with specific roles)
  - `AdminDashboardScreen` (system vars, roster management, archive engine)
  - `FacultyPortalScreen` (read-only observatory, MoM document tree, live event stream)
  - `TaskMatrixScreen`, `LeaderboardScreen`, `DigitalIdScreen` (core views)
- Services: `IDatabaseService`, `SecureStorageService`, and `MockDatabaseService`.

## Next Steps
- Verify the build vectors using Flutter CLI once SDK is sourced.
- Expand backend hooks to real Node.js/Firebase architecture when ready.
