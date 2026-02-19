
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FacilitatorForm from './components/FacilitatorForm';
import ParticipantPortal from './components/ParticipantPortal';
import Dashboard from './components/Dashboard';
import CourseCatalog from './components/CourseCatalog';
import AIChat from './components/AIChat';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import ProposalReview from './components/ProposalReview';
import FacilitatorHub from './components/FacilitatorHub';
import { FacilitatorFormData, Participant, CPDStatus, RoleCategory, Course, User, ActivityLog, CPDProposal, ProposalDecision, TriageScore } from './types';
import { SAMPLE_COURSES, PDI_TEAM_EMAILS, SUPER_ADMIN_EMAILS } from './constants';

// Initial events for the portal.
const INITIAL_EVENTS: FacilitatorFormData[] = [
  {
    id: '1',
    title: 'Annual Safeguarding Update 2026',
    formType: 'Online Live',
    subFormType: 'Conference / large event',
    description: 'Essential safeguarding updates aligned to KCSIE 2024. Required for all staff.',
    trustCpdCategory: 'Safeguarding and Pupil Wellbeing',
    date: '2026-06-12',
    timeSpan: '09:00–12:00',
    startTime: '09:00', // legacy
    endTime: '12:00', // legacy
    venue: 'Co-op Academy Manchester',
    location: 'Co-op Academy Manchester', // legacy
    facilitators: [{ name: 'Trust Safeguarding Lead', email: 'safeguarding@coop.co.uk' }],
    targetAudience: ['All Staff'],
    isStatutory: true,
    statutoryUrl: 'https://www.gov.uk/government/publications/keeping-children-safe-in-education--2',
    isMandatory: false,
    isPriority: false,
    finalStatus: CPDStatus.Statutory,
    learningOutcomes: 'Understand new KCSIE updates',
    capacity: 100,
    attendanceOption: 'open',
    isRequestOnly: false,
    trustPriorities: ['Safeguarding and pupil wellbeing'],
    intendedAudience: { main: 'Whole-staff / mixed roles' },
    dateRequirementType: 'My CPD/Event must happen on a specific day:',
    isRepeated: 'Single occurrence'
  },
  {
    id: '2',
    title: 'Phonics Rollout: Phase 2',
    formType: 'In-Person',
    subFormType: 'Network meeting',
    description: 'Specialist training for Primary staff on the new trust-wide phonics approach.',
    trustCpdCategory: 'Primary and EYFS Networks',
    date: '2026-03-15',
    timeSpan: '13:00–15:30',
    startTime: '13:00',
    endTime: '15:30',
    venue: 'West Yorkshire Hub',
    location: 'West Yorkshire Hub',
    facilitators: [{ name: 'Primary Director', email: 'primary@coop.co.uk' }],
    targetAudience: ['Primary Teachers'],
    isStatutory: false,
    isMandatory: true,
    isPriority: false,
    finalStatus: CPDStatus.Mandatory,
    learningOutcomes: 'Apply Phase 2 phonics',
    capacity: 30, 
    attendanceOption: 'open',
    isRequestOnly: false,
    trustPriorities: ['Raising attainment and curriculum excellence'],
    intendedAudience: { main: 'Teachers', sub: 'Classroom teachers', phase: 'Primary', region: 'West Yorkshire' },
    dateRequirementType: 'I am flexible, and the CPD/Event can take place within a general time period:',
    isRepeated: 'Single occurrence'
  },
  {
    id: '3',
    title: 'Secondary Science Moderation: Biology',
    formType: 'In-Person',
    subFormType: 'Network meeting',
    description: 'Cross-trust moderation of Year 11 Biology mock exams to ensure consistency in marking and feedback. Please bring a sample of high, medium, and low scripts.',
    trustCpdCategory: 'Curriculum and Subject Networks',
    date: '2026-04-22',
    timeSpan: '13:00–16:00',
    startTime: '13:00',
    endTime: '16:00',
    venue: 'Co-op Academy Leeds',
    location: 'Co-op Academy Leeds',
    facilitators: [{ name: 'Science Director', email: 'science@coop.co.uk' }],
    targetAudience: ['Secondary Teachers', 'Middle Leaders'],
    isStatutory: false,
    isMandatory: false,
    isPriority: true,
    finalStatus: CPDStatus.Priority,
    learningOutcomes: 'Accurate assessment of student work',
    capacity: 40,
    attendanceOption: 'defined',
    isRequestOnly: true,
    trustPriorities: ['Raising attainment and curriculum excellence'],
    intendedAudience: { main: 'Teachers', sub: 'Classroom teachers', phase: 'Secondary', region: 'West Yorkshire' },
    dateRequirementType: 'My CPD/Event must happen during the school day',
    isRepeated: 'Single occurrence'
  },
  {
    id: '4',
    title: 'New Staff Culture Induction',
    formType: 'Online Live',
    subFormType: 'Conference / large event',
    description: 'Welcome event for all new colleagues joining the Trust, covering our values, history, and strategic plan. An opportunity to meet the CEO and executive team.',
    trustCpdCategory: 'Culture, Values, and Engagement',
    date: '2026-09-15',
    timeSpan: '16:00–17:30',
    startTime: '16:00',
    endTime: '17:30',
    venue: 'Online (Google Meet)',
    location: 'Online',
    facilitators: [{ name: 'CEO Team', email: 'ceo@coop.co.uk' }],
    targetAudience: ['All Staff'],
    isStatutory: false,
    isMandatory: true,
    isPriority: true,
    finalStatus: CPDStatus.Mandatory,
    learningOutcomes: 'Align with Trust values and vision',
    capacity: 500,
    attendanceOption: 'open',
    isRequestOnly: false,
    trustPriorities: ['Trust culture, identity and community engagement'],
    intendedAudience: { main: 'All Staff' },
    dateRequirementType: 'My CPD/Event can be a twilight session',
    isRepeated: 'Single occurrence'
  }
];

