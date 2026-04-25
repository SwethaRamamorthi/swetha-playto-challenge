# Technical Explanation - Swetha Ramamoorthi KYC Dashboard

This document provides specific answers to the technical implementation questions as required by the Playto Engineering Challenge.

---

### 1. The State Machine
**Location:** `src/services/mockApi.js`

The state machine is defined using a transition map that dictates which status can move to which next status.

```javascript
export const VALID_TRANSITIONS = {
  'draft': ['under_review'],
  'submitted': ['under_review'],
  'under_review': ['approved', 'rejected', 'more_info_requested'],
  'more_info_requested': ['under_review'],
  'approved': [],
  'rejected': ['under_review'] // Allow re-try if rejected
};

export const validateTransition = (current, next) => {
  if (current === next) return true;
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(`Illegal State Transition: Cannot move from ${current} to ${next}`);
  }
  return true;
};
```
**Prevention of illegal transitions:**
Every status update call (`submitKyc` or `updateSubmissionStatus`) invokes `validateTransition()`. If the requested state is not in the `VALID_TRANSITIONS` array for the current state, an Error is thrown, preventing the change in the underlying data.

---

### 2. The Upload
**Location:** `src/components/FileUpload.jsx`

File uploads are validated on the client-side before being processed or appended to the local state.

```javascript
const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Only PDF, JPG, and PNG are allowed.';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File is too large. Max size is ${MAX_SIZE_MB}MB.`;
  }
  return null;
};
```
**Handling 50 MB files:**
If a user tries to upload a 50 MB file, the `validateFile` function evaluates `file.size > 5 * 1024 * 1024`. It returns an error message, which is then displayed via an alert/error badge. The file is **not** added to the `files` state and is effectively blocked from being processed further.

---

### 3. The Queue
**Location:** `src/services/mockApi.js` & `src/pages/ReviewerDashboard.jsx`

The reviewer queue logic is powered by a sorting function in the service layer and an SLA flag calculated in the UI.

**Data Retrieval (Oldest First):**
```javascript
// src/services/mockApi.js
const sorted = filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
```

**SLA Flag Calculation:**
```javascript
// src/pages/ReviewerDashboard.jsx
const hours = getHoursDiff(sub.submittedAt);
const isAtRisk = (sub.status === 'under_review' || sub.status === 'submitted') && hours > 24;
```
**Rationale:**
I chose a client-side calculation for the SLA flag to ensure users see real-time "At Risk" warnings based on the current local time without needing a backend field that might get stale. Sorting oldest-first ensures reviewers tackle the most urgent applications first.

---

### 4. The Auth
**Location:** `src/services/mockApi.js`

System security is handled by an authorization check that compares the owner of the submission with the currently logged-in user.

```javascript
const authorizeSubmission = (submission, user) => {
  if (!user) throw new Error("Unauthorized");
  if (user.role === 'reviewer') return true; // Higher privilege
  
  const ownerId = user.name.toLowerCase().replace(' ', '_');
  if (submission.owner === ownerId) return true;
  
  throw new Error("Access Denied: You do not own this submission");
};
```
**Prevention:**
Whenever `fetchSubmissionById` or `submitKyc` (for updates) is called, `authorizeSubmission` is triggered. If Merchant A attempts to access an ID belonging to Merchant B, the IDs won't match, and the system throws an "Access Denied" error, preventing data leakage.
