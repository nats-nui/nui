# GitHub Copilot Instructions for NATS NUI

## Project Overview
This is a **React** frontend application built with **Vite**, designed to run as both a **Web** application and a **Desktop** application (via **Wails**). It interacts with NATS servers.

## Architecture & Core Libraries
- **State Management**: Uses **`@priolo/jon`**. Stores are located in `src/stores/`.
- **UI/Layout**: Uses **`@priolo/jack`** for the docking/layout system (Deck, Drawer, ZenCard).
- **Editor**: Uses **Monaco Editor** (`@monaco-editor/react`) for code/JSON editing.
- **API Layer**: Located in `src/api/`. Abstracts backend communication.
  - **Web**: Uses HTTP via `src/plugins/AjaxService`.
  - **Desktop**: Uses Wails bindings (check `src/api/wailsjs/` and `VITE_TARGET` env var).
- **Protobuf**: Uses `protobufjs` with a context provider `ProtobufSchemaContext`.

## Key Conventions
- **Imports**: Always use the `@/` alias for `src/` (e.g., `import ... from "@/components/..."`).
- **Naming**:
  - **API**: Backend (NATS) often returns `snake_case`. Convert to `camelCase` for frontend usage using `snakeToCamel` utility.
  - **CSS**: Use **CSS Modules** (`*.module.css`) for component styles. Global styles are in `src/css/`.
- **Dates**: Use **`dayjs`** for date manipulation.
- **Mocking**: Uses **MSW** (Mock Service Worker) for API mocking in development (`src/mocks/`).

## Developer Workflows
- **Run Web**: `npm run dev`
- **Run Desktop**: `npm run dev-desktop` (requires Wails setup)
- **Build Web**: `npm run build`
- **Build Desktop**: `npm run build-desktop`
- **Test**: `npm run test` (Vitest)

## Code Patterns
- **Stores**:
  ```typescript
  import { createStore } from "@priolo/jon"
  export const myStore = createStore({
    state: { ... },
    actions: { ... }
  })
  ```
- **Components**:
  ```tsx
  import { useStore } from "@priolo/jon"
  import cls from "./MyComponent.module.css"
  
  const MyComponent = () => {
    const state = useStore(myStore)
    return <div className={cls.root}>...</div>
  }
  ```
