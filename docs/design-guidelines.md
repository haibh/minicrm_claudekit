# Design Guidelines

**Version:** 1.1 | **Updated:** 2026-02-02

---

## Design Philosophy

MiniCRM prioritizes **clarity, efficiency, and simplicity** for B2B users managing relationships at scale.

- **Clarity:** Information hierarchy guides users to key actions
- **Efficiency:** Minimize clicks to accomplish tasks
- **Simplicity:** Clean UI with no unnecessary features

---

## Component Library: shadcn/ui + Radix UI

MiniCRM uses **Radix UI** (via shadcn/ui) for accessible, unstyled components combined with **Tailwind CSS** for styling.

### Core Components

| Component | Use Case | Props | Example |
|-----------|----------|-------|---------|
| **Button** | CTAs, form submit, actions | `variant`, `size`, `disabled` | Create, Save, Delete |
| **Card** | Content containers | `className` for borders/shadow | Company detail, metrics |
| **Dialog** | Modal forms, confirmations | `open`, `onOpenChange` | Create/edit forms |
| **Select** | Dropdown fields | `value`, `onValueChange` | Deal stage, company size |
| **Table** | List data (Phase 1 standard) | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` | **Company/contact/deal/activity lists (replaced raw HTML)** |
| **Tabs** | Section navigation | `value`, `onValueChange` | Company detail (info/deals/activities) |
| **Checkbox** | Boolean toggles | `checked`, `onCheckedChange` | Decision-maker flag |
| **Label** | Form labels | `htmlFor` | Pair with inputs |
| **Popover** | Inline menus | `open`, `onOpenChange` | Quick filters, more actions |
| **AlertDialog** | Destructive confirm | `onConfirm`, `onCancel` | Delete confirmation |

### Import Pattern

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
```

---

## Tailwind CSS Styling

### Utility-First Approach

```tsx
// ✓ GOOD: Utility classes
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
  <p className="text-sm text-gray-600">Manage your company database</p>
</div>

// ✗ BAD: Inline styles, CSS modules
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
```

### Responsive Design

```tsx
// Mobile-first breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</div>

// Hide on mobile, show on tablet+
<div className="hidden md:block">...</div>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">...</div>
```

### Dark Mode (Future)

```tsx
// Tailwind dark mode via class strategy
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

---

## Color Palette

### Semantic Colors

| Use | Tailwind | Hex | Usage |
|-----|----------|-----|-------|
| Primary Action | `blue-600` | #2563EB | Create, Save, primary buttons |
| Success | `green-600` | #16A34A | Completed, closed-won |
| Warning | `yellow-600` | #CA8A04 | Pending, expiring soon |
| Danger/Error | `red-600` | #DC2626 | Delete, failed, closed-lost |
| Neutral/Disabled | `gray-400` | #9CA3AF | Disabled buttons, secondary text |
| Background | `gray-50` | #F9FAFB | Page background |
| Border | `gray-200` | #E5E7EB | Card borders, dividers |
| Text Primary | `gray-900` | #111827 | Headlines, body text |
| Text Secondary | `gray-600` | #4B5563 | Captions, metadata |

### Status Badges

| Status | Color | Example |
|--------|-------|---------|
| Prospecting | `blue-100` / `blue-600` | Early-stage deal |
| Qualification | `indigo-100` / `indigo-600` | Evaluating fit |
| Proposal | `purple-100` / `purple-600` | Made offer |
| Negotiation | `yellow-100` / `yellow-600` | Discussing terms |
| Closed Won | `green-100` / `green-600` | Deal completed |
| Closed Lost | `red-100` / `red-600` | Deal lost |

```tsx
// Example: DealStageBadge component
<span className={cn(
  'px-3 py-1 rounded-full text-sm font-medium',
  {
    'bg-blue-100 text-blue-700': stage === 'prospecting',
    'bg-green-100 text-green-700': stage === 'closed_won',
    'bg-red-100 text-red-700': stage === 'closed_lost',
  }
)}>
  {formatStage(stage)}
</span>
```

---

## Layout Patterns

### Dashboard Layout

```
┌─────────────────────────────────────────┐
│        DashboardHeader (fixed)          │
│  Logo | Search | User Menu              │
├──────────────┬──────────────────────────┤
│              │                          │
│   Sidebar    │     Main Content         │
│ (collapsible)│                          │
│              │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

### List View Layout (Phase 1 Standard)

```
┌─────────────────────────────────────────┐
│  PageHeader (Title + Breadcrumb)        │
├─────────────────────────────────────────┤
│  Filters (Sidebar or Toolbar)           │
├─────────────────────────────────────────┤
│  shadcn Table Component                 │
│  [Row 1] [Row 2] [Row 3] ...            │
│  (Uses Table, TableHeader, TableBody,   │
│   TableRow, TableCell components)       │
├─────────────────────────────────────────┤
│  Pagination Controls                    │
└─────────────────────────────────────────┘
```

**Phase 1 Pattern:** All list views use shadcn Table component. No raw HTML `<table>` tags (see deal-list-table.tsx).

### Detail View Layout

