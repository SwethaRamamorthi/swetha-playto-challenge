# Swetha Ramamoorthi KYC Dashboard - Playto Challenge

A modern, responsive KYC onboarding dashboard for merchants and reviewers.

## 🚀 Live Demo
[Vercel Deployment Link - To be updated after push]

## 🛠 Features
- **Merchant Side**: Multi-step KYC form with draft saving and document upload validation.
- **Reviewer Side**: Queue management with SLA tracking, metrics dashboard, and decision engine.
- **State Machine**: Robust transition logic to prevent illegal state changes.
- **Authentication**: Role-based access control with data ownership isolation.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SwethaRamamorthi/Playto-challenge.git
   cd Playto-challenge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
- Start the development server:
  ```bash
  npm run dev
  ```
- The app will be available at `http://localhost:5173`.

### Running Tests
- Execute the state machine tests:
  ```bash
  npm test
  ```

## 📂 Project Structure
- `src/components`: Reusable UI elements (Navbar, Sidebar, FileUpload, etc.)
- `src/pages`: Main application screens.
- `src/context`: Global state management.
- `src/services`: Mock API layer with seed data and business logic.
- `EXPLAINER.md`: Technical deep-dive into state management and security.

## 🧪 Seed Data
Upon first login:
- **Merchant A** will see a **Draft** application.
- **Merchant B** will see an **Under Review** application.
- **Reviewer** will see all submissions in the queue with SLA risks highlighted.
