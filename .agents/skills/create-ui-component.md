# 🛠️ Skill: Create UI Component

Gunakan skill ini setiap kali ingin membuat komponen baru di `packages/ui`.

### 1. Struktur Folder
Setiap komponen wajib memiliki folder sendiri di `packages/ui/src/components/[ComponentName]/`:
- `index.ts`: Export utama.
- `[ComponentName].tsx`: Logic & JSX.
- `[ComponentName].variants.ts`: Definisi CVA variants.

### 2. Standar Coding
- **CVA First**: Wajib menggunakan `class-variance-authority`.
- **Tailwind v4**: Gunakan utility classes Tailwind v4.
- **Radix UI Slot**: Gunakan `asChild` pattern dengan Radix Slot jika komponen bersifat polimorfik.
- **Typography Integration**: Gunakan komponen `<Typography />` untuk elemen teks di dalam komponen agar konsisten.

### 3. Template File

#### `[ComponentName].variants.ts`
```typescript
import { cva } from "class-variance-authority";

export const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
      },
      size: {
        md: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

#### `[ComponentName].tsx`
```tsx
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { componentVariants } from "./[ComponentName].variants";

export interface ComponentProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

export const ComponentName = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

ComponentName.displayName = "ComponentName";
```
