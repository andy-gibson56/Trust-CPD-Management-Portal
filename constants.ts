
import { Region, Academy, RoleCategory, CPDStatus } from './types';

export const LOGO_URLS = [
  "https://ibb.co/0RrYZwYT", "https://ibb.co/W4CzKDnk", "https://ibb.co/gLhMkygd", "https://ibb.co/HDcJDdDf",
  "https://ibb.co/B5cxs2bM", "https://ibb.co/239MxqhR", "https://ibb.co/S4MxKfJf", "https://ibb.co/Ndx12N1W",
  "https://ibb.co/NdPZL8Hb", "https://ibb.co/k2FZVHRv", "https://ibb.co/FbFZs0Lx", "https://ibb.co/Wv9FHFLn",
  "https://ibb.co/YFV80y8F", "https://ibb.co/N2db9bcn", "https://ibb.co/RLNdh2B", "https://ibb.co/j9ZPTYMR",
  "https://ibb.co/d0jYH075", "https://ibb.co/0VWgpxQ0", "https://ibb.co/LDZTXCWL", "https://ibb.co/35xJXgdr",
  "https://ibb.co/rf6ZKYM4", "https://ibb.co/nNQDFF34", "https://ibb.co/kskMHBR2", "https://ibb.co/93n8jBFJ",
  "https://ibb.co/qM0KLcrF", "https://ibb.co/RkHZ03C2", "https://ibb.co/mVc4Km6W", "https://ibb.co/RpZhc97b",
  "https://ibb.co/YF34d3nN", "https://ibb.co/gMjKcVhw", "https://ibb.co/QFJ463vS", "https://ibb.co/Ng95RdN2",
  "https://ibb.co/4nrDBYn3", "https://ibb.co/qFgWVK7H", "https://ibb.co/Q7xJdgSH", "https://ibb.co/7JQgRS15",
  "https://ibb.co/m5SQDXbB", "https://ibb.co/NnN5Nbgr", "https://ibb.co/fYjCH3Dt", "https://ibb.co/WYKqT1N",
  "https://ibb.co/ynmVtvDz", "https://ibb.co/bgT4PG08", "https://ibb.co/nNfWmZD0", "https://ibb.co/0RpgBtPh",
  "https://ibb.co/q3F2c3g7", "https://ibb.co/mF6Z1pG4", "https://ibb.co/nq2f42Nr", "https://ibb.co/pvsyGdGk",
  "https://ibb.co/bjd37X0M", "https://ibb.co/hRBDGgRr", "https://ibb.co/zW8cFYK6", "https://ibb.co/ZRZPLLc5",
  "https://ibb.co/nMKy8VKn", "https://ibb.co/j93dhjHJ", "https://ibb.co/zVnLRDWS", "https://ibb.co/k61qBjdX",
  "https://ibb.co/Xkb4tWCF", "https://ibb.co/Ngc7dnVd", "https://ibb.co/60fyRCxf", "https://ibb.co/Y7VFc7bX",
  "https://ibb.co/bjd4Sg2q", "https://ibb.co/Y4YGdcZC", "https://ibb.co/FqJJrSCr", "https://ibb.co/JjrKQfXs",
  "https://ibb.co/TB8bQ5q6", "https://ibb.co/JF2XVMHB", "https://ibb.co/qY1qL0Fz", "https://ibb.co/ksmwm5G9",
  "https://ibb.co/jknT5rZJ", "https://ibb.co/7JFRm1p6", "https://ibb.co/gFcMxPmy", "https://ibb.co/4n1KyPw6"
];

export const TRUST_LOGO = "https://i.ibb.co/h0BzNBX/Trust-White-01.png";
export const PDI_LOGO = "https://i.ibb.co/FjzYR0G/PDI.png";

// PDI Team Emails - Hardcoded Access List
export const PDI_TEAM_EMAILS = [
  "andy.gibson@coopacademies.co.uk",
  "alesha.oyewumi@coopacademies.co.uk",
  "claire.norcott@coopacademies.co.uk",
  "michelle.peavoy@coopacademies.co.uk",
  "rose.harford@coopacademies.co.uk",
  "suzanne.oakes@coopacademies.co.uk",
  "pdi@coopacademies.co.uk" // Fallback for dev/demo
];

