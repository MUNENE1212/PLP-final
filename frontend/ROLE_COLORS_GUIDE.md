# Role-Based Color System Guide

This guide explains the role-based color system implemented across the EmEnTech platform.

## Overview

Different user roles are visually distinguished using consistent color schemes throughout the UI. This helps users quickly identify who they're interacting with in posts, messages, and other components.

## Available Roles and Colors

### 👤 Customer (Blue)
- **Primary Color**: Blue
- **Use Case**: Regular users seeking services
- **Visual Indicators**: Blue badge, blue border accent, blue profile ring

### 🔧 Technician (Green)
- **Primary Color**: Green
- **Use Case**: Service providers and technicians
- **Visual Indicators**: Green badge, green border accent, green profile ring

### 👑 Admin (Purple)
- **Primary Color**: Purple
- **Use Case**: Platform administrators
- **Visual Indicators**: Purple badge, purple border accent, purple profile ring

### 🏢 Corporate (Amber/Orange)
- **Primary Color**: Amber
- **Use Case**: Corporate/business accounts
- **Visual Indicators**: Amber badge, amber border accent, amber profile ring

### 💬 Support (Cyan)
- **Primary Color**: Cyan
- **Use Case**: Customer support team
- **Visual Indicators**: Cyan badge, cyan border accent, cyan profile ring

## Components Using Role Colors

### 1. PostCard
- **Left Border**: Colored based on post author's role
- **Profile Picture Ring**: Matches role color
- **Role Badge**: Displays next to author name

### 2. MessageBubble
- **Avatar Ring**: Colored based on sender's role
- **Role Badge**: Small badge next to sender name
- **Avatar Background**: For users without profile pictures

### 3. RoleBadge (Reusable Component)
A standalone component for displaying role badges anywhere in the app.

## Usage Examples

### Using the RoleBadge Component

```tsx
import RoleBadge from '@/components/common/RoleBadge';

// Full badge with icon and name
<RoleBadge role="technician" />

// Icon only
<RoleBadge role="customer" showIcon showName={false} />

// Different sizes
<RoleBadge role="admin" size="xs" />
<RoleBadge role="admin" size="sm" />
<RoleBadge role="admin" size="md" />
<RoleBadge role="admin" size="lg" />
```

### Using Role Color Utilities Directly

```tsx
import { getRoleStyles, getRoleBadgeClasses, getRoleBorderClasses } from '@/utils/roleColors';

// Get all styles for a role
const roleStyles = getRoleStyles('technician');

// Apply badge classes
<span className={roleStyles.badge}>
  {roleStyles.emoji} {roleStyles.name}
</span>

// Apply border classes
<div className={roleStyles.border}>
  Content with colored border
</div>

// Use specific utility functions
<div className={getRoleBadgeClasses('admin')}>
  Admin Badge
</div>

<div className={getRoleBorderClasses('customer')}>
  Customer Content
</div>
```

## Available Utility Functions

### `getRoleStyles(role: UserRole)`
Returns all style properties for a role:
- `badge`: Badge classes (background + text color)
- `border`: Border classes
- `bgLight`: Light background
- `bgDark`: Dark background
- `ring`: Ring color
- `text`: Text color
- `icon`: Icon color
- `name`: Formatted role name
- `emoji`: Role emoji icon

### `getRoleBadgeClasses(role: UserRole)`
Returns complete badge classes including padding and border radius.

### `getRoleBorderClasses(role: UserRole)`
Returns left border classes (4px colored border).

### `getRoleBgClasses(role: UserRole, variant?: 'light' | 'dark')`
Returns background color classes.

### `getRoleRingClasses(role: UserRole)`
Returns ring color classes for focus states and highlights.

### `getRoleTextClasses(role: UserRole)`
Returns text color classes.

### `getRoleIconClasses(role: UserRole)`
Returns icon color classes.

### `formatRoleName(role: UserRole)`
Returns capitalized role name (e.g., "Technician").

### `getRoleIcon(role: UserRole)`
Returns emoji icon for the role.

## Dark Mode Support

All role colors include dark mode variants and automatically adapt:
- Lighter, more vibrant colors in dark mode
- Proper contrast ratios maintained
- Consistent visual hierarchy

## Accessibility

The color system follows WCAG accessibility guidelines:
- Sufficient contrast ratios (minimum 4.5:1)
- Colors are used as supplementary indicators, not the only means of identification
- Text labels accompany all colored elements

## Customization

To modify role colors, edit `/frontend/src/utils/roleColors.ts`:

```ts
const roleColorSchemes: Record<UserRole, RoleColorScheme> = {
  technician: {
    badge: 'bg-green-100 dark:bg-green-900/30',
    badgeText: 'text-green-800 dark:text-green-300',
    // ... other properties
  },
  // ... other roles
};
```

## Best Practices

1. **Consistency**: Always use the utility functions rather than hardcoding colors
2. **Context**: Apply role colors where user identification is important
3. **Subtlety**: Use as accents, not overwhelming primary colors
4. **Accessibility**: Ensure proper contrast and never rely solely on color
5. **Testing**: Test in both light and dark modes

## Where Role Colors Appear

- ✅ Post cards (border + badge)
- ✅ Message bubbles (avatar ring + badge)
- ✅ Profile cards
- 🔄 Comment sections (planned)
- 🔄 User lists (planned)
- 🔄 Technician cards (planned)

## Future Enhancements

- [ ] Add role color indicators in notifications
- [ ] Include role colors in search results
- [ ] Add role-based theme customization
- [ ] Implement color-blind friendly mode
- [ ] Add custom role colors for corporate accounts

---

**Last Updated**: 2025-11-02
**Version**: 1.0.0