const INITIAL_REGISTRATIONS: Participant[] = [
  {
    id: '101',
    fullName: 'Jane Doe',
    email: 'jane.doe@coop.co.uk',
    academy: 'Co-op Academy Manchester',
    role: RoleCategory.Teacher,
    accessibilityNeeds: 'None',
    dietaryRequirements: 'None',
    eventId: '2',
    registeredAt: '2026-01-10',
    status: 'Registered'
  },
  {
    id: '102',
    fullName: 'John Smith',
    email: 'john.smith@coop.co.uk',
    academy: 'Co-op Academy Leeds',
    role: RoleCategory.Teacher,
    accessibilityNeeds: 'None',
    dietaryRequirements: 'Vegetarian',
    eventId: '3',
    registeredAt: '2026-02-15',
    status: 'Requested'
  },
  {
    id: '103',
    fullName: 'Sarah Connor',
    email: 'sarah.connor@coop.co.uk',
    academy: 'Co-op Academy Belle Vue',
    role: RoleCategory.SupportStaff,
    accessibilityNeeds: 'None',
    dietaryRequirements: 'None',
    eventId: '1',
    registeredAt: '2026-03-01',
    status: 'Registered'
  }
];

const INITIAL_PROPOSALS: CPDProposal[] = [
    {
        id: 'prop-1',
        submittedBy: { name: 'Regular Facilitator', email: 'regular.facilitator@coopacademies.co.uk', role: 'Facilitator', academy: 'Co-op Academy Manchester' },
        submittedAt: new Date().toISOString(),
        title: 'Middle Leader Coaching',
        trustCpdCategory: 'Leadership and Professional Practice',
        description: 'A 3-part series on coaching conversations for new middle leaders.',
        learningObjectives: 'Effective feedback, GROW model, holding to account.',
        targetAudience: { phase: 'Secondary', roles: 'Middle Leaders' },
        proposedStatus: CPDStatus.Priority,
        intendedImpact: 'Better line management conversations.',
        roughFormat: { type: 'In-Person', duration: '3 x 2hrs', expectedNumbers: 'Medium (21-60)' },
        dateWindow: 'Autumn Term',
        additionalNotes: '',
        status: 'Pending'
    }
];

