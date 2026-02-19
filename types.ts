
export enum Region {
  GreaterManchester = 'Greater Manchester',
  WestYorkshire = 'West Yorkshire',
  StokeStaffordshire = 'Stoke & Staffordshire',
  Merseyside = 'Merseyside',
  TrustWide = 'Trust Wide'
}

export interface Academy {
  name: string;
  region: Region;
  logoUrl?: string;
}

export enum CPDStatus {
  Statutory = 'Statutory',
  Mandatory = 'Mandatory',
  Priority = 'Trust Priority',
  Optional = 'Optional'
}

export enum RoleCategory {
  Teacher = 'Teacher',
  SupportStaff = 'Support Staff',
  MiddleLeader = 'Middle Leader',
  SeniorLeader = 'Senior Leader',
  CentralTeam = 'Central Team',
  Specialist = 'Specialist',
  Other = 'Other'
}

export interface AudienceSelection {
  main: string;
  sub?: string;
  phase?: string;
  region?: string;
  detail?: string;
}

export interface Facilitator {
  name: string;
  email: string;
}

export type EventFormType = 'Online Asynchronous' | 'Online Live' | 'In-Person';

// New Framework Types
export interface FrameworkAlignment {
  learnStrategy: string;
  exploreStrategy: string;
  applyStrategy: string;
  eefMechanisms: string[]; // "Build Knowledge", "Motivate Staff", etc.
}

export interface FacilitatorFormData {
  id: string;
  courseId?: string; // Link to the original Course in the Catalogue
  proposalId?: string; // Link to the Stage 1 Proposal
  title: string;
  formType: EventFormType;
  subFormType?: string;
  subFormTypeOther?: string;
  description: string;
  learningOutcomes: string;
  trustCpdCategory: string;
  trustPriorities: string[];
  intendedAudience: AudienceSelection;
  
  // Framework Alignment
  frameworkAlignment?: FrameworkAlignment;

  // Logistics
  facilitators: Facilitator[];
  venue: string;
  
  // Date/Time Requirements
  dateRequirementType: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  specificDay?: string;
  timePreferenceReason?: string;
  
  date: string; // Preferred Date
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isRepeated: 'Single occurrence' | 'Repeated on multiple dates with same content';

  // Repeated Session Details
  repetitionFrequency?: string;
  repetitionPatternOther?: string;
  repeatCount?: number;
  repeatStartDate?: string;
  repeatEndDate?: string;
  repeatDayOfWeek?: string;
  repeatTerm?: string;
  repeatPreferredWeeks?: string;
  repeatCustomDates?: string;
  repeatTimeSpan?: string;
  isIdenticalContent?: boolean;
  identicalContentDetail?: string;
  isSameFacilitator?: boolean;
  isSameParticipants?: boolean;
  participantPatternDetail?: string;

  // Status Logic
  isStatutory: boolean;
  statutoryUrl?: string;
  isMandatory: boolean;
  mandatoryPolicyUrl?: string; // New field for mandatory policy proof
  isPriority: boolean;
  finalStatus: CPDStatus;

  // Registration & Capacity
  attendanceOption: string;
  capacity: number;
  isRequestOnly: boolean;
  
  // Legacy compatibility
  location: string;
  targetAudience: string[];
  timeSpan: string;
}

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  academy: string;
  role: RoleCategory;
  accessibilityNeeds: string;
  dietaryRequirements: string;
  eventId: string;
  registeredAt: string;
  status: 'Registered' | 'Requested' | 'Waitlisted';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  learningOutcomes: string;
  targetAudience: string[];
  trustCpdCategory: string;
  trustPriorities: string[];
  finalStatus: CPDStatus;
  isStatutory: boolean;
  isMandatory: boolean;
  isPriority: boolean;
  intendedAudience: AudienceSelection;
  createdAt?: string;
}

// --- NEW TYPES FOR 2-STAGE PROCESS ---

export type ProposalDecision = 'Pending' | 'Approved' | 'More Detail Required' | 'Declined';

export interface TriageScore {
  strategicAlignment: number;
  statusJustification: number;
  clarity: number;
  audience: number;
  addedValue: number;
  feasibility: number;
  impact: number;
  total: number;
}

export interface CPDProposal {
  id: string;
  submittedBy: {
    name: string;
    email: string;
    role: string;
    academy: string;
  };
  submittedAt: string;
  
  // Stage 1 Fields
  title: string;
  trustCpdCategory: string;
  description: string; // Max 100 words
  learningObjectives: string;
  targetAudience: {
    phase: string;
    roles: string;
  };
  proposedStatus: CPDStatus;
  intendedImpact: string;
  roughFormat: {
    type: string;
    duration: string;
    expectedNumbers: string;
  };
  dateWindow: string; // Earliest/Latest feasible dates
  additionalNotes: string;

  // Triage Data
  status: ProposalDecision;
  triageNotes?: string;
  triageScores?: TriageScore;
  confirmedStatus?: CPDStatus; // PDI may change status
  feedback?: string;
}

// User & Auth Types
export interface ActivityLog {
  action: string;
  timestamp: string;
}

export interface User {
  email: string;
  name: string;
  role: 'PDI' | 'Facilitator' | 'Colleague';
  academy?: string; // New field for user location
  // Permission & Activity extensions
  lastLogin?: string;
  accessibleTabs: string[]; // 'dashboard', 'facilitator', 'catalog', 'participant', 'users', 'proposals'
  canManageUsers: boolean;
  activities: ActivityLog[];
}
