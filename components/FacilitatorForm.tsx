
import React, { useState, useEffect } from 'react';
import { TRUST_CPD_CATEGORIES, TRUST_PRIORITIES, EVENT_SUB_TYPES, VENUES, EEF_MECHANISMS } from '../constants';
import { FacilitatorFormData, CPDStatus, AudienceSelection, Facilitator, EventFormType, FrameworkAlignment } from '../types';
import { analyzeCPDStatus } from '../services/geminiService';
import { 
  Sparkles, Loader2, Users, Lock, Info, CheckCircle2, ShieldAlert, 
  BadgeCheck, Star, CircleDashed, MapPin, Mail, Plus, X,
  Clock, Calendar, AlertCircle, RefreshCw, HelpCircle, ChevronDown, BookOpen, Lightbulb, PenTool
} from 'lucide-react';

interface Props {
  onSubmit: (data: FacilitatorFormData) => void;
  initialData?: Partial<FacilitatorFormData> | null;
}

const ATTENDANCE_OPTIONS = [
  { id: 'open', label: '1. The event is open for colleagues to sign up', tooltip: 'Any colleague can sign up directly through the CPD portal.' },
  { id: 'request', label: '2. The event is open for colleagues to request to attend, and a PDI colleague will confirm places', tooltip: 'Colleagues can express interest, and the PDI team will approve or decline requests.' },
  { id: 'defined', label: '3. The event has a defined attendee group (e.g., SENDCO Network), so there will be no open sign-up', tooltip: 'Attendance is restricted to a specific group, network, or cohort.' },
  { id: 'invite', label: '4. The event is invitation-only', tooltip: 'Only colleagues invited directly by the facilitator or PDI team may attend.' },
  { id: 'programme', label: '5. The event is part of a programme with a fixed cohort', tooltip: 'Attendance is pre-determined as part of a wider programme.' }
];

const REGIONS = [
  { name: 'Greater Manchester', color: '#193c64' },
  { name: 'West Yorkshire', color: '#64aa8c' },
  { name: 'Stoke & Staffordshire', color: '#ffd700' },
  { name: 'Merseyside', color: '#f082b4' },
  { name: 'Trust Wide', color: '#00a1cc' },
];

const FacilitatorForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<FacilitatorFormData>>({
    courseId: undefined, // Holds the reference to the Catalogue Course
    isStatutory: false,
    isMandatory: false,
    isPriority: false,
    trustPriorities: [],
    intendedAudience: { main: '' },
    frameworkAlignment: {
        learnStrategy: '',
        exploreStrategy: '',
        applyStrategy: '',
        eefMechanisms: []
    },
    finalStatus: CPDStatus.Optional,
    capacity: 30,
    attendanceOption: 'open',
    trustCpdCategory: '',
    facilitators: [{ name: '', email: '' }],
    formType: '' as EventFormType, // Default to empty string
    dateRequirementType: 'I have no strong preference for date or time',
    isRepeated: 'Single occurrence',
    isIdenticalContent: true,
    isSameFacilitator: true,
    isSameParticipants: true,
    startTime: '',
    endTime: '',
    venue: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            courseId: initialData.courseId, // Ensure courseId is preserved
            facilitators: initialData.facilitators || [{ name: '', email: '' }],
            formType: initialData.formType || ('' as EventFormType)
        }));
    }
  }, [initialData]);

  const handleStatusChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    // Cascading reset
    if (key === 'isStatutory' && value === true) {
        updated.isMandatory = false;
        updated.isPriority = false;
    }
    if (key === 'isMandatory' && value === true) {
        updated.isPriority = false;
    }

    let status = CPDStatus.Optional;
    if (updated.isStatutory) status = CPDStatus.Statutory;
    else if (updated.isMandatory) status = CPDStatus.Mandatory;
    else if (updated.isPriority) status = CPDStatus.Priority;
    setFormData({ ...updated, finalStatus: status });
  };

  const togglePriority = (priority: string) => {
    const current = formData.trustPriorities || [];
    if (current.includes(priority)) {
      setFormData({ ...formData, trustPriorities: current.filter(p => p !== priority) });
    } else {
      setFormData({ ...formData, trustPriorities: [...current, priority] });
    }
  };

  const toggleMechanism = (mechanism: string) => {
    const current = formData.frameworkAlignment?.eefMechanisms || [];
    const updated = current.includes(mechanism) 
        ? current.filter(m => m !== mechanism)
        : [...current, mechanism];
    
    setFormData({
        ...formData,
        frameworkAlignment: {
            ...formData.frameworkAlignment!,
            eefMechanisms: updated
        }
    });
  };

  const handleAIAnalysis = async () => {
    if (!formData.title || !formData.description) return;
    setIsAnalyzing(true);
    const result = await analyzeCPDStatus(
      formData.title || '', 
      formData.description || '', 
      formData.intendedAudience?.main || 'General Staff'
    );
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const addFacilitator = () => {
    setFormData({
      ...formData,
      facilitators: [...(formData.facilitators || []), { name: '', email: '' }]
    });
  };

  const updateFacilitator = (index: number, field: keyof Facilitator, value: string) => {
    const updated = [...(formData.facilitators || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, facilitators: updated });
  };

  const removeFacilitator = (index: number) => {
    if (index === 0) return;
    const updated = [...(formData.facilitators || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, facilitators: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.date && formData.intendedAudience?.main && formData.formType) {
      onSubmit({
        ...formData,
        timeSpan: `${formData.startTime}–${formData.endTime}`,
        isRequestOnly: formData.attendanceOption === 'request'
      } as FacilitatorFormData);
    }
  };

  const selectedCategory = TRUST_CPD_CATEGORIES.find(c => c.name === formData.trustCpdCategory);
  const mainAudience = formData.intendedAudience?.main || '';
  const subAudience = formData.intendedAudience?.sub || '';
  const phaseAudience = formData.intendedAudience?.phase || '';
  
  const isTeachers = mainAudience === 'Teachers';
  const isLeadership = mainAudience === 'Leadership';
  const isAcademySupport = mainAudience === 'Academy Support & Specialist';
  const isBusinessAdmin = mainAudience === 'Business Admin & Operational Colleagues';
  const isAllStaff = mainAudience === 'All Staff';

  const teacherSubs = ['Trainee teachers', 'Early Career Teachers', 'Classroom teachers', 'ITT Mentors', 'ECT Mentors', 'Coaches'];
  const leadershipSubs = ['Educational Middle Leaders', 'Educational Senior Leaders', 'Educational System Leaders', 'Headteachers/Principals', 'Academy Support & Specialist Leaders', 'Business Admin & Operational Leaders'];

  const showDD1 = isTeachers || isLeadership;
  const isBasicTeacher = isTeachers && ['Trainee teachers', 'Early Career Teachers', 'Classroom teachers'].includes(subAudience);
  const isMentorTeacher = isTeachers && ['ITT Mentors', 'ECT Mentors', 'Coaches'].includes(subAudience);
  const isEducationalLeadership = isLeadership && ['Educational Middle Leaders', 'Educational Senior Leaders', 'Educational System Leaders', 'Headteachers/Principals'].includes(subAudience);
  const showDD2 = isBasicTeacher || isMentorTeacher || isEducationalLeadership;
  const showDD3 = isBasicTeacher || isMentorTeacher || (isEducationalLeadership && (phaseAudience === 'Primary' || phaseAudience === 'Secondary'));

  // Logic for extra detail field
  const isLeadershipSupport = isLeadership && subAudience === 'Academy Support & Specialist Leaders';
  const isLeadershipBusiness = isLeadership && subAudience === 'Business Admin & Operational Leaders';
  
  const showDetailField = isAcademySupport || isBusinessAdmin || isAllStaff || isLeadershipSupport || isLeadershipBusiness;

  let detailLabel = "Colleague Details";
  let detailPlaceholder = "";

  if (isAcademySupport) {
      detailPlaceholder = "Please provide detail on the specific Academy Support & Specialist colleagues";
  } else if (isBusinessAdmin) {
      detailPlaceholder = "Please provide detail on the specific Business Admin & Operational colleagues";
  } else if (isLeadershipSupport) {
      detailPlaceholder = "Please provide detail on the specific Academy Support & Specialist Leaders";
  } else if (isLeadershipBusiness) {
      detailPlaceholder = "Please provide detail on the specific Business Admin & Operational Leaders";
  } else if (isAllStaff) {
      detailLabel = "Please provide further details that may be relevant";
      detailPlaceholder = "Enter details here...";
  }

  const updateAudience = (updates: Partial<AudienceSelection>) => {
    setFormData({
      ...formData,
      intendedAudience: { ...formData.intendedAudience!, ...updates }
    });
  };

  const getStatusTheme = (status: CPDStatus) => {
    switch (status) {
      case CPDStatus.Statutory:
        return { box: 'bg-red-600 border-red-700 text-white', icon: <ShieldAlert size={40} className="text-white/40" /> };
      case CPDStatus.Mandatory:
        return { box: 'bg-orange-500 border-orange-600 text-white', icon: <BadgeCheck size={40} className="text-white/40" /> };
      case CPDStatus.Priority:
        return { box: 'bg-coop-blue border-coop-dark/20 text-white', icon: <Star size={40} className="text-[#ffd700]" fill="#ffd700" /> };
      default:
        return { box: 'bg-gray-100 border-gray-300 text-gray-700', icon: <CircleDashed size={40} className="text-gray-400" /> };
    }
  };

  const theme = getStatusTheme(formData.finalStatus as CPDStatus);

  const isLiveOrInPerson = formData.formType === 'Online Live' || formData.formType === 'In-Person';
  const isAsync = formData.formType === 'Online Asynchronous';

  // Helper to get description for selected attendance option
  const selectedAttendanceOption = ATTENDANCE_OPTIONS.find(opt => opt.id === formData.attendanceOption);

  const PrioritiesSection = () => (
    <div className="space-y-4">
        <label className="block text-[16pt] font-bold text-gray-700">Which Trust-wide priorities does this event support? <span className="text-red-500">*</span></label>
        <div className="space-y-2 bg-white p-6 rounded-lg border-2 border-gray-100">
            {TRUST_PRIORITIES.map(priority => (
                <label key={priority} className="flex items-start space-x-3 cursor-pointer group hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                        type="checkbox" 
                        className="mt-1.5 w-5 h-5 text-coop-blue rounded border-gray-300 focus:ring-coop-blue"
                        checked={formData.trustPriorities?.includes(priority)}
                        onChange={() => togglePriority(priority)}
                    />
                    <span className={`text-[14pt] font-sans ${formData.trustPriorities?.includes(priority) ? 'text-coop-blue font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>{priority}</span>
                </label>
            ))}
        </div>
    </div>
  );

  const AudienceSection = () => (
    <div className="space-y-8">
        <div className="space-y-2">
            <label className="block text-[16pt] font-bold text-gray-700">Who is your intended audience? <span className="text-red-500">*</span></label>
            <span className="text-[12pt] font-bold text-gray-400 font-sans">Main Audience Group</span>
            <select required className="w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans" value={mainAudience} onChange={e => setFormData({ ...formData, intendedAudience: { main: e.target.value } })}>
                <option value="">Select Audience...</option>
                <option value="All Staff">All Staff</option>
                <option value="Teachers">Teachers</option>
                <option value="Leadership">Leadership</option>
                <option value="Academy Support & Specialist">Academy Support & Specialist</option>
                <option value="Business Admin & Operational Colleagues">Business Admin & Operational Colleagues</option>
            </select>
        </div>
        {showDD1 && (
            <div className="space-y-2 animate-fade-in">
                <span className="text-[12pt] font-bold text-gray-400 font-sans">Specific Role</span>
                <select required className="w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans" value={subAudience} onChange={e => updateAudience({ sub: e.target.value, phase: '', region: '' })}>
                    <option value="">Select Option...</option>
                    {isTeachers && teacherSubs.map(s => <option key={s} value={s}>{s}</option>)}
                    {isLeadership && leadershipSubs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        )}
        {showDD2 && (
            <div className="space-y-2 animate-fade-in">
                <span className="text-[12pt] font-bold text-gray-400 font-sans">Phase / Reach</span>
                <select required className="w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans" value={phaseAudience} onChange={e => updateAudience({ phase: e.target.value, region: '' })}>
                    <option value="">Select Option...</option>
                    {(isTeachers && ['Trainee teachers', 'Early Career Teachers', 'Classroom teachers'].includes(subAudience)) && (
                        ["EYFS", "Primary", "Secondary", "Post-16", "All phases"].map(p => <option key={p} value={p}>{p}</option>)
                    )}
                    {isMentorTeacher && ["EYFS, Primary & Special School", "Secondary & Post 16", "All phases"].map(p => <option key={p} value={p}>{p}</option>)}
                    {isEducationalLeadership && ["Primary", "Secondary", "Post-16", "Trust Wide", "All phases"].map(p => <option key={p} value={p}>{p}</option>)}
                    {(!isMentorTeacher && !isEducationalLeadership && !(isTeachers && ['Trainee teachers', 'Early Career Teachers', 'Classroom teachers'].includes(subAudience))) && (
                        ["EYFS", "Primary", "Secondary", "Post-16", "All phases"].map(p => <option key={p} value={p}>{p}</option>)}
                    )}
                </select>
            </div>
        )}
        {showDD3 && (
            <div className="space-y-4 animate-fade-in bg-white p-6 rounded-xl border-2 border-gray-100 shadow-sm w-full">
                <span className="text-[12pt] font-bold text-gray-400 flex items-center font-sans"><MapPin size={16} className="mr-2" /> Targeted Region</span>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {REGIONS.map((r) => (
                        <button key={r.name} type="button" onClick={() => updateAudience({ region: r.name })} className={`w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans ${formData.intendedAudience?.region === r.name ? 'border-gray-800 scale-105 z-10' : 'border-transparent opacity-80'}`} style={{ backgroundColor: r.color, color: r.name === 'Stoke & Staffordshire' ? '#000' : '#fff' }}>
                            {r.name}
                        </button>
                    ))}
                </div>
            </div>
        )}
        {showDetailField && (
            <div className="space-y-2 animate-fade-in">
                <span className="text-[12pt] font-bold text-gray-400 font-sans">{detailLabel}</span>
                <textarea className="w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans" placeholder={detailPlaceholder} value={formData.intendedAudience?.detail || ''} onChange={e => updateAudience({ detail: e.target.value })} rows={2}/>
            </div>
        )}
    </div>
  );

  const CategorySection = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <label className="block text-[16pt] font-bold text-gray-700">Trust CPD Category <span className="text-red-500">*</span></label>
            <select 
            required className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] transition-all outline-none bg-white font-sans"
            value={formData.trustCpdCategory || ''}
            onChange={e => setFormData({...formData, trustCpdCategory: e.target.value})}
            >
            <option value="">Select Category...</option>
            {TRUST_CPD_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
        </div>
        {selectedCategory && (
            <div className={`p-6 rounded-xl border-l-[12px] flex items-start animate-fade-in shadow-md text-white transition-all duration-300 bg-opacity-60 ${selectedCategory.color} ${selectedCategory.color.replace('bg-', 'border-')}`}>
                <div className={`w-6 h-6 rounded-full ${selectedCategory.color} mr-4 mt-1 flex-shrink-0 border-2 border-white shadow-sm`}></div>
                <div className="space-y-2">
                    <p className="text-[20pt] font-bold">{selectedCategory.name}</p>
                    <p className="text-[14pt] leading-relaxed font-sans">{selectedCategory.detail}</p>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full mx-auto border-t-[12px] border-coop-blue">
      <div className="p-10 bg-gray-50 border-b border-gray-100">
        <h2 className="text-[26pt] font-black text-coop-dark tracking-tight">Facilitator CPD & Event Setup</h2>
        <p className="text-gray-500 mt-2 font-medium italic font-sans text-[14pt]">Welcome to the CPD Facilitator Portal. This guided process assists you in completing Stage 1 of the Trust CPD Management Procedure. By accurately defining your event's core details, intended audience, and logistical requirements here, you ensure alignment with Trust priorities and enable effective coordination across our academies.</p>
        {formData.courseId && (
            <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center text-blue-800">
                <Info size={20} className="mr-2 flex-shrink-0"/>
                <span className="font-bold">This event is linked to a Catalogue Course. Core details (Title, Description, Learning Outcomes) are inherited from the course.</span>
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-16">
        
        {/* SECTION 1: CORE DETAILS */}
        <section className="space-y-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-coop-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14pt]">1</div>
            <h3 className="text-[20pt] font-bold text-coop-blue">Core Details</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 w-full space-y-2">
              <label className="block text-[16pt] font-bold text-gray-700">Event Title <span className="text-red-500">*</span></label>
              <input 
                type="text" required placeholder="e.g. Annual Safeguarding Update"
                className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] transition-all outline-none"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <label className="block text-[16pt] font-bold text-gray-700">What form will the CPD &/or Event take? <span className="text-red-500">*</span></label>
              <select 
                required className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] transition-all outline-none bg-white"
                value={formData.formType}
                onChange={e => setFormData({...formData, formType: e.target.value as EventFormType, subFormType: ''})}
              >
                <option value="">Select Form...</option>
                <option value="Online Live">Online Live</option>
                <option value="Online Asynchronous">Online Asynchronous</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>
          </div>

          {/* ... (Previous layout code remains the same) ... */}
          {/* LAYOUT LOGIC BASED ON FORM TYPE */}
          {isLiveOrInPerson && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 animate-fade-in">
                 {/* LEFT COLUMN: Format & Priorities */}
                 <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[16pt] font-bold text-gray-700">Event Format Details <span className="text-red-500">*</span></label>
                            <select 
                                required className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] transition-all outline-none bg-white"
                                value={formData.subFormType || ''}
                                onChange={e => setFormData({...formData, subFormType: e.target.value, subFormTypeOther: ''})}
                            >
                                <option value="">Select format...</option>
                                {EVENT_SUB_TYPES.filter(type => !(formData.formType === 'Online Live' && type === 'Out of Trust Visit')).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                                <option value="Other">Other (please specify)</option>
                            </select>
                        </div>
                        {formData.subFormType === 'Other' && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="block text-[16pt] font-bold text-gray-700">Specify Other Format</label>
                                <input 
                                    type="text" required
                                    className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] transition-all outline-none"
                                    value={formData.subFormTypeOther || ''}
                                    onChange={e => setFormData({...formData, subFormTypeOther: e.target.value})}
                                    placeholder="Enter details..."
                                />
                            </div>
                        )}
                    </div>
                    
                    <PrioritiesSection />
                 </div>

                 {/* RIGHT COLUMN: Category & Audience */}
                 <div className="space-y-10">
                    <CategorySection />
                    <AudienceSection />
                 </div>
             </div>
          )}

          {isAsync && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 animate-fade-in">
                 {/* LEFT COLUMN: Category */}
                 <div className="space-y-10">
                    <CategorySection />
                 </div>

                 {/* RIGHT COLUMN: Priorities */}
                 <div className="space-y-10">
                    <PrioritiesSection />
                 </div>
             </div>
          )}

          {isAsync && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                  <AudienceSection />
              </div>
          )}

          <div className="space-y-4 pt-10 border-t border-gray-100">
            <div className="flex justify-between items-end">
                <label className="block text-[16pt] font-bold text-gray-700">Main Focus Summary <span className="text-red-500">*</span></label>
                <span className="text-[12pt] text-gray-400 font-bold font-sans">Audit Friendly</span>
            </div>
            <p className="text-[14pt] text-gray-500 leading-relaxed italic border-l-4 border-coop-blue/20 pl-4 py-2 font-sans">Explain the main focus in 2–3 sentences. Ensure alignment with the category and Trust priorities.</p>
            <div className="relative group">
              <textarea rows={5} required placeholder="Describe the journey and outcomes for participants..." className="w-full rounded-xl border-2 border-gray-200 focus:border-coop-blue p-6 text-[14pt] shadow-inner transition-all outline-none font-sans" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}/>
              <button type="button" onClick={handleAIAnalysis} className="absolute right-4 bottom-4 text-[12pt] bg-coop-dark text-white px-6 py-3 rounded-full flex items-center hover:bg-coop-blue transition-all shadow-xl font-bold font-sans">
                {isAnalyzing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />} AI Refine Summary
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: IMPACT DESIGN & FRAMEWORK */}
        <section className="space-y-12 pt-12 border-t-[12px] border-coop-blue bg-blue-50/20 p-10 rounded-xl">
             <div className="flex items-center space-x-4 mb-4">
                <div className="bg-coop-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14pt]">2</div>
                <h3 className="text-[20pt] font-black text-coop-blue">Impact Design: LEARN, EXPLORE, APPLY</h3>
            </div>
            <p className="text-[14pt] text-gray-600 leading-relaxed font-sans mb-6">
                Effective professional development at Co-op Academies Trust relies on strong connections between centrally delivered CPD and school-based practice. Use this section to outline how your session incorporates the Trust's framework and EEF effective mechanisms.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEARN */}
                <div className="bg-white p-6 rounded-xl border-t-4 border-indigo-500 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-700">
                        <BookOpen size={24} />
                        <h4 className="text-[16pt] font-bold">1. LEARN</h4>
                    </div>
                    <p className="text-[12pt] text-gray-500 italic">Introduce concepts, evidence, and practical approaches. (e.g. Managing cognitive load, Revisiting prior learning)</p>
                    <textarea 
                        className="w-full p-4 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none text-[12pt]"
                        rows={4}
                        placeholder="How will colleagues engage with new ideas/research in this session?"
                        value={formData.frameworkAlignment?.learnStrategy || ''}
                        onChange={e => setFormData({
                            ...formData, 
                            frameworkAlignment: { ...formData.frameworkAlignment!, learnStrategy: e.target.value }
                        })}
                    />
                </div>

                {/* EXPLORE */}
                <div className="bg-white p-6 rounded-xl border-t-4 border-amber-500 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-amber-700">
                        <Lightbulb size={24} />
                        <h4 className="text-[16pt] font-bold">2. EXPLORE</h4>
                    </div>
                    <p className="text-[12pt] text-gray-500 italic">Deepen understanding through reflection, discussion, and experimentation. (e.g. Social support, Modelling)</p>
                    <textarea 
                        className="w-full p-4 border border-gray-200 rounded-lg focus:border-amber-500 outline-none text-[12pt]"
                        rows={4}
                        placeholder="How will you support reflection and contextualisation?"
                        value={formData.frameworkAlignment?.exploreStrategy || ''}
                        onChange={e => setFormData({
                            ...formData, 
                            frameworkAlignment: { ...formData.frameworkAlignment!, exploreStrategy: e.target.value }
                        })}
                    />
                </div>

                {/* APPLY */}
                <div className="bg-white p-6 rounded-xl border-t-4 border-emerald-500 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-700">
                        <PenTool size={24} />
                        <h4 className="text-[16pt] font-bold">3. APPLY</h4>
                    </div>
                    <p className="text-[12pt] text-gray-500 italic">Embed learning into practice. (e.g. Action planning, Prompts/cues, Context-specific repetition)</p>
                    <textarea 
                        className="w-full p-4 border border-gray-200 rounded-lg focus:border-emerald-500 outline-none text-[12pt]"
                        rows={4}
                        placeholder="How will this lead to embedded change and impact outcomes?"
                        value={formData.frameworkAlignment?.applyStrategy || ''}
                        onChange={e => setFormData({
                            ...formData, 
                            frameworkAlignment: { ...formData.frameworkAlignment!, applyStrategy: e.target.value }
                        })}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
                <h4 className="text-[16pt] font-bold text-gray-700 font-sans">EEF Effective Mechanisms included:</h4>
                <p className="text-gray-500 text-[14pt] font-sans">Select the mechanisms that are explicitly built into your session design.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {EEF_MECHANISMS.map(group => (
                        <div key={group.category} className="space-y-2">
                            <h5 className="font-bold text-coop-blue font-sans text-[14pt]">{group.category}</h5>
                            <div className="space-y-1">
                                {group.items.map(mech => (
                                    <label key={mech} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded font-sans">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 text-coop-blue rounded"
                                            checked={formData.frameworkAlignment?.eefMechanisms?.includes(mech)}
                                            onChange={() => toggleMechanism(mech)}
                                        />
                                        <span className="text-[14pt] text-gray-700 font-sans">{mech}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* SECTION 3: FACILITATORS & LOGISTICS */}
        <section className="space-y-12 pt-12 border-t border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-coop-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14pt]">3</div>
            <h3 className="text-[20pt] font-bold text-coop-blue">Facilitators & Logistics</h3>
          </div>

          <div className="space-y-6">
            <h4 className="text-[16pt] font-bold text-gray-700 font-sans">Event Facilitators</h4>
            <div className="grid grid-cols-1 gap-6">
              {formData.facilitators?.map((fac, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 items-end bg-gray-50 p-6 rounded-xl border border-gray-100 relative group animate-fade-in">
                    <div className="flex-1 space-y-2 w-full">
                        <span className="text-[12pt] font-bold text-gray-400 flex items-center font-sans"><Users size={14} className="mr-2"/> {idx === 0 ? "Lead Facilitator Name" : "Facilitator Name"}</span>
                        <input type="text" className="w-full p-4 rounded border border-gray-200 text-[14pt] focus:border-coop-blue outline-none font-sans" value={fac.name} onChange={e => updateFacilitator(idx, 'name', e.target.value)} placeholder="Jane Doe" required />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                        <span className="text-[12pt] font-bold text-gray-400 flex items-center font-sans"><Mail size={14} className="mr-2"/> Email Address</span>
                        <input type="email" className="w-full p-4 rounded border border-gray-200 text-[14pt] focus:border-coop-blue outline-none font-sans" value={fac.email} onChange={e => updateFacilitator(idx, 'email', e.target.value)} placeholder="jane.doe@coopacademies.co.uk" required />
                    </div>
                    {idx > 0 && (
                        <button type="button" onClick={() => removeFacilitator(idx)} className="bg-red-50 text-red-500 p-3 rounded hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
                    )}
                </div>
              ))}
              <button 
                type="button" onClick={addFacilitator}
                className="flex items-center justify-center space-x-3 border-2 border-dashed border-gray-300 p-6 rounded-xl text-gray-400 hover:border-coop-blue hover:text-coop-blue transition-all font-bold text-[16pt] font-sans"
              >
                <Plus size={20}/> <span>Add an additional Facilitator</span>
              </button>
            </div>
          </div>

          {formData.formType === 'In-Person' && (
            <div className="bg-orange-50 border-l-8 border-orange-400 p-6 rounded flex items-start space-x-6 animate-fade-in font-sans">
                <AlertCircle size={28} className="text-orange-600 mt-1 flex-shrink-0" />
                <p className="text-[14pt] text-orange-800 font-medium">For in-person CPD, the event facilitator must confirm that a suitable space is available before continuing with this form. Check your preferred venue for room and date availability in line with local booking procedures.</p>
            </div>
          )}

          <div className="space-y-2 animate-fade-in pt-6">
              <label className="block text-[16pt] font-bold text-gray-700">Event Venue / Location <span className="text-red-500">*</span></label>
              <select 
                  required 
                  className="w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans"
                  value={formData.venue || ''}
                  onChange={e => setFormData({...formData, venue: e.target.value})}
              >
                  <option value="">Select Venue...</option>
                  {formData.formType === 'In-Person' ? (
                      <>
                        {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                        <option value="To Be Confirmed">To Be Confirmed</option>
                      </>
                  ) : (
                      <option value="Online (Google Meet)">Online (Google Meet)</option>
                  )}
              </select>
          </div>

          <div className="space-y-10 bg-blue-50/30 p-10 rounded-3xl border border-blue-100">
             <div className="space-y-3">
                <h4 className="text-[16pt] font-black text-coop-dark">Date & Time Coordination</h4>
                <p className="text-[14pt] text-gray-500 leading-relaxed italic max-w-4xl font-sans">
                    To support effective coordination, please note that the PDI team cannot guarantee a specific date. We aim for even distribution across the academic year and regions to minimize staff release conflicts.
                </p>
             </div>

             <div className="space-y-6">
                <label className="block text-[16pt] font-bold text-gray-700">Please select one of the following:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                         {[
                            "My CPD/Event must happen between:",
                            "My CPD/Event must happen on a specific day:",
                            "My CPD/Event must happen during the school day"
                         ].map(opt => (
                            <label key={opt} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all font-sans ${formData.dateRequirementType === opt ? 'border-coop-blue bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                                <input type="radio" className="w-5 h-5 text-coop-blue" checked={formData.dateRequirementType === opt} onChange={() => setFormData({...formData, dateRequirementType: opt})} />
                                <span className="ml-4 text-[14pt] font-medium text-gray-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4">
                         {[
                            "My CPD/Event can be a twilight session",
                            "I am flexible, and the CPD/Event can take place within a general time period:",
                            "I have no strong preference for date or time"
                         ].map(opt => (
                            <label key={opt} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all font-sans ${formData.dateRequirementType === opt ? 'border-coop-blue bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                                <input type="radio" className="w-5 h-5 text-coop-blue" checked={formData.dateRequirementType === opt} onChange={() => setFormData({...formData, dateRequirementType: opt})} />
                                <span className="ml-4 text-[14pt] font-medium text-gray-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
             </div>

             <div className="animate-fade-in space-y-6">
                {(formData.dateRequirementType === "My CPD/Event must happen between:" || formData.dateRequirementType === "I am flexible, and the CPD/Event can take place within a general time period:") && (
                    <div className="grid grid-cols-2 gap-6 max-w-xl">
                        <div className="space-y-2">
                            <span className="text-[12pt] font-bold text-gray-400 font-sans">Start Date</span>
                            <input type="date" className="w-full p-4 border rounded font-sans text-[14pt]" value={formData.dateRangeStart || ''} onChange={e => setFormData({...formData, dateRangeStart: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[12pt] font-bold text-gray-400 font-sans">End Date</span>
                            <input type="date" className="w-full p-4 border rounded font-sans text-[14pt]" value={formData.dateRangeEnd || ''} onChange={e => setFormData({...formData, dateRangeEnd: e.target.value})}/>
                        </div>
                    </div>
                )}
                {formData.dateRequirementType === "My CPD/Event must happen on a specific day:" && (
                    <div className="max-w-md space-y-2">
                        <span className="text-[12pt] font-bold text-gray-400 font-sans">Specific Day</span>
                        <select className="w-full p-4 border rounded bg-white text-[14pt] font-sans" value={formData.specificDay || ''} onChange={e => setFormData({...formData, specificDay: e.target.value})}>
                            <option value="">Select Day...</option>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                )}
                {formData.dateRequirementType !== "I have no strong preference for date or time" && (
                    <div className="space-y-2">
                        <span className="text-[12pt] font-bold text-gray-400 font-sans">Reason for this requirement</span>
                        <textarea rows={2} className="w-full p-4 border rounded-lg text-[14pt] outline-none focus:border-coop-blue font-sans" placeholder="Explain why this time/date is necessary..." value={formData.timePreferenceReason || ''} onChange={e => setFormData({...formData, timePreferenceReason: e.target.value})}/>
                    </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-blue-100">
                <div className="space-y-2">
                    <label className="block text-[16pt] font-bold text-gray-700 flex items-center font-sans"><Calendar size={20} className="mr-3 text-coop-blue"/> Preferred Event Date <span className="text-red-500">*</span></label>
                    <input type="date" required className="w-full border-2 border-gray-200 rounded-lg p-4 text-[14pt] outline-none focus:border-coop-blue bg-white font-sans" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="block text-[16pt] font-bold text-gray-700 flex items-center font-sans"><Clock size={20} className="mr-3 text-coop-blue"/> Start Time <span className="text-red-500">*</span></label>
                    <input type="time" required className="w-full border-2 border-gray-200 rounded-lg p-4 text-[14pt] outline-none focus:border-coop-blue bg-white font-sans" value={formData.startTime || ''} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="block text-[16pt] font-bold text-gray-700 flex items-center font-sans"><Clock size={20} className="mr-3 text-coop-blue"/> Finish Time <span className="text-red-500">*</span></label>
                    <input type="time" required className="w-full border-2 border-gray-200 rounded-lg p-4 text-[14pt] outline-none focus:border-coop-blue bg-white font-sans" value={formData.endTime || ''} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
             </div>
             
             <div className="space-y-2 max-w-lg pt-6">
                <label className="block text-[16pt] font-bold text-gray-700 font-sans">Is this a repeated session? <span className="text-red-500">*</span></label>
                <select required className="w-full border-2 border-gray-200 rounded-lg p-4 text-[14pt] outline-none focus:border-coop-blue bg-white font-sans" value={formData.isRepeated} onChange={e => setFormData({...formData, isRepeated: e.target.value as any})}>
                    <option value="Single occurrence">Single occurrence</option>
                    <option value="Repeated on multiple dates with same content">Repeated on multiple dates</option>
                </select>
             </div>

            {formData.isRepeated === 'Repeated on multiple dates with same content' && (
                <div className="mt-6 p-8 bg-white rounded-xl border-2 border-blue-100 space-y-6 animate-fade-in shadow-sm">
                    <h5 className="text-[12pt] font-black text-coop-blue flex items-center"><RefreshCw size={16} className="mr-2"/> Series Configuration</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <span className="text-[12pt] font-bold text-gray-400 font-sans">Frequency</span>
                            <select 
                                className="w-full p-4 border rounded text-[14pt] outline-none focus:border-coop-blue font-sans"
                                value={formData.repetitionFrequency || ''}
                                onChange={e => setFormData({...formData, repetitionFrequency: e.target.value})}
                            >
                                <option value="">Select...</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Bi-weekly">Bi-weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Termly">Termly</option>
                                <option value="Custom">Custom Pattern</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[12pt] font-bold text-gray-400 font-sans">Total Sessions</span>
                            <input 
                                type="number" 
                                className="w-full p-4 border rounded text-[14pt] outline-none focus:border-coop-blue font-sans"
                                placeholder="e.g. 6"
                                value={formData.repeatCount || ''}
                                onChange={e => setFormData({...formData, repeatCount: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    
                    {formData.repetitionFrequency === 'Weekly' && (
                         <div className="space-y-2">
                            <span className="text-[12pt] font-bold text-gray-400 font-sans">Day of Week</span>
                            <select 
                               className="w-full p-4 border rounded text-[14pt] outline-none focus:border-coop-blue font-sans"
                               value={formData.repeatDayOfWeek || ''}
                               onChange={e => setFormData({...formData, repeatDayOfWeek: e.target.value})}
                            >
                               <option value="">Select Day...</option>
                               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                         </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="text-[12pt] font-bold text-gray-700 block mb-2 font-sans">Identical Content?</span>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="radio" className="w-5 h-5 text-coop-blue" checked={formData.isIdenticalContent === true} onChange={() => setFormData({...formData, isIdenticalContent: true})} /> <span className="text-[14pt]">Yes</span></label>
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="radio" className="w-5 h-5 text-coop-blue" checked={formData.isIdenticalContent === false} onChange={() => setFormData({...formData, isIdenticalContent: false})} /> <span className="text-[14pt]">No</span></label>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="text-[12pt] font-bold text-gray-700 block mb-2 font-sans">Same Facilitator?</span>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="radio" className="w-5 h-5 text-coop-blue" checked={formData.isSameFacilitator === true} onChange={() => setFormData({...formData, isSameFacilitator: true})} /> <span className="text-[14pt]">Yes</span></label>
                                <label className="flex items-center space-x-3 cursor-pointer"><input type="radio" className="w-5 h-5 text-coop-blue" checked={formData.isSameFacilitator === false} onChange={() => setFormData({...formData, isSameFacilitator: false})} /> <span className="text-[14pt]">No</span></label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

             <div className="space-y-10 pt-12 border-t border-blue-100">
                <div className="space-y-3">
                    <h4 className="text-[16pt] font-black text-coop-dark">Event Attendance Options</h4>
                    <p className="text-[14pt] text-gray-500 leading-relaxed italic max-w-4xl font-sans">
                        Select how colleagues will attend or be invited to this session.
                    </p>
                </div>

                <div className="space-y-4">
                   <label className="block text-[16pt] font-bold text-gray-700 flex items-center font-sans">
                     How will colleagues access this CPD/Event?
                     <div className="group relative inline-block ml-3">
                        <HelpCircle size={20} className="text-gray-400 cursor-help" />
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-coop-dark text-white text-[12pt] p-3 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl font-sans">Select the option that best describes how colleagues will attend or be invited to this session.</span>
                     </div>
                   </label>
                   
                   <select 
                      required 
                      className="w-full rounded-lg border-2 border-gray-200 p-4 text-[14pt] focus:border-coop-blue bg-white transition-all outline-none font-sans"
                      value={formData.attendanceOption || ''}
                      onChange={e => setFormData({...formData, attendanceOption: e.target.value})}
                   >
                      <option value="">Select option...</option>
                      {ATTENDANCE_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                   </select>

                   {selectedAttendanceOption && (
                       <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-[12pt] font-sans flex items-start mt-2 border border-blue-100">
                           <Info size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                           {selectedAttendanceOption.tooltip}
                       </div>
                   )}
                </div>
                
                {(formData.attendanceOption === 'open' || formData.attendanceOption === 'request') && (
                    <div className="space-y-2 max-w-sm animate-fade-in pt-6">
                        <label className="block text-[16pt] font-bold text-gray-700 flex items-center font-sans">
                            Maximum Capacity
                            <div className="group relative inline-block ml-3">
                            <HelpCircle size={20} className="text-gray-400 cursor-help" />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-coop-dark text-white text-[12pt] p-3 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 font-sans">Enter the maximum number of attendees you can accommodate.</span>
                            </div>
                        </label>
                        <input type="number" min="1" className="w-full border-2 border-gray-200 rounded-lg p-4 bg-white outline-none focus:border-coop-blue font-sans text-[14pt]" value={formData.capacity || 30} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                    </div>
                )}
             </div>
          </div>
        </section>

        {/* CLASSIFICATION & SUBMISSION */}
        <section className="bg-gradient-to-br from-blue-50/50 to-white p-12 rounded-[2rem] border-2 border-blue-100 space-y-12 shadow-inner">
          <div className="flex items-center space-x-4 mb-4">
            <h3 className="text-[20pt] font-black text-coop-dark">Classification & Submission</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
             {/* Left Column: Questions */}
             <div className="space-y-8">
                {/* Q1 */}
                <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[16pt] font-black text-gray-800 font-sans">Q1. Is this CPD statutory? <span className="text-[12pt] font-normal text-gray-500 block font-sans">(Legal requirement e.g. KCSIE)</span></p>
                    <div className="flex space-x-10">
                      <label className="flex items-center space-x-4 cursor-pointer group font-sans">
                        <input type="radio" className="w-6 h-6 text-coop-blue" checked={formData.isStatutory === true} onChange={() => handleStatusChange('isStatutory', true)} />
                        <span className="font-bold text-[14pt] group-hover:text-coop-blue transition-colors">Yes</span>
                      </label>
                      <label className="flex items-center space-x-4 cursor-pointer group font-sans">
                        <input type="radio" className="w-6 h-6 text-coop-blue" checked={formData.isStatutory === false} onChange={() => handleStatusChange('isStatutory', false)} />
                        <span className="font-bold text-[14pt] group-hover:text-coop-blue transition-colors">No</span>
                      </label>
                    </div>
                    {formData.isStatutory && (
                        <div className="animate-fade-in space-y-2 max-w-lg mt-6">
                            <label className="block text-[14pt] font-bold text-gray-700 font-sans">Provide the web address that verifies the CPD is statutory <span className="text-red-500">*</span></label>
                            <input 
                                type="url" required placeholder="https://www.gov.uk/government/publications/..."
                                className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] outline-none font-sans"
                                value={formData.statutoryUrl || ''}
                                onChange={e => setFormData({...formData, statutoryUrl: e.target.value})}
                            />
                        </div>
                    )}
                </div>

                {/* Q2 */}
                {!formData.isStatutory && (
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in transition-all hover:shadow-md">
                      <p className="text-[16pt] font-black text-gray-800 font-sans">Q2. Is this CPD mandatory? <span className="text-[12pt] font-normal text-gray-500 block font-sans">(Trust-wide policy requirement)</span></p>
                      <div className="flex space-x-10">
                        <label className="flex items-center space-x-4 cursor-pointer group font-sans">
                          <input type="radio" className="w-6 h-6 text-coop-blue" checked={formData.isMandatory === true} onChange={() => handleStatusChange('isMandatory', true)} />
                          <span className="font-bold text-[14pt] group-hover:text-coop-blue transition-colors">Yes</span>
                        </label>
                        <label className="flex items-center space-x-4 cursor-pointer group font-sans">
                          <input type="radio" className="w-6 h-6 text-coop-blue" checked={formData.isMandatory === false} onChange={() => handleStatusChange('isMandatory', false)} />
                          <span className="font-bold text-[14pt] group-hover:text-coop-blue transition-colors">No</span>
                        </label>
                      </div>
                      {formData.isMandatory && (
                        <div className="animate-fade-in space-y-2 max-w-lg mt-6">
                            <label className="block text-[14pt] font-bold text-gray-700 font-sans">Provide the Trust-wide policy or external partnership agreement that verifies the CPD is mandatory <span className="text-red-500">*</span></label>
                            <input 
                                type="text" required placeholder="e.g. Trust Data Policy, Teach First Agreement"
                                className="w-full rounded-lg border-2 border-gray-200 focus:border-coop-blue p-4 text-[14pt] outline-none font-sans"
                                value={formData.mandatoryPolicyUrl || ''}
                                onChange={e => setFormData({...formData, mandatoryPolicyUrl: e.target.value})}
                            />
                        </div>
                      )}
                    </div>
                )}

                {/* Q3 */}
                {!formData.isStatutory && !formData.isMandatory && (
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in transition-all hover:shadow-md">
                      <p className="text-[16pt] font-black text-gray-800 font-sans">Q3. Is this CPD a Trust Strategic Priority?</p>
                      <div className="flex space-x-10">
                        <label className="flex items-center space-x-4 cursor-pointer group font-sans">
                          <input type="radio" className="w-6 h-6 text-coop-blue" checked={formData.isPriority === true} onChange={() => handleStatusChange('isPriority', true)} />
                          <span className="font-bold text-[14pt] group-hover:text-coop-blue transition-colors">Yes</span>
                        </label>
                        <label className="flex items-center space-x-4 cursor-pointer group font-sans">
                          <input type="radio" className="w-6 h-6 text-coop-blue" checked={formData.isPriority === false} onChange={() => handleStatusChange('isPriority', false)} />
                          <span className="font-bold text-[14pt] group-hover:text-coop-blue transition-colors">No</span>
                        </label>
                      </div>
                    </div>
                )}
             </div>

             {/* Right Column: Outcome */}
             <div className="sticky top-24">
                  <div className={`${theme.box} p-10 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center text-center space-y-4 shadow-lg transform hover:scale-[1.02]`}>
                      <p className="text-[16pt] opacity-80 font-black mb-2 font-sans tracking-widest uppercase">Final Classification</p>
                      <div className="bg-white/20 p-6 rounded-full shadow-inner">{theme.icon}</div>
                      <p className="text-[32pt] font-black leading-none tracking-tight">{formData.finalStatus}</p>
                  </div>
             </div>
          </div>

          <button type="submit" className="w-full group relative p-8 rounded-3xl font-black shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 overflow-hidden flex items-center justify-center bg-white border-4 border-coop-blue text-coop-blue hover:bg-blue-50 mt-8">
              <span className="relative z-10 text-[16pt] font-sans">Submit CPD/Event for Review</span>
          </button>
        </section>
      </form>
    </div>
  );
};

export default FacilitatorForm;