// Helper to format names from emails if not provided
const nameFromEmail = (email: string) => {
    const parts = email.split('@')[0].split('.');
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
};

const BASE_USERS: User[] = [
  {
    email: 'andy.gibson@coopacademies.co.uk',
    name: 'Andy Gibson',
    role: 'PDI',
    academy: 'Central Team',
    lastLogin: new Date().toISOString(),
    accessibleTabs: ['dashboard', 'facilitator', 'catalog', 'participant', 'users', 'proposals'],
    canManageUsers: true,
    activities: [{ action: 'System Initialized', timestamp: new Date().toISOString() }]
  },
  {
    email: 'rose.harford@coopacademies.co.uk',
    name: 'Rose Harford',
    role: 'PDI',
    academy: 'Central Team',
    lastLogin: new Date().toISOString(),
    accessibleTabs: ['dashboard', 'facilitator', 'catalog', 'participant', 'users', 'proposals'],
    canManageUsers: true,
    activities: []
  },
  {
    email: 'michelle.peavoy@coopacademies.co.uk',
    name: 'Michelle Peavoy',
    role: 'PDI',
    academy: 'Central Team',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    accessibleTabs: ['dashboard', 'facilitator', 'catalog', 'participant', 'proposals'],
    canManageUsers: false,
    activities: []
  },
  {
    email: 'regular.facilitator@coopacademies.co.uk',
    name: 'Regular Facilitator',
    role: 'Facilitator',
    academy: 'Co-op Academy Manchester',
    lastLogin: new Date(Date.now() - 10000000).toISOString(),
    accessibleTabs: ['facilitator', 'catalog', 'participant'],
    canManageUsers: false,
    activities: []
  }
];

