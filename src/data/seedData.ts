import { DocumentItem, RolePreset, TimelineEvent, VectorChunk } from '../types';

export const SEED_ROLES: RolePreset[] = [
  {
    id: 'office',
    title: 'Office Staff',
    iconName: 'briefcase',
    category: 'Work & Ops',
    description: 'Track manager task assignments, action items, and project updates.',
    question: 'What tasks did my manager assign last Monday?',
    sampleAnswer: 'In Monday\'s team sync email (July 21, 10:15 AM), Sarah requested: 1) Update the Q3 slide deck with fresh revenue metrics, 2) Send the revised project Phoenix timeline to engineering lead, and 3) Review vendor quotes for cloud infrastructure by Thursday.',
    sampleSources: ['Email Thread: "Weekly Sync Items"', 'Project_Phoenix_Sync_Jul21.pdf']
  },
  {
    id: 'student',
    title: 'Student',
    iconName: 'graduation-cap',
    category: 'Academic',
    description: 'Summarize textbook chapters, lecture audio transcripts, and assignment deadlines.',
    question: 'Summarize everything about Chapter 5 in Biology.',
    sampleAnswer: 'Chapter 5 covers Cellular Respiration. Key takeaways: 1) Glycolysis yields 2 ATP in cytoplasm, 2) The Krebs Cycle occurs in the mitochondrial matrix producing NADH & FADH2, 3) The Electron Transport Chain generates ~32 ATP via chemiosmosis. Midterm emphasis is on ATP synthase regulators.',
    sampleSources: ['Bio_Textbook_Ch5_Cellular_Respiration.pdf', 'Bio_Lecture_Audio_Oct12.txt']
  },
  {
    id: 'lawyer',
    title: 'Lawyer / Legal',
    iconName: 'scale',
    category: 'Legal',
    description: 'Instantly find contract clauses, liability limits, and termination terms.',
    question: 'Find every contract mentioning termination clauses.',
    sampleAnswer: 'Found 3 contracts with active termination clauses: 1) Acme Corp Master Service Agreement (Clause 14.2: 30-day written notice without cause), 2) Global Tech Vendor Agreement (Clause 8.1: Immediate termination upon breach), 3) Commercial Lease Agreement (Clause 22: 60-day notice with penalty fee).',
    sampleSources: ['Acme_Corp_MSA_Final.pdf', 'GlobalTech_Vendor_Agreement.pdf', 'Commercial_Lease_2025.pdf']
  },
  {
    id: 'doctor',
    title: 'Doctor / Healthcare',
    iconName: 'stethoscope',
    category: 'Healthcare',
    description: 'Locate patient EHR histories, previous lab trends, and medical reports.',
    question: 'Show previous lab reports for patient John Doe.',
    sampleAnswer: 'John Doe (Patient ID: 4409) lab history: In March 2025, HbA1c was 6.2% (Prediabetic range). At the November 2025 follow-up, HbA1c improved to 5.8% after lifestyle intervention. Lipid panel and kidney function remain within normal limits.',
    sampleSources: ['EHR_Export_Doe_John_4409.pdf', 'Lab_Results_Nov2025.pdf']
  },
  {
    id: 'business',
    title: 'Business Owner',
    iconName: 'building-2',
    category: 'Business',
    description: 'Consolidate discussions, client quotes, change orders, and unpaid invoices.',
    question: 'Show every discussion related to Client ABC.',
    sampleAnswer: 'Client ABC timeline summary: Initial inquiry Jan 10 ($15,000 project quote), contract signed Feb 1, change order requested April 12 (+ $3,500 for custom API export). Total project value: $18,500 across 3 paid invoices.',
    sampleSources: ['Client_ABC_Contract_Feb2025.pdf', 'Invoice_INV-2025-089.pdf', 'Client_ABC_Email_Log.txt']
  },
  {
    id: 'family',
    title: 'Personal & Home',
    iconName: 'home',
    category: 'Home & Personal',
    description: 'Never lose passport scans, laptop receipts, warranty dates, or medical prescriptions.',
    question: 'Find the receipt for my laptop and passport scan location.',
    sampleAnswer: '1) Laptop Receipt: Purchased Apple MacBook Pro 16" on Nov 14, 2025 from Apple Store ($2,499.00). Warranty valid through Nov 14, 2027. 2) Passport Scan: Stored in document "Passport_Scan_2024.pdf" (Uploaded May 4, Expires Oct 2032).',
    sampleSources: ['Apple_Store_Receipt_Nov2025.pdf', 'Passport_Scan_2024.pdf', 'Geico_Auto_Policy_2026.pdf']
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-001',
    title: 'Project Phoenix Sync & Manager Action Items',
    filename: 'Project_Phoenix_Sync_Jul21.pdf',
    fileType: 'pdf',
    category: 'Work & Ops',
    tags: ['#Meeting', '#Client', '#Urgent', '#ManagerTasks', '#Phoenix'],
    chunkCount: 3,
    createdAt: '2026-07-21T10:15:00.000Z',
    sizeBytes: 428000,
    status: 'saved',
    authorOrRole: 'Sarah (Manager)',
    summary: 'Weekly team sync notes detailing Sarah\'s task assignments regarding Q3 slide deck updates, engineering handoff for Project Phoenix, and vendor quotes review.',
    rawText: `PROJECT PHOENIX - WEEKLY TEAM SYNC
Date: July 21, 2026
Attendees: Sarah Jenkins (Engineering Manager), Alex Rivera, David Kim

MANAGER ACTION ITEMS ASSIGNED BY SARAH:
1. Q3 Presentation Deck: Alex to update slides 4 through 9 with the finalized June revenue metrics and user retention numbers by Wednesday 5 PM.
2. Project Phoenix Handoff: David must send the revised API architecture document and release schedule directly to the engineering team leads.
3. Cloud Vendor Quotes Review: Alex to compare AWS, Google Cloud, and Azure quote proposals and prepare a cost comparison sheet before Thursday morning.

ADDITIONAL DECISIONS:
- Approved $4,500 budget allocation for staging environment load testing.
- Next sprint deadline moved to August 5 to allow thorough QA validation.`
  },
  {
    id: 'doc-002',
    title: 'Acme Corp Master Service Agreement (MSA)',
    filename: 'Acme_Corp_MSA_Final.pdf',
    fileType: 'pdf',
    category: 'Legal',
    tags: ['#Legal', '#Contract', '#Termination', '#AcmeCorp'],
    chunkCount: 4,
    createdAt: '2026-06-15T14:30:00.000Z',
    sizeBytes: 1250000,
    status: 'saved',
    authorOrRole: 'Legal Counsel',
    summary: 'Legal contract between Acme Corp and Provider including Clause 14.2 termination provisions requiring 30-day prior written notice.',
    rawText: `MASTER SERVICE AGREEMENT - ACME CORPORATION
Effective Date: June 15, 2026

SECTION 14: TERM AND TERMINATION
14.1 Term: This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months.
14.2 Termination for Convenience: Either party may terminate this Agreement without cause upon providing thirty (30) calendar days prior written notice to the other party.
14.3 Termination for Breach: In the event of a material breach, the non-breaching party may terminate immediately if such breach remains uncured for fifteen (15) business days following written notice.
14.4 Liability Limitation: Total liability under this agreement shall not exceed $100,000 USD.`
  },
  {
    id: 'doc-003',
    title: 'Apple Store Purchase Receipt - MacBook Pro 16"',
    filename: 'Apple_Store_Receipt_Nov2025.pdf',
    fileType: 'pdf',
    category: 'Home & Personal',
    tags: ['#Receipt', '#Invoice', '#Hardware', '#Warranty'],
    chunkCount: 2,
    createdAt: '2025-11-14T16:20:00.000Z',
    sizeBytes: 210000,
    status: 'saved',
    authorOrRole: 'Apple Store Online',
    summary: 'Receipt for MacBook Pro 16" purchase ($2,499.00) on Nov 14, 2025 with 2-year AppleCare+ coverage.',
    rawText: `APPLE STORE OFFICIAL RECEIPT
Order Number: W984201983
Date: November 14, 2025
Item Purchased: MacBook Pro 16-inch (M3 Max, 36GB RAM, 1TB SSD - Space Black)
Serial Number: C02G9012K392
Total Paid: $2,499.00 USD (Payment Method: Visa ending in 4812)
Warranty Status: Covered under AppleCare+ through November 14, 2027.
Return Policy: 14 days from date of purchase.`
  },
  {
    id: 'doc-004',
    title: 'Biology 201 - Chapter 5 Notes & Cellular Respiration',
    filename: 'Bio_Textbook_Ch5_Cellular_Respiration.txt',
    fileType: 'note',
    category: 'Academic',
    tags: ['#Academic', '#Biology', '#StudyGuide', '#Respiration'],
    chunkCount: 3,
    createdAt: '2026-05-10T09:00:00.000Z',
    sizeBytes: 310000,
    status: 'saved',
    authorOrRole: 'Student Notes',
    summary: 'Comprehensive study notes on Chapter 5 Cellular Respiration, Glycolysis, Krebs Cycle, and Electron Transport Chain.',
    rawText: `BIOLOGY 201: CHAPTER 5 - CELLULAR RESPIRATION & ATP SYNTHESIS
Overview of Metabolic Pathway:
1. Glycolysis:
   - Occurs in the cytoplasm.
   - Converts 1 glucose molecule into 2 pyruvate molecules.
   - Net yield: 2 ATP + 2 NADH. Does NOT require oxygen (anaerobic).

2. Krebs Cycle (Citric Acid Cycle):
   - Takes place in the mitochondrial matrix.
   - Pyruvate is converted to Acetyl-CoA.
   - Yields 2 ATP, 6 NADH, and 2 FADH2 per glucose molecule.

3. Electron Transport Chain & Oxidative Phosphorylation:
   - Occurs across the inner mitochondrial membrane.
   - Protons pumped create a proton gradient driving ATP Synthase.
   - Generates ~32 ATP. Oxygen acts as final electron acceptor yielding H2O.

Professor Warning: Midterm exam on May 28 will focus heavily on enzyme regulation in glycolysis (Phosphofructokinase).`
  },
  {
    id: 'doc-005',
    title: 'Patient EHR Export & Medical Lab History - John Doe',
    filename: 'EHR_Export_Doe_John_4409.pdf',
    fileType: 'pdf',
    category: 'Healthcare',
    tags: ['#Medical', '#PatientHistory', '#HbA1c', '#Labs'],
    chunkCount: 3,
    createdAt: '2025-11-20T11:00:00.000Z',
    sizeBytes: 540000,
    status: 'saved',
    authorOrRole: 'Dr. Marcus Vance, M.D.',
    summary: 'Patient John Doe medical summary tracking HbA1c reduction from 6.2% to 5.8% and overall metabolic health status.',
    rawText: `PATIENT MEDICAL RECORD & LABORATORY SUMMARY
Patient Name: Doe, John | DOB: 04/12/1982 | MRN: 4409
Attending Physician: Dr. Marcus Vance, M.D.

LABORATORY TREND ANALYSIS:
- March 15, 2025: HbA1c recorded at 6.2% (Prediabetes classification). Fasting Glucose: 112 mg/dL.
- November 18, 2025 Follow-Up: HbA1c reduced to 5.8% following dietary changes and daily 30-min walking routine. Fasting Glucose: 98 mg/dL.
- Lipid Profile (Nov 2025): Total Cholesterol 185 mg/dL, HDL 54 mg/dL, LDL 110 mg/dL, Triglycerides 125 mg/dL (All within normal ranges).
- Recommendation: Continue current diet plan. Recheck HbA1c in 6 months.`
  },
  {
    id: 'doc-006',
    title: 'Client ABC Engagement & Invoicing Summary',
    filename: 'Client_ABC_Engagement_Summary.eml',
    fileType: 'email',
    category: 'Business',
    tags: ['#ClientABC', '#Invoices', '#Proposal', '#Business'],
    chunkCount: 3,
    createdAt: '2026-04-12T15:45:00.000Z',
    sizeBytes: 180000,
    status: 'saved',
    authorOrRole: 'Finance & Sales Dept',
    summary: 'Email log and invoice breakdown for Client ABC totaling $18,500 across initial scope and April change request.',
    rawText: `CLIENT ABC - ACCOUNT TRANSACTION HISTORY & EMAILS
Account Representative: Elena Rostova

TIMELINE OF DISCUSSIONS:
- Jan 10, 2026: Initial project inquiry received for web portal development. Proposal sent for $15,000.
- Feb 1, 2026: Master contract signed. Deposit invoice INV-2026-012 paid ($7,500).
- April 12, 2026: Client requested Change Order #1 for automated custom CSV/JSON export module. Quote agreed at $3,500.
- May 30, 2026: Final milestone invoice INV-2026-089 paid ($11,000). Total project revenue: $18,500. All accounts cleared.`
  }
];