export const SUPER_ADMIN_EMAILS = [
  "andy.gibson@coopacademies.co.uk",
  "rose.harford@coopacademies.co.uk"
];

export const EEF_MECHANISMS = [
  {
    category: "A. Build Knowledge",
    items: ["Managing cognitive load", "Revisiting prior learning"]
  },
  {
    category: "B. Motivate Staff",
    items: ["Setting and agreeing on goals", "Presenting info from credible source", "Providing affirmation/reinforcement"]
  },
  {
    category: "C. Develop Teaching Techniques",
    items: ["Instruction", "Social support", "Modelling", "Monitoring and feedback", "Rehearsal"]
  },
  {
    category: "D. Embed Practice",
    items: ["Prompts and cues", "Action planning", "Encouraging monitoring", "Context specific repetition"]
  }
];

export const ACADEMIES: Academy[] = [
  // Greater Manchester
  { name: "Co-op Academy Belle Vue", region: Region.GreaterManchester },
  { name: "Co-op Academy Broadhurst", region: Region.GreaterManchester },
  { name: "Co-op Academy Failsworth", region: Region.GreaterManchester },
  { name: "Co-op Academy Manchester", region: Region.GreaterManchester },
  { name: "Co-op Academy Medlock", region: Region.GreaterManchester },
  { name: "Co-op Academy New Islington", region: Region.GreaterManchester },
  { name: "Co-op Academy North Manchester", region: Region.GreaterManchester },
  { name: "Co-op Academy Swinton", region: Region.GreaterManchester },
  { name: "Co-op Academy Walkden", region: Region.GreaterManchester },
  { name: "Connell Co-op College", region: Region.GreaterManchester },

  // West Yorkshire
  { name: "Co-op Academy Beckfield", region: Region.WestYorkshire },
  { name: "Co-op Academy Brierley", region: Region.WestYorkshire }, 
  { name: "Co-op Academy Delius", region: Region.WestYorkshire },
  { name: "Co-op Academy Grange", region: Region.WestYorkshire },
  { name: "Co-op Academy Leeds", region: Region.WestYorkshire },
  { name: "Co-op Academy Nightingale",region: Region.WestYorkshire }, 
  { name: "Co-op Academy Parkland", region: Region.WestYorkshire }, 
  { name: "Co-op Academy Penny Oaks", region: Region.WestYorkshire },
  { name: "Co-op Academy Priesthorpe", region: Region.WestYorkshire },
  { name: "Co-op Academy Princeville", region: Region.WestYorkshire },
  { name: "Co-op Academy Smithies Moor", region: Region.WestYorkshire },
  { name: "Co-op Academy Southfield", region: Region.WestYorkshire },
  { name: "Co-op Academy Woodlands", region: Region.WestYorkshire },
  { name: "Co-op Academy Brownhill", region: Region.WestYorkshire },
  { name: "Co-op Academy Oakwood", region: Region.WestYorkshire },

  // Stoke & Staffordshire
  { name: "Co-op Academy Clarice Cliff", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Friarswood", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Glebe", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Hamilton", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Northwood", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Stoke", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Grove", region: Region.StokeStaffordshire },
  { name: "Co-op Academy Florence MacWilliams", region: Region.StokeStaffordshire },

  // Merseyside
  { name: "Co-op Academy Bebington", region: Region.Merseyside },
  { name: "Co-op Academy Portland", region: Region.Merseyside },
  { name: "Co-op Academy Rathbone", region: Region.Merseyside }, 
  { name: "Co-op Academy Hillside", region: Region.Merseyside }, 
  { name: "Co-op Academy Woodslee", region: Region.Merseyside },
];

export const VENUES = [
  "One Angel Square",
  "West Yorkshire Hub",
  "Rochdale Pioneer Museum",
  ...ACADEMIES.map(a => a.name).sort()
];

