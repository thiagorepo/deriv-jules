# @org/ui

The central repository for reusable Next.js components tailored for the multi-tenant trading platform.
Built alongside Tailwind CSS v4.

## Components
- Shared Layouts (`Sidebar`, `Header`)
- Primitives (`Button`, `Card`, `InputField`)
- Complex specific views (`AdminDashboard`, `UserPurchases`, `RegisterForm`)

Components import their interactive functionality directly but rely entirely on `@org/theme` CSS variables to dictate their styles.
