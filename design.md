# Implementation Plan: "Dark Modular" UI Refresh

This document outlines the specific files and components in the `frontend` directory that need to be edited to successfully implement the new **Dark Modular LMS** theme.

## 1. Global CSS & Theme Tokens
We need to strip out any existing Neo-Brutalist variables and replace them with the new dark palette and soft geometry.

**Files to Edit:**
*   `frontend/src/styles/variables.css`
    *   Change `--bg-base` to `#0D0D0D` (Deep Black).
    *   Change `--bg-surface` to `#202020` (Dark Gray).
    *   Change `--color-primary` and `--color-accent` to `#E54503` (Vibrant Orange).
    *   Change `--text-primary` to `#FFFFFF` and `--text-secondary` to a muted gray (e.g., `#A0A0A0`).
    *   Update border-radius variables: `--radius-md` to `16px`, `--radius-lg` to `24px`, and `--radius-pill` to `9999px`.
*   `frontend/src/styles/globals.css`
    *   Remove all hard drop shadows (e.g., `box-shadow: 4px 4px 0px #000`).
    *   Remove all 1px/2px solid black borders. Separation should rely strictly on the `background-color` shift between `--bg-base` and `--bg-surface`.
    *   Update the `body` font-family to **Poppins**.
    *   Ensure all `.btn` classes are pill-shaped (`border-radius: var(--radius-pill)`).

## 2. Common Components
**Files to Edit:**
*   `frontend/src/components/common/Navbar.jsx` (or Sidebar component):
    *   Convert to the new "Slim Sidebar" layout if possible, featuring perfect circle icons for navigation.
    *   Ensure the background is `#202020` resting on the `#0D0D0D` page background.
*   `frontend/src/components/common/Button.jsx` (or button CSS):
    *   Primary buttons must use the `#E54503` fill with bold white text.

## 3. Page Layouts & Specific Features

### A. Auth Pages
*   **Files:** `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`
*   **Changes:**
    *   Wrap the form in a large `#202020` container with a `32px` border radius.
    *   Change input fields to have a subtle `#2A2A2A` background with no borders and highly rounded corners.
    *   The main "Sign In" CTA must be the vibrant orange pill button.

### B. Marketplace Module
*   **Files:** `frontend/src/pages/Marketplace.jsx`, `frontend/src/components/marketplace/MarketplaceItemCard.jsx`
*   **Changes:**
    *   Convert the grid into **Bento Cells**. Each item card should have a `#202020` background.
    *   Use the vibrant orange `#E54503` specifically to highlight the Price tag.
    *   Category filters (e.g., "Electronics", "Textbooks") should become fully rounded pill tags.

### C. Lost & Found Module
*   **Files:** `frontend/src/pages/LostFound.jsx`, `frontend/src/components/lostfound/LostFoundList.jsx`
*   **Changes:**
    *   Items should be displayed as horizontal Bento cards (thumbnail on left, description in center, action on right).
    *   Use colored pill tags for status: Green for "Found", Red/Orange for "Lost".

### D. AI Notes Workspace
*   **Files:** `frontend/src/pages/Notes.jsx`, `frontend/src/pages/NoteDetail.jsx`
*   **Changes:**
    *   Implement the "Workspace Layout" (similar to the Video Player mockup).
    *   The main reading/chat area should be a massive `#202020` rounded container taking up 70% of the screen.
    *   The contextual right panel (for summaries, attachments) should be a vertical stack of smaller `#202020` cards.

## 4. Execution Steps
1.  **Step 1:** Download and install the **Poppins** font (or link via Google Fonts in `index.html`).
2.  **Step 2:** Overhaul `variables.css` and `globals.css` to set the dark mode foundation.
3.  **Step 3:** Systematically go through the `pages/` directory to remove any inline borders or harsh shadows and apply the new `border-radius` variables.
4.  **Step 4:** Refine the buttons and input components globally.
