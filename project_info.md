# Project Information: textCompare

## Overview
**textCompare** is a performance-optimized React-based web application designed for efficient side-by-side text comparison. It leverages a tuned Monaco Diff Editor to provide a high-fidelity experience that remains smooth even with large datasets (30,000+ lines of code).

## Core Functionality
- **Theme Toggle:** Switch between dark and light modes with persistence via `localStorage`.
- **Side-by-Side Comparison:** Two editable Monaco editor panes (Original and Modified).
- **High-Performance Diffing:** Uses fast-diff algorithms and extended computation timeouts to handle large files without UI freezing.
- **Custom Integrated Search:** A React-built search bar (Ctrl+F) that searches both editors simultaneously with efficient match highlighting.
- **Change Navigation:** Deterministic traversal between differences with real-time index tracking.
- **Efficiency-First Sync:** Uses a debounced state-synchronization model to ensure typing remain fluid regardless of document size.

## Tech Stack
- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **Editor Core:** Monaco Editor (Tuned for high-volume text)
- **Testing:** Vitest

## Application Architecture

### State Management & Data Flow
- `src/App.jsx`: Manages the root `original` and `modified` text state.
- `src/components/DiffEditor.jsx`: The core engine. Implements a **semi-controlled** model where Monaco acts as the source of truth for rapid editing, and React state is updated lazily via a 250ms debounce.

### Performance Tuning (30k+ Lines)
- **Debounced Sync:** Prevents React reconciliation on every keystroke, saving CPU cycles for the editor.
- **Disabled Overhead:** Minimap, folding, link detection, and background validation are disabled to maximize rendering performance.
- **Extended Diff Engine:** `maxComputationTime` is increased and `fastDiff` is enabled to prevent timeouts during complex comparisons.

## User Interface Layout
- **Left Side (Actions):** "Clear All" action.
- **Right Side (Controls):** Difference navigation (Up/Down), custom search toggle, and an icon-only Dark/Light mode toggle.
- **Editor:** Features an always-visible central sash (divider) separating the two panes for clearer visual distinction.
- **Search Mode:** Right-aligned search input with match navigation.

## Keyboard Shortcuts
- `Ctrl + F`: Activates the custom search bar.
- `Alt + Up Arrow`: Navigates to the previous difference.
- `Alt + Down Arrow`: Navigates to the next difference.
- `Esc`: Closes the search bar and returns focus to the editor.

## Operational Commands
- `npm run dev`: Starts the local development server.
- `npm run build`: Compiles for production.
- `npm run test`: Executes unit tests.
- `npm run deploy`: Deploys to GitHub Pages.
