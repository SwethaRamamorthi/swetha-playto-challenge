// Mock API for Swetha Ramamoorthi KYC Dashboard
// Simulates backend response times and business logic

const MOCK_DELAY = 600;

// State Machine Definitions
export const VALID_TRANSITIONS = {
  'draft': ['under_review'],
  'submitted': ['under_review'],
  'under_review': ['approved', 'rejected', 'more_info_requested'],
  'more_info_requested': ['under_review'],
  'approved': [],
  'rejected': ['under_review'] // Allow re-try if rejected? Depends on policy.
};

// Seed Data
let mockSubmissions = [
  {
    id: "SUB-SEED-01",
    owner: "merchant_a", // Seed Merchant 1
    merchantName: "Swetha's Boutique (Draft)",
    businessType: "Retail",
    status: "draft",
    submittedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expectedVolume: "0-50k",
    personalDetails: { name: "Merchant A", email: "a@swetha.com", phone: "1234567890" },
    documents: []
  },
  {
    id: "SUB-SEED-02",
    owner: "merchant_b", // Seed Merchant 2
    merchantName: "Ramamoorthi Logistics (Review)",
    businessType: "Software",
    status: "under_review",
    submittedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30h ago (SLA Risk)
    expectedVolume: "100k-500k",
    personalDetails: { name: "Merchant B", email: "b@swetha.com", phone: "0987654321" },
    documents: ["Aadhaar.pdf", "PAN.jpg"]
  }
];

// Helper: Auth Check
// Merchant A cannot see Merchant B's data
const authorizeSubmission = (submission, user) => {
  if (!user) throw new Error("Unauthorized");
  if (user.role === 'reviewer') return true; // Reviewers see everything
  if (submission.owner === user.id || submission.owner === user.name.toLowerCase().replace(' ', '_')) return true;
  throw new Error("Access Denied: You do not own this submission");
};

// Helper: State Transition Check
export const validateTransition = (current, next) => {
  if (current === next) return true;
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(`Illegal State Transition: Cannot move from ${current} to ${next}`);
  }
  return true;
};

export const fetchSubmissions = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockSubmissions];
      if (user.role === 'merchant') {
        const ownerId = user.name.toLowerCase().replace(' ', '_');
        filtered = filtered.filter(s => s.owner === ownerId);
      }
      // SLA logic: Sort oldest first for reviewer
      const sorted = filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      resolve(sorted);
    }, MOCK_DELAY);
  });
};

export const fetchSubmissionById = async (id, user) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sub = mockSubmissions.find(s => s.id === id);
      if (!sub) return reject(new Error("Submission not found"));
      try {
        authorizeSubmission(sub, user);
        resolve(sub);
      } catch (e) {
        reject(e);
      }
    }, MOCK_DELAY);
  });
};

export const submitKyc = async (data, user) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ownerId = user.name.toLowerCase().replace(' ', '_');
      const nextStatus = data.isDraft ? "draft" : "under_review";
      
      // If updating existing
      const existingIdx = mockSubmissions.findIndex(s => s.id === data.id);
      if (existingIdx > -1) {
        const existing = mockSubmissions[existingIdx];
        try {
          authorizeSubmission(existing, user);
          validateTransition(existing.status, nextStatus);
          mockSubmissions[existingIdx] = { ...existing, ...data, status: nextStatus, owner: ownerId };
          return resolve(mockSubmissions[existingIdx]);
        } catch (e) {
          return reject(e);
        }
      }

      const newSubmission = {
        ...data,
        id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        owner: ownerId,
        status: nextStatus,
        submittedAt: new Date().toISOString()
      };
      mockSubmissions.push(newSubmission);
      resolve(newSubmission);
    }, MOCK_DELAY);
  });
};

export const updateSubmissionStatus = async (id, nextStatus, user, reason = "") => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user.role !== 'reviewer') return reject(new Error("Only reviewers can update status"));
      
      const subIdx = mockSubmissions.findIndex(s => s.id === id);
      if (subIdx === -1) return reject(new Error("Submission not found"));
      
      const currentStatus = mockSubmissions[subIdx].status;
      try {
        validateTransition(currentStatus, nextStatus);
        mockSubmissions[subIdx] = { 
          ...mockSubmissions[subIdx], 
          status: nextStatus, 
          reviewerReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewerName: user.name
        };
        resolve({ success: true });
      } catch (e) {
        reject(e);
      }
    }, MOCK_DELAY);
  });
};