export const SEED_DOCUMENTS: DocumentItem[] = INITIAL_DOCUMENTS;

export const SEED_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    timestamp: '2026-07-21T10:15:00.000Z',
    docId: 'doc-001',
    title: 'Manager Task Assignment & Project Sync',
    category: 'Work & Ops',
    summary: 'Sarah assigned 3 key action items: Q3 slide update, engineering release schedule, and cloud vendor quotes.',
    tags: ['#Meeting', '#ManagerTasks'],
    fileType: 'pdf'
  },
  {
    id: 'tl-2',
    timestamp: '2026-06-15T14:30:00.000Z',
    docId: 'doc-002',
    title: 'Acme Corp Contract Execution',
    category: 'Legal',
    summary: 'Executed 12-month MSA with 30-day termination notice clause.',
    tags: ['#Contract', '#Legal'],
    fileType: 'pdf'
  },
  {
    id: 'tl-3',
    timestamp: '2026-05-10T09:00:00.000Z',
    docId: 'doc-004',
    title: 'Biology Chapter 5 Study Notes Added',
    category: 'Academic',
    summary: 'Cellular respiration notes indexed with focus on glycolysis and ATP synthesis regulators.',
    tags: ['#Academic', '#StudyGuide'],
    fileType: 'note'
  },
  {
    id: 'tl-4',
    timestamp: '2026-04-12T15:45:00.000Z',
    docId: 'doc-006',
    title: 'Client ABC Change Request & Invoicing',
    category: 'Business',
    summary: 'Logged $3,500 change request bringing total engagement to $18,500.',
    tags: ['#ClientABC', '#Invoices'],
    fileType: 'email'
  },
  {
    id: 'tl-5',
    timestamp: '2025-11-20T11:00:00.000Z',
    docId: 'doc-005',
    title: 'John Doe Lab Results Ingested',
    category: 'Healthcare',
    summary: 'HbA1c lowered to 5.8% from previous 6.2% reading.',
    tags: ['#Medical', '#HbA1c'],
    fileType: 'pdf'
  },
  {
    id: 'tl-6',
    timestamp: '2025-11-14T16:20:00.000Z',
    docId: 'doc-003',
    title: 'Laptop Receipt & Warranty Uploaded',
    category: 'Home & Personal',
    summary: 'Indexed MacBook Pro receipt ($2,499.00) with AppleCare+ active until Nov 2027.',
    tags: ['#Receipt', '#Warranty'],
    fileType: 'pdf'
  }
];

