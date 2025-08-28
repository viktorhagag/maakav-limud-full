# Auto Boot Patch
1. Copy `src/store/boot.ts` into your project.
2. In `src/main.tsx` (או `src/App.tsx`) הוסף:
   ```ts
   import { bootIfEmpty } from "@/store/boot";
   bootIfEmpty();
   ```
3. (אופציונלי) הוסף את מקטע fallback ב-Home.tsx.
4. פרוס מחדש. בביקור ראשון, המסד ריק -> נבנה הכל אוטומטית.
