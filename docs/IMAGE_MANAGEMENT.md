# Image Management System

This project uses a comprehensive image management system to prevent 404 errors and ensure reliable image loading.

## Components

### 1. Local Placeholder Assets
- `public/images/placeholder-hero.svg` - Hero section images
- `public/images/placeholder-card.svg` - Card/blog images  
- `public/images/placeholder-avatar.svg` - Profile/avatar images

### 2. Centralized Image Registry
- `src/lib/images.ts` - Central registry for all image paths
- Use `IMAGES.hero`, `IMAGES.profile`, etc. instead of hardcoded URLs

### 3. SafeImage Component
- `src/components/ui/safe-image.tsx` - Wrapper around Next.js Image with fallback
- Automatically falls back to placeholder if image fails to load
- Handles both local and remote images gracefully

### 4. Image Pinning Script
- `scripts/pin-images.ts` - Optional script to download remote images locally
- Run with: `node scripts/pin-images.ts`
- Edit the `REMOTE` array to specify URLs to pin

## Usage

### Basic Usage
```tsx
import SafeImage from "@/components/ui/safe-image";
import { IMAGES } from "@/lib/images";

<SafeImage 
  src={IMAGES.hero} 
  alt="Description" 
  width={800} 
  height={600} 
/>
```

### With Custom Fallback
```tsx
<SafeImage 
  src="/some/image.jpg" 
  alt="Description" 
  width={400} 
  height={300}
  fallbackSrc={IMAGES.profile}
/>
```

## ESLint Protection

The project includes an ESLint rule that prevents inline remote URLs in Image components:

```tsx
// ❌ This will trigger a warning
<Image src="https://images.unsplash.com/photo-123" alt="..." />

// ✅ Use this instead
<SafeImage src={IMAGES.hero} alt="..." />
```

## Adding New Images

1. **For local images**: Add the file to `public/images/` and update `src/lib/images.ts`
2. **For remote images**: Use the pinning script to download them locally first
3. **Always use SafeImage**: Never use the raw Next.js Image component for external URLs

## Benefits

- ✅ No more 404 image errors
- ✅ Consistent fallback behavior
- ✅ Better performance (local assets)
- ✅ ESLint protection against regressions
- ✅ Centralized image management
- ✅ Easy to maintain and update