export const SEED_CHAT_MESSAGES = [
  {
    id: 'msg-seed-1',
    sender: 'user' as const,
    text: 'What tasks did my manager assign during the team call last Monday?',
    timestamp: '10:15 AM',
    roleTag: 'Office Staff',
  },
  {
    id: 'msg-seed-2',
    sender: 'ai' as const,
    text: 'Based on your meeting transcript (Jul 21, 2026), your manager Sarah assigned 3 tasks:\n\n1. Update Q3 presentation slides 4-9 with June revenue & retention metrics by Wednesday 5 PM.\n2. Handoff the revised Project Phoenix API architecture & release schedule to engineering leads.\n3. Review cloud vendor quotes (AWS, Google Cloud, Azure) and prepare a cost comparison by Thursday morning.',
    timestamp: '10:16 AM',
    citations: [
      {
        docId: 'doc-001',
        docTitle: 'Project Phoenix Sync & Manager Action Items',
        fileType: 'pdf' as const,
        snippet: 'MANAGER ACTION ITEMS ASSIGNED BY SARAH: 1. Q3 Presentation Deck... 2. Project Phoenix Handoff... 3. Cloud Vendor Quotes Review...',
        chunkIndex: 0,
        matchScore: 0.96,
      },
    ],
    status: 'done' as const,
  },
];
