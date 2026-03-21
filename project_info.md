# Project Information: textCompare

## Overview
**textCompare** is a React-based web application designed for efficient side-by-side text comparison. It leverages the Monaco Diff Editor to provide a high-fidelity development experience, featuring real-time difference calculation, custom search across both panes, and deterministic change navigation.

## Core Functionality
- **Side-by-Side Comparison:** Two editable Monaco editor panes (Original and Modified) for entering and comparing text.
- **Real-Time Diffing:** Automatically calculates and highlights line-level differences as text is modified.
- **Custom Integrated Search:** A React-built search bar (Ctrl+F) that searches both editors simultaneously, replacing the native Monaco find widget to ensure a stable and consistent UI.
- **Change Navigation:** Dedicated controls to jump between differences with index-based tracking (e.g., "1 of 5").
- **Safety & Undo:** A "Clear All" action with a confirmation prompt and a one-step "Undo Clear" to restore accidentally cleared content.

## Tech Stack
- **Frontend Framework:** React 19 (Strict Mode enabled)
- **Build Tool:** Vite 7
- **Editor Core:** Monaco Editor (via `@monaco-editor/react`)
- **Language:** JavaScript (ESM)
- **Styling:** CSS3 (Flexbox/Grid for layout)
- **Testing:** Vitest

## Application Architecture

### Entry Points
- `index.html`: Main HTML template with the `#root` mount point.
- `src/main.jsx`: Bootstraps the React application.

### State Management & Data Flow
- `src/App.jsx`: The root component that owns the `original` and `modified` text state. It manages the "Clear All" logic and snapshots for "Undo Clear."
- `src/components/DiffEditor.jsx`: The primary feature component. It manages:
    - Monaco Diff Editor lifecycle and mounting.
    - Custom search logic (querying both text models and applying highlights).
    - Navigation between changes (calculating indices and scrolling).
    - Toolbar UI state (toggling search mode vs. navigation mode).

### Logic & Utilities
- `src/components/diffNavigation.js`: Isolate math for calculating change line numbers and determining next/previous indices based on the current cursor position.

### Styling
- `src/index.css`: Global theme variables, dark mode settings, and custom scrollbar styles.
- `src/App.css`: High-level container layout.
- `src/components/DiffEditor.css`: Specialized styles for the toolbar, icon buttons, search input, and diff counters.

## User Interface Layout

### Toolbar (diff-status-panel)
The toolbar is organized for efficiency with a clear separation between actions and navigation:
- **Left Side (Actions):** Primary actions like "Clear All" and "Undo Clear" are positioned here.
- **Center:** A flexible spacer keeps the UI balanced across different screen sizes.
- **Right Side (Controls):** All navigation and search controls are grouped here:
    - **Difference Navigation:** "Up" and "Down" icon buttons with a "pill" counter showing the current change index.
    - **Search Toggle:** A magnifying glass icon that activates the custom search bar.
- **Search Mode:** When active, the search input field occupies the right side, accompanied by "Next/Prev" match buttons and a "Close" icon.

## Keyboard Shortcuts
- `Ctrl + F`: Activates the custom search bar.
- `Alt + Up Arrow`: Navigates to the previous difference.
- `Alt + Down Arrow`: Navigates to the next difference.
- `Esc`: Closes the search bar and returns focus to the editor.
- `Enter / Shift + Enter`: Navigates through search matches when search is open.

## Operational Commands
- `npm run dev`: Starts the local development server.
- `npm run build`: Compiles the application for production.
- `npm run test`: Executes unit tests for navigation logic.
- `npm run lint`: Performs static code analysis using ESLint.
- `npm run deploy`: Deploys the production build (GitHub Pages).
