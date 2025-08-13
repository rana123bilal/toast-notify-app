# Reusable Toast Notification System (React)

A lightweight, accessible toast system built with React + TypeScript that supports stacking, auto-dismiss, manual dismissal, theming, and smooth animations. This README maps directly to the assessment requirements and explains how to run, test, and evaluate the project—without code snippets.

## Overview & Design Rationale

### Goals
- One small provider and a hook for a tiny, ergonomic API.  
- Strong accessibility defaults (screen-reader friendly, keyboard-operable).  
- Theming via CSS variables; easy to brand and reposition.  
- Smooth, jank-free animations with no layout shifts.  
- Testable core (pure reducer) and behavior-level tests.

### Key Decisions
- **Context + Portal**: A single `ToastProvider` exposes an API; the visual stack is rendered in a portal attached to the document body to avoid layout/overflow issues.  
- **Reducer-driven State**: A pure reducer handles **ADD**, **DISMISS**, **REMOVE**, enabling deterministic unit tests and predictable updates.  
- **Styling with CSS Variables**: Default theme lives in a dedicated stylesheet; apps override tokens to rebrand without touching components.  
- **Performance First**: Fixed viewport, minimal re-renders, short transitions, and reduced-motion support.

## What’s Included (mapped to tasks)

### Core Functionality
- Global provider with a simple API to create and dismiss toasts.  
- Stacking with a configurable maximum; oldest items trimmed automatically.  
- Auto-dismiss with per-toast or global duration; manual close always available.

### Theming & Customization
- Theme tokens (colors, radius, shadow) via CSS variables.  
- Configurable position (e.g., bottom-right, top-center).  
- Optional icon and action button per toast.  
- Global defaults overridable via provider configuration.

### Animation & Performance
- CSS transitions for enter/exit (≤ 200ms by default).  
- No content shift: fixed viewport avoids CLS.  
- Scoped updates so only affected toasts re-render.

### Accessibility
- Live region container; assertive announcements for errors.  
- Focusable toasts; Escape to dismiss; labeled close button.  
- Honors reduced-motion user preference.

### Testing & QA
- Unit tests for the reducer (add/trim, dismiss, remove).  
- Behavior tests for stacking, timers, hover-pause, click/Escape dismissal, actions, and a11y attributes.  
- Coverage command included.

## Setup Instructions

### Prerequisites
- Node.js and npm installed.

### Install
- From the project root, install dependencies using your package manager (e.g., `npm install`).

### Run (development)
- Start the dev server (e.g., `npm start`) and open the local URL shown in your terminal.

### Build (production)
- Create an optimized build (e.g., `npm run build`). Output will be in the **build** folder, suitable for static hosting.

## Usage (how to integrate)
- Wrap your application with the toast provider at the root.  
- Consume the toast API via the hook anywhere in your component tree.  
- Trigger success, error, warning, or info notifications; optionally provide an action button, custom duration, and callbacks.

## Theming & Customization
- Theme tokens live in the toast stylesheet (e.g., `src/styles/index.css`). Override variables (colors, radius, shadow) at the app level to rebrand.  
- Position is set through the provider configuration (e.g., bottom-right, top-center).  
- Behavior overrides include default duration, max stack size, pause on hover, and click-to-close.  
- Per-toast options allow icon, action button label/handler, and duration override (including “infinite”).

## Project Structure (high-level)
- `core/` — types, reducer, defaults  
- `provider/` — provider, context, portal  
- `components/` — viewport/list item components  
- `styles/` — toast stylesheet and theme tokens  
- `tests/` — reducer, behavior, and a11y/config specs  
- Demo app files (entry, app styles) for local development

## Testing Instructions
- Run tests in watch mode (e.g., `npm test`).  
- Generate coverage (e.g., `npm run coverage`) and inspect the output for lines/branches/functions.

**Tests cover:**
- Reducer: add/trim, dismiss, remove  
- Behavior: trigger variants, stacking, timers, pause on hover, close button, Escape, click-to-close (if enabled), action callback, `onDismiss`  
- A11y/config: live region attributes and position classes