export const EVENT_SUB_TYPES = [
  "Network meeting",
  "CPD Seminar",
  "External provider session",
  "Conference / large event",
  "Out of Trust Visit"
];

export const LOCATIONS = VENUES; // Keep for legacy if needed

export const ROLE_CATEGORIES = Object.values(RoleCategory);

export const TRUST_PRIORITIES = [
  "Raising attainment and curriculum excellence",
  "Strengthening teaching, learning and assessment",
  "Inclusion, SEND and equity",
  "Safeguarding and pupil wellbeing",
  "Attendance and behaviour",
  "Leadership development and talent pipeline",
  "Digital, data and operational effectiveness",
  "Trust culture, identity and community engagement"
];

export const TRUST_CPD_CATEGORIES = [
  {
    name: "Externally Facing Events",
    color: "bg-red-500",
    textColor: "text-white",
    border: "border-red-600",
    detail: "Events designed for participants primarily from outside the Co\u2011op Academies Trust (e.g. trainees from partner SCITTs, external schools, other MATs, local authorities, prospective staff or university partners) or public-facing recruitment and engagement activities that showcase the Trust's offer and strengthen partnerships with the wider education community and stakeholders."
  },
  {
    name: "Leadership and Professional Practice",
    color: "bg-pink-500",
    textColor: "text-white",
    border: "border-pink-600",
    detail: "CPD for current and aspiring leaders and specialists that develops leadership skills, strategic thinking and professional behaviours, including middle leadership programmes, subject leadership (e.g. Developing Leaders in Science), attendance leadership and training-the-trainer offers."
  },
  {
    name: "Safeguarding and Pupil Wellbeing",
    color: "bg-orange-500",
    textColor: "text-white",
    border: "border-orange-600",
    detail: "Training that ensures colleagues understand and meet statutory safeguarding duties and promote wellbeing, including DSL induction and networks, safer recruitment, safer working practice, managing allegations, mental health first aid and related safeguarding updates."
  },
  {
    name: "SEND and Inclusion",
    color: "bg-yellow-400",
    textColor: "text-gray-900",
    border: "border-yellow-500",
    detail: "Sessions that build colleagues’ capacity to identify, assess and support learners with SEND and additional needs, covering the SEND Code of Practice, SALT/SLCN, SEMH, neurodiversity, access arrangements, pupil passports and inclusive classroom strategies"
  },
  {
    name: "IT, Data, Compliance, and Operations",
    color: "bg-[#33b679]", // Mint
    textColor: "text-gray-900",
    border: "border-emerald-400",
    detail: "Training focused on legal compliance, data protection, information governance and operational risk, including Data Protection Ambassador pathways, safer data handling, working with external agencies, operational safeguarding records and specialist certifications such as food hygiene."
  },
  {
    name: "Teaching, Learning and Assessment",
    color: "bg-[#0b8043]", // Green
    textColor: "text-white",
    border: "border-green-700",
    detail: "Evidence-informed pedagogy sessions open to a wide range of staff (e.g. Teach Like a Champion, explicit instruction, questioning, behaviour principles, assessment and feedback) that enhance everyday classroom practice, planning, modelling and checking for understanding."
  },
  {
    name: "Behaviour & Attendance",
    color: "bg-[#00a1cc]", // Co-op Blue
    textColor: "text-gray-900",
    border: "border-cyan-500",
    detail: "Training focused on improving student behaviour, attendance strategies, and fostering a positive school culture, including attendance leadership networks and behaviour management techniques."
  },
  {
    name: "Curriculum and Subject Networks",
    color: "bg-blue-600",
    textColor: "text-white",
    border: "border-blue-700",
    detail: "Regular subject-based network meetings, working parties and conferences (e.g. Maths, English, Science, Humanities, PE, Arts) that focus on curriculum design, subject knowledge, assessment, moderation, exam analysis and sharing effective departmental practice across academies."
  },
  {
    name: "Primary and EYFS Networks",
    color: "bg-indigo-600",
    textColor: "text-white",
    border: "border-indigo-700",
    detail: "Phase-specific networks and CPD for Primary and Early Years practitioners that address progression in primary subjects, EYFS practice, moderation, and whole-phase curriculum and pedagogy, often with a regional or locality focus to support collaboration between similar schools."
  },
  {
    name: "Culture, Values, and Engagement",
    color: "bg-purple-600",
    textColor: "text-white",
    border: "border-purple-700",
    detail: "Events that strengthen trust identity, values and community engagement, such as DEIB conferences, pastoral and personal development sessions, marketing and engagement training, recognition events and inclusion or social justice–focused conferences."
  },
  {
    name: "Initial Teacher Training (SCITT and ITaP)",
    color: "bg-gray-400",
    textColor: "text-white",
    border: "border-gray-500",
    detail: "Formal programmes and structured training days for trainee teachers (SCITT, PGCE, ITaP), focused on core pedagogy, behaviour, curriculum planning, assessment and professional conduct required for QTS and early classroom effectiveness."
  }
];

