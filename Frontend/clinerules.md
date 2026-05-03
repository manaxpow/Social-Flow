# Social Flow Frontend Rules & Patterns

## Role
You are an expert Senior Frontend Engineer specializing in React 19, TypeScript, and Meta-style UI/UX (Facebook). You prioritize performance, type safety, and "Composition over Inheritance".

## Facebook UI/UX Philosophy
1. Interactivity: Use Skeleton loaders for data fetching. Actions should feel optimistic (TanStack Query optimistic updates).
2. Layout: Mobile - first.Use "Facebook-gray" backgrounds(#f0f2f5) with white Card components.
3.Typography: Use system fonts.Bold for names, muted / gray for timestamps.
4.Feedback: Use 'Sonner' for toasts and 'Framer Motion'(if available) or CSS transitions for hover states.

## Architecture Standards
1. Feature-First: Place logic in `src/components/features/[feature_name]`. 
2.Separation of Concerns:
   -UI: `src / components / ui` (pure shadcn).
   - Logic: `src / hooks / queries` (Server state) or `src/stores` (Global state).
   - Services: `src / services` (Raw Axios calls).
3. Composition: Prefer specialized components (e.g., <PostHeader />, <PostContent />) composed inside a <PostCard />.

## React 19 & TypeScript Best Practices
1. Ref/Actions: Use the new 'useActionState' or 'useFormStatus' where appropriate for forms.
2. Directives: Use "use client" only where necessary.
3. Props: Always define interfaces for props. Use `Readonly<Props>`.
4. Hooks: Standardize on TanStack Query v5. Use the object syntax: `useQuery({ queryKey, queryFn })`.

## Coding Patterns
1.Tailwind: Use 'cn()' utility from `src/lib/utils.ts` for conditional classes.
2. Forms: Always use React Hook Form + Zod. Match schemas in `src/lib/zod/`.
3. Icons: Always use 'Lucide React'. Default size is 20px.
4. Loading: Every feature page must have a `Skeleton` state variant.

## Git & Files
1. Naming: kebab -case for files(e.g., `user - profile.tsx`), PascalCase for components.
2.Imports: Use path aliases `@/ components / ...` instead of relative paths.
3.Clean Code: Remove unused imports and console.logs before finishing a task.

## Agent Instructions
- Always 'list_files' in the relevant feature folder before editing.
- When creating a new feature, generate the Service, the Zod Schema, the TanStack Query hook, and the UI component in that order.
- If a UI component needs a variant, use 'cva'(class-variance - authority).

## Comment System Rules
1. **Comment Order**: New comments are always added at the bottom of the list.
2. **Level 1 Comments (Post-level)**:
   - If total ≤ 10 comments → Show all at once
   - If total > 10 comments → Use infinite scroll pagination
3. **Level 2 Comments (Reply-level)**:
   - Always paginate: Show 10 replies at a time
   - Show "Xem thêm" button to load more
4. **Auto-tag**: When replying, auto-add "@username" prefix to textarea (if not replying to self)
5. **Max 2 Levels**: Only Lv1 (post) and Lv2 (reply to Lv1). Reply to Lv2 stays at Lv2 (no Lv3).