```
┌─────────────────────────────────────────┐
│  PageHeader (Title + Actions)           │
├─────────────────────────────────────────┤
│  Detail Card (Overview)                 │
├─────────────────────────────────────────┤
│  Tabs: Info | Activities | Related      │
│  ┌───────────────────────────────────┐  │
│  │ Tab Content                       │  │
│  │ Related items, timeline, etc.     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Form Pattern

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Company</DialogTitle>
    </DialogHeader>

    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <input
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Company Size</Label>
        <Select name="size">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tiny_1_10">1-10 employees</SelectItem>
            <SelectItem value="small_11_50">11-50 employees</SelectItem>
            {/* ... */}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

---

## Typography

### Font Stack

```css
/* Tailwind default sans serif (system fonts) */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Heading Hierarchy

| Level | Class | Size | Weight | Usage |
|-------|-------|------|--------|-------|
| H1 | `text-3xl` | 30px | `font-bold` | Page title |
| H2 | `text-2xl` | 24px | `font-semibold` | Section heading |
| H3 | `text-xl` | 20px | `font-semibold` | Subsection |
| H4 | `text-lg` | 18px | `font-semibold` | Minor heading |
| Body | `text-base` | 16px | `font-normal` | Content |
| Small | `text-sm` | 14px | `font-normal` | Captions, metadata |
| Extra Small | `text-xs` | 12px | `font-normal` | Hints, timestamps |

```tsx
// Example
<h1 className="text-3xl font-bold text-gray-900">Companies</h1>
<h2 className="text-2xl font-semibold text-gray-800 mt-6">Recent Activity</h2>
<p className="text-base text-gray-600">Manage your business relationships.</p>
<span className="text-xs text-gray-500">Updated 2 hours ago</span>
```

---

## Spacing & Sizing

### Spacing Scale

```
2px (0.5), 4px (1), 8px (2), 12px (3), 16px (4), 20px (5), 24px (6),
28px (7), 32px (8), 36px (9), 40px (10), 48px (12), 56px (14), 64px (16), ...
```

### Common Patterns

```tsx
// Padding inside cards
<Card className="p-6">...</Card>  // p-6 = 24px padding

// Margin between sections
<div className="space-y-4">...</div>  // 16px gap between items

// Gap in flex layouts
<div className="flex gap-3">...</div>  // 12px gap

// Margin between elements
<button className="mt-4">...</button>  // 16px margin-top
```

---

## Interactive States

### Button States

```tsx
<Button
  disabled={isLoading}
  className={cn(
    'bg-blue-600 text-white',
    {
      'opacity-50 cursor-not-allowed': isLoading,
      'hover:bg-blue-700 active:bg-blue-800': !isLoading,
    }
  )}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

### Form Input Focus

```tsx
<input
  className="border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

### Hover Effects

```tsx
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  {/* Content */}
</Card>
```

---

## Responsive Breakpoints

MiniCRM is **desktop-first** with mobile support via Tailwind breakpoints:

| Breakpoint | Width | Devices | Priority |
|-----------|-------|---------|----------|
| Default | 0px+ | Mobile | Low (not optimized) |
| `sm` | 640px+ | Small tablets | Low |
| `md` | 768px+ | Tablets | Medium |
| `lg` | 1024px+ | Small laptops | High |
| `xl` | 1280px+ | Full desktop | High |
| `2xl` | 1536px+ | Large monitors | Low |

**Current state:** Functional on tablet, optimized for desktop (1024px+).

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance Target

| Guideline | Implementation |
|-----------|----------------|
| Color Contrast | Text: 4.5:1 ratio (normal), 3:1 ratio (large) |
| Keyboard Navigation | Tab order, focus indicators, Enter/Space activation |
| Form Labels | Every input has associated `<label htmlFor>` |
| ARIA Attributes | `role`, `aria-label`, `aria-expanded` for screen readers |
| Alt Text | Images have descriptive alt attributes |
| Skip Links | Skip to main content (future enhancement) |

### Radix UI Accessibility

Radix components include:
- Focus management
- Keyboard navigation (Tab, Enter, Escape)
- ARIA roles and attributes
- Screen reader support

---

## Loading & Empty States

### Loading Skeleton

```tsx
<div className="space-y-4">
  {[...Array(3)].map((_, i) => (
    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
  ))}
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="w-12 h-12 text-gray-400 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900">No companies yet</h3>
  <p className="text-sm text-gray-600 mt-1">
    Create your first company to get started.
  </p>
  <Button className="mt-4">Create Company</Button>
</div>
```

---

## Dark Mode Support (Future)

Tailwind CSS supports dark mode via class strategy:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Content automatically adapts */}
</div>
```

Enable in future by setting dark mode in `tailwind.config.ts`:

```ts
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
};
```

---

## Icons & Visual Elements

### Icon Library

MiniCRM uses **Lucide React** for consistent, open-source icons:

```tsx
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  // ...
} from 'lucide-react';

<Building2 className="w-5 h-5 text-gray-600" />
```

### Icon Sizing Convention

| Use | Size | Class |
|-----|------|-------|
| Sidebar nav | 20px | `w-5 h-5` |
| Button icon | 18px | `w-4.5 h-4.5` |
| Card header | 24px | `w-6 h-6` |
| Large display | 32px+ | `w-8 h-8` or larger |

---

## Animation & Transitions

### Tailwind Built-in Transitions

```tsx
// Smooth shadow on hover
<Card className="hover:shadow-lg transition-shadow">

// Fade-in on load
<div className="animate-fade-in">

// Pulse for loading
<div className="animate-pulse">
```

### Avoid Over-Animation

- Keep animations < 300ms for UI feedback
- Use transitions only for state changes (hover, active, focus)
- Avoid constant animations that distract from content