export const SAMPLE_COURSES = [
  {
    title: "Leading with Purpose: The Co\u2011op Way",
    description: "An intensive workshop for aspiring and current leaders focusing on ethical leadership, values-driven decision making, and team empowerment within the Co\u2011op Academies Trust framework.",
    targetAudience: [RoleCategory.MiddleLeader, RoleCategory.SeniorLeader],
    learningOutcomes: "Understand Co\u2011op leadership values, develop strategic thinking, improve team management skills.",
    trustCpdCategory: "Leadership and Professional Practice",
    finalStatus: CPDStatus.Priority,
    isPriority: true,
    isMandatory: false,
    isStatutory: false,
    trustPriorities: ["Leadership development and talent pipeline"],
    intendedAudience: { main: "Senior leaders", phase: "All phases" }
  },
  {
    title: "Adaptive Teaching for SEND",
    description: "Practical strategies for modifying curriculum and instruction to support students with Special Educational Needs and Disabilities in mainstream classrooms.",
    targetAudience: [RoleCategory.Teacher, RoleCategory.SupportStaff],
    learningOutcomes: "Create accessible lesson plans, apply specific differentiation techniques, understand sensory needs.",
    trustCpdCategory: "SEND and Inclusion",
    finalStatus: CPDStatus.Mandatory,
    isPriority: false,
    isMandatory: true,
    isStatutory: false,
    trustPriorities: ["Inclusion, SEND and equity"],
    intendedAudience: { main: "Teachers", sub: "Classroom teachers", phase: "All phases" }
  },
  {
    title: "Restorative Practice: Building Relationships",
    description: "A comprehensive introduction to restorative approaches in schools, focusing on building social capital, resolving conflict, and repairing harm within the school community. Participants will learn practical strategies to implement restorative language and circles in their daily practice.",
    targetAudience: [RoleCategory.Teacher, RoleCategory.SupportStaff, RoleCategory.MiddleLeader],
    learningOutcomes: "Understand the principles of restorative practice, facilitate restorative conversations, and apply strategies to build positive relationships.",
    trustCpdCategory: "Culture, Values, and Engagement",
    finalStatus: CPDStatus.Optional,
    isPriority: false,
    isMandatory: false,
    isStatutory: false,
    trustPriorities: ["Attendance and behaviour", "Safeguarding and pupil wellbeing"],
    intendedAudience: { main: "All Staff", phase: "All phases" }
  },
  {
    title: "Data Protection Ambassador Training",
    description: "Essential training for designated Data Protection Ambassadors to ensure compliance with GDPR and data handling policies within their academy. This course covers the legal framework, practical data security measures, and how to manage data breaches effectively.",
    targetAudience: [RoleCategory.SupportStaff, RoleCategory.MiddleLeader],
    learningOutcomes: "Identify data risks, understand GDPR requirements, and champion data protection best practices.",
    trustCpdCategory: "IT, Data, Compliance, and Operations",
    finalStatus: CPDStatus.Mandatory,
    isPriority: false,
    isMandatory: true,
    isStatutory: true,
    trustPriorities: ["Digital, data and operational effectiveness"],
    intendedAudience: { main: "Academy Support & Specialist", sub: "Business Admin & Operational Leaders" }
  }
];