// Generate User objects for all PDI emails not explicitly in BASE_USERS
const ALL_PDI_USERS: User[] = PDI_TEAM_EMAILS.reduce((acc, email) => {
    const exists = acc.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
        acc.push({
            email: email.toLowerCase(),
            name: nameFromEmail(email),
            role: 'PDI',
            academy: 'Central Team',
            accessibleTabs: ['dashboard', 'facilitator', 'catalog', 'participant', 'proposals'],
            canManageUsers: false,
            activities: []
        });
    }
    return acc;
}, [...BASE_USERS]);


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_PDI_USERS);
  const [allowedFacilitators, setAllowedFacilitators] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState('participant');
  const [events, setEvents] = useState<FacilitatorFormData[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<Participant[]>(INITIAL_REGISTRATIONS);
  const [proposals, setProposals] = useState<CPDProposal[]>(INITIAL_PROPOSALS);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // State for "Stage 2" flow
  const [formTemplate, setFormTemplate] = useState<Partial<FacilitatorFormData> | null>(null);
  const [showFacilitatorForm, setShowFacilitatorForm] = useState(false); // Toggle between Hub and Form

  const [courses, setCourses] = useState<Course[]>(() => 
    SAMPLE_COURSES.map((c, i) => ({
      ...c,
      id: `sample-${i}`,
      createdAt: new Date(Date.now() - 10000000 * i).toISOString(), 
      targetAudience: c.targetAudience.map(t => t.toString())
    }))
  );

  // Helper to log activity
  const logActivity = (userEmail: string, action: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.email === userEmail) {
        return {
          ...u,
          activities: [{ action, timestamp: new Date().toISOString() }, ...u.activities].slice(0, 10) // keep last 10
        };
      }
      return u;
    }));
  };

  const handleLogin = (loginDetails: { email: string; name: string; role: 'PDI' | 'Facilitator' | 'Colleague' }) => {
    const existingUser = allUsers.find(u => u.email === loginDetails.email);
    let currentUser: User;

    if (existingUser) {
        // Update login time
        const updatedUser = { 
            ...existingUser, 
            lastLogin: new Date().toISOString()
        };
        // Update DB
        setAllUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
        currentUser = updatedUser;
    } else {
        // Create new user in DB (First time login)
        let tabs = ['participant'];
        let canManage = false;

        // Default permissions based on Role derivation from Login.tsx
        if (loginDetails.role === 'PDI') {
            tabs = ['dashboard', 'facilitator', 'catalog', 'participant', 'proposals'];
            if (SUPER_ADMIN_EMAILS.includes(loginDetails.email.toLowerCase())) {
                tabs.push('users');
                canManage = true;
            }
        } else if (loginDetails.role === 'Facilitator') {
            tabs = ['facilitator', 'catalog', 'participant'];
        }

        const newUser: User = {
            ...loginDetails,
            academy: 'Central Team', // Default
            accessibleTabs: tabs,
            canManageUsers: canManage,
            activities: [{ action: 'Account Created', timestamp: new Date().toISOString() }],
            lastLogin: new Date().toISOString()
        };

        setAllUsers(prev => [...prev, newUser]);
        currentUser = newUser;
    }

    logActivity(currentUser.email, 'Logged In');
    setUser(currentUser);
    
    // Redirect logic
    if (currentUser.role === 'PDI') {
        setActiveTab('dashboard');
    } else if (currentUser.role === 'Facilitator') {
        setActiveTab('facilitator');
    } else {
        setActiveTab('participant');
    }
  };

  const handleLogout = () => {
    if (user) logActivity(user.email, 'Logged Out');
    setUser(null);
    setActiveTab('participant');
    setShowFacilitatorForm(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
    logActivity(user!.email, `Updated user permissions for ${updatedUser.email}`);
  };

  const handleAddUser = (newUser: User) => {
      setAllUsers(prev => [...prev, newUser]);
      logActivity(user!.email, `Added new user: ${newUser.email}`);
  };

  const handleRemoveUser = (email: string) => {
      setAllUsers(prev => prev.filter(u => u.email !== email));
      logActivity(user!.email, `Removed user: ${email}`);
  };

  const handleUploadFacilitators = (emails: string[]) => {
    const uniqueEmails = Array.from(new Set([...allowedFacilitators, ...emails.map(e => e.toLowerCase())]));
    setAllowedFacilitators(uniqueEmails);
    logActivity(user!.email, `Uploaded ${emails.length} new facilitators`);
  };

  const handleCreateEvent = (data: FacilitatorFormData) => {
    const newEvent = { ...data, id: Date.now().toString() };
    setEvents([...events, newEvent]);
    logActivity(user!.email, `Created event: ${data.title}`);
    alert("Event Published Successfully! Moving to Registration view.");
    setShowFacilitatorForm(false); // Return to Hub
    setFormTemplate(null);
    setActiveTab('participant');
  };

  // --- Proposal Workflow Handlers ---

  const handleSubmitProposal = (proposalData: Omit<CPDProposal, 'id' | 'status' | 'submittedAt'>) => {
      const newProposal: CPDProposal = {
          ...proposalData,
          id: `prop-${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: 'Pending'
      };
      setProposals([...proposals, newProposal]);
      logActivity(user!.email, `Submitted Proposal: ${proposalData.title}`);
      // Send mock email to PDI
      console.log(`[EMAIL] To: pdi@coopacademies.co.uk | Subject: New CPD Proposal | Body: ${proposalData.title} by ${user!.name}`);
  };

  const handleTriageProposal = (proposalId: string, decision: ProposalDecision, scores: TriageScore, notes: string, confirmedStatus: CPDStatus) => {
      setProposals(prev => prev.map(p => {
          if (p.id === proposalId) {
              return {
                  ...p,
                  status: decision,
                  triageScores: scores,
                  feedback: notes,
                  confirmedStatus: confirmedStatus
              };
          }
          return p;
      }));
      logActivity(user!.email, `Triaged Proposal ${proposalId} as ${decision}`);
      // Send mock email to Facilitator
      console.log(`[EMAIL] To: Facilitator | Subject: CPD Proposal Update - ${decision} | Body: Feedback: ${notes}`);
  };

  const handleStartStage2 = (proposal: CPDProposal) => {
      // Map Proposal data to FacilitatorForm data
      const template: Partial<FacilitatorFormData> = {
          proposalId: proposal.id,
          title: proposal.title,
          trustCpdCategory: proposal.trustCpdCategory,
          description: proposal.description,
          learningOutcomes: proposal.learningObjectives,
          intendedAudience: { main: proposal.targetAudience.phase }, // Approximate mapping
          finalStatus: proposal.confirmedStatus || proposal.proposedStatus,
          isStatutory: (proposal.confirmedStatus || proposal.proposedStatus) === CPDStatus.Statutory,
          isMandatory: (proposal.confirmedStatus || proposal.proposedStatus) === CPDStatus.Mandatory,
          isPriority: (proposal.confirmedStatus || proposal.proposedStatus) === CPDStatus.Priority,
          // Could map more fields if structure matched perfectly
      };
      setFormTemplate(template);
      setShowFacilitatorForm(true);
  };

  // Legacy Course Handlers
  const handleAddCourse = (newCourse: Course) => setCourses([newCourse, ...courses]);
  const handleUpdateCourse = (updatedCourse: Course) => setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  
  // Direct schedule from Catalogue (Admin shortcut)
  const handleScheduleFromCatalog = (template: Partial<FacilitatorFormData>) => {
    setFormTemplate({ ...template, courseId: (template as any).id, id: undefined });
    setActiveTab('facilitator');
    setShowFacilitatorForm(true);
  };

  const handleRegister = (eventId: string, details: any, status: 'Registered' | 'Requested' | 'Waitlisted') => {
    const newReg: Participant = {
      id: Date.now().toString(),
      eventId,
      registeredAt: new Date().toISOString().split('T')[0],
      status,
      ...details
    };
    setRegistrations([...registrations, newReg]);
    if (user) logActivity(user.email, `Registered for event ID ${eventId}`);
  };

  if (!user) {
    return <Login onLogin={handleLogin} allowedFacilitators={allowedFacilitators} />;
  }

  const hasAccess = (tab: string) => user.accessibleTabs.includes(tab);

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => { setActiveTab(tab); setShowFacilitatorForm(false); }}
      toggleChat={() => setIsChatOpen(!isChatOpen)}
      user={user}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && hasAccess('dashboard') && (
        <Dashboard events={events} registrations={registrations} onUploadFacilitators={handleUploadFacilitators}/>
      )}
      
      {activeTab === 'proposals' && hasAccess('proposals') && (
        <ProposalReview proposals={proposals} onTriage={handleTriageProposal} />
      )}

      {activeTab === 'catalog' && hasAccess('catalog') && (
        <CourseCatalog 
          courses={courses}
          currentUser={user}
          onScheduleCourse={handleScheduleFromCatalog} 
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
          onSubmitProposal={handleSubmitProposal}
        />
      )}
      
      {activeTab === 'facilitator' && hasAccess('facilitator') && (
        showFacilitatorForm ? (
            <FacilitatorForm onSubmit={handleCreateEvent} initialData={formTemplate} />
        ) : (
            <FacilitatorHub 
                proposals={proposals.filter(p => p.submittedBy.email === user.email)} 
                onStartStage2={handleStartStage2}
                onCreateNew={() => setActiveTab('catalog')} // Redirect to Catalogue to create new proposal
            />
        )
      )}

      {activeTab === 'users' && hasAccess('users') && (
        <UserManagement currentUser={user} allUsers={allUsers} onUpdateUser={handleUpdateUser} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} />
      )}

      {activeTab === 'participant' && (
        <ParticipantPortal events={events} registrations={registrations} onRegister={handleRegister} />
      )}

      {(!hasAccess(activeTab) && activeTab !== 'participant') && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
             <div className="bg-red-50 p-6 rounded-full mb-4"><span className="text-4xl">🚫</span></div>
             <h2 className="text-[20pt] font-bold text-coop-dark mb-2">Access Restricted</h2>
             <button onClick={() => setActiveTab('participant')} className="mt-6 text-coop-blue hover:underline font-bold">Return to Participant Portal</button>
          </div>
      )}

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Layout>
  );
};

export default App;
