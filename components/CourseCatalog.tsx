
import React, { useState, useMemo } from 'react';
import { TRUST_CPD_CATEGORIES } from '../constants';
import { BookOpen, Users, Target, ArrowRight, Plus, Search, ArrowLeft, Save, Calendar, CheckCircle, AlertTriangle, Star, Circle, MapPin, ListFilter, Clock, Pencil, ClipboardList, Info, Filter } from 'lucide-react';
import { FacilitatorFormData, Course, CPDStatus, CPDProposal, User } from '../types';

interface Props {
  courses: Course[];
  currentUser: User | null;
  onScheduleCourse: (course: Partial<FacilitatorFormData>) => void;
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onSubmitProposal: (proposal: Omit<CPDProposal, 'id' | 'status' | 'submittedAt'>) => void;
}

const REGION_OPTIONS = [
  'Greater Manchester',
  'West Yorkshire',
  'Stoke & Staffordshire',
  'Merseyside',
  'Trust Wide'
];

const AUDIENCE_OPTIONS = [
  'Teachers',
  'Leadership',
  'Support Staff',
  'All Staff',
  'Academy Support & Specialist',
  'Business Admin & Operational Colleagues'
];

const CourseCatalog: React.FC<Props> = ({ courses, currentUser, onScheduleCourse, onAddCourse, onUpdateCourse, onSubmitProposal }) => {
  const [view, setView] = useState<'list' | 'proposal' | 'edit' | 'detail'>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Filter & Sort State
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    audience: '',
    region: ''
  });
  const [sortBy, setSortBy] = useState<'title' | 'created'>('title');

  // Stage 1 Proposal Form State
  const [proposalForm, setProposalForm] = useState({
    title: '',
    trustCpdCategory: '',
    description: '',
    learningObjectives: '',
    targetPhase: 'Trust Wide',
    targetRoles: '',
    proposedStatus: CPDStatus.Optional,
    intendedImpact: '',
    formatType: 'Online Live',
    formatDuration: '',
    expectedNumbers: 'Medium (21-60)',
    dateWindow: '',
    additionalNotes: ''
  });

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setView('detail');
  };

  const handleEditClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setSelectedCourse(course);
    // Note: Edit logic for existing catalogue courses would typically remain admin/PDI only.
    // For this update, we focus on the "New Intent" workflow.
    setView('edit'); 
  };

  const resetProposalForm = () => {
    setProposalForm({
        title: '', trustCpdCategory: '', description: '', learningObjectives: '',
        targetPhase: 'Trust Wide', targetRoles: '', proposedStatus: CPDStatus.Optional,
        intendedImpact: '', formatType: 'Online Live', formatDuration: '',
        expectedNumbers: 'Medium (21-60)', dateWindow: '', additionalNotes: ''
    });
  };

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    onSubmitProposal({
        submittedBy: {
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            academy: currentUser.academy || 'Unknown'
        },
        title: proposalForm.title,
        trustCpdCategory: proposalForm.trustCpdCategory,
        description: proposalForm.description,
        learningObjectives: proposalForm.learningObjectives,
        targetAudience: {
            phase: proposalForm.targetPhase,
            roles: proposalForm.targetRoles
        },
        proposedStatus: proposalForm.proposedStatus,
        intendedImpact: proposalForm.intendedImpact,
        roughFormat: {
            type: proposalForm.formatType,
            duration: proposalForm.formatDuration,
            expectedNumbers: proposalForm.expectedNumbers
        },
        dateWindow: proposalForm.dateWindow,
        additionalNotes: proposalForm.additionalNotes
    });

    setView('list');
    resetProposalForm();
    alert("Proposal of Intent submitted to PDI for triage. You will be notified via email.");
  };

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchSearch = !filters.search || 
        course.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        course.description.toLowerCase().includes(filters.search.toLowerCase());
        
      const matchCategory = !filters.category || course.trustCpdCategory === filters.category;
      const matchStatus = !filters.status || course.finalStatus === filters.status;
      const matchRegion = !filters.region || course.intendedAudience?.region === filters.region;
      
      const matchAudience = !filters.audience || 
        course.intendedAudience?.main === filters.audience ||
        course.targetAudience.some(a => a.includes(filters.audience));
      
      return matchSearch && matchCategory && matchStatus && matchRegion && matchAudience;
    }).sort((a, b) => {
      if (sortBy === 'created') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [courses, filters, sortBy]);

  const getStatusBadge = (status: CPDStatus) => {
    switch (status) {
      case CPDStatus.Statutory:
        return <span className="inline-flex items-center px-2 py-1 rounded text-[12pt] font-bold bg-red-600 text-white"><AlertTriangle size={14} className="mr-1"/> Statutory</span>;
      case CPDStatus.Mandatory:
        return <span className="inline-flex items-center px-2 py-1 rounded text-[12pt] font-bold bg-orange-500 text-white"><CheckCircle size={14} className="mr-1"/> Mandatory</span>;
      case CPDStatus.Priority:
        return <span className="inline-flex items-center px-2 py-1 rounded text-[12pt] font-bold bg-coop-blue text-white"><Star size={14} className="mr-1 text-[#ffd700]" fill="#ffd700" /> Priority</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded text-[12pt] font-bold bg-gray-400 text-white"><Circle size={14} className="mr-1"/> Optional</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-coop-blue flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 max-w-4xl">
          <h2 className="text-[26pt] font-bold text-coop-dark mb-1">CPD Course Catalogue</h2>
          <p className="text-gray-600 text-[14pt]">Explore existing Trust-wide CPD. Facilitators can submit a <strong>Proposal of Intent</strong> (Stage 1) here for new events.</p>
        </div>
        {view === 'list' && currentUser?.role !== 'Colleague' && (
          <div className="flex-shrink-0">
            <button 
              onClick={() => { resetProposalForm(); setView('proposal'); }}
              className="flex items-center bg-coop-dark text-white px-6 py-3 rounded-lg font-bold text-[16pt] hover:bg-coop-blue transition-colors shadow-lg"
            >
              <Plus size={20} className="mr-2" /> Add New CPD Event
            </button>
          </div>
        )}
      </div>

      {/* STAGE 1: PROPOSAL OF INTENT FORM */}
      {view === 'proposal' && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto border-t-[8px] border-coop-blue animate-in slide-in-from-bottom duration-300">
           <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div>
                <h3 className="text-[20pt] font-black text-coop-dark">Proposal of Intent (Stage 1)</h3>
                <p className="text-gray-500 text-[12pt]">Short proposal (~10 mins). PDI will review before full design.</p>
             </div>
             <button onClick={() => { setView('list'); resetProposalForm(); }} className="text-gray-500 hover:text-coop-dark flex items-center font-bold text-[12pt]"><ArrowLeft size={16} className="mr-1"/> Cancel</button>
           </div>
           
           <div className="bg-blue-50 p-6 border-b border-blue-100 flex items-start gap-3 text-blue-800">
                <Info size={24} className="mt-1 flex-shrink-0"/>
                <p className="font-bold text-[12pt]">Process: Submit this brief proposal > PDI Triage (Approve/Decline) > If approved, complete Full Event Setup.</p>
           </div>

           <form onSubmit={handleProposalSubmit} className="p-10 space-y-10">
              {/* Facilitator Details Auto-filled */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 grid grid-cols-2 gap-4 text-[10pt] text-gray-600">
                  <div><strong>Lead:</strong> {currentUser?.name}</div>
                  <div><strong>Email:</strong> {currentUser?.email}</div>
                  <div><strong>Academy:</strong> {currentUser?.academy}</div>
                  <div><strong>Role:</strong> {currentUser?.role}</div>
              </div>

              {/* Core Idea */}
              <section className="space-y-6">
                  <h4 className="text-[16pt] font-black text-coop-dark border-b pb-2">1. Core Concept</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Course Title <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="e.g. Literacy Across the Curriculum" value={proposalForm.title} onChange={e => setProposalForm({...proposalForm, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Category <span className="text-red-500">*</span></label>
                        <select required className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none bg-white text-[14pt]" value={proposalForm.trustCpdCategory} onChange={e => setProposalForm({...proposalForm, trustCpdCategory: e.target.value})}>
                            <option value="">Select Category...</option>
                            {TRUST_CPD_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[14pt] font-bold text-gray-700">Brief Description (Max 100 words) <span className="text-red-500">*</span></label>
                     <textarea required rows={3} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="What is it? What will colleagues do?" value={proposalForm.description} onChange={e => setProposalForm({...proposalForm, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[14pt] font-bold text-gray-700">Learning Objectives</label>
                     <textarea required rows={2} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="By the end of this session..." value={proposalForm.learningObjectives} onChange={e => setProposalForm({...proposalForm, learningObjectives: e.target.value})} />
                  </div>
              </section>

              {/* Strategic Alignment */}
              <section className="space-y-6">
                  <h4 className="text-[16pt] font-black text-coop-dark border-b pb-2">2. Alignment & Impact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Proposed Status <span className="text-red-500">*</span></label>
                        <select required className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none bg-white text-[14pt]" value={proposalForm.proposedStatus} onChange={e => setProposalForm({...proposalForm, proposedStatus: e.target.value as CPDStatus})}>
                            {Object.values(CPDStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Intended Impact <span className="text-red-500">*</span></label>
                        <textarea required rows={2} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="What practice or outcome will change?" value={proposalForm.intendedImpact} onChange={e => setProposalForm({...proposalForm, intendedImpact: e.target.value})} />
                     </div>
                  </div>
              </section>

              {/* Logistics */}
              <section className="space-y-6">
                  <h4 className="text-[16pt] font-black text-coop-dark border-b pb-2">3. Audience & Logistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Target Phase <span className="text-red-500">*</span></label>
                        <select required className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none bg-white text-[14pt]" value={proposalForm.targetPhase} onChange={e => setProposalForm({...proposalForm, targetPhase: e.target.value})}>
                            <option value="Trust Wide">Trust Wide</option>
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                            <option value="Special / AP">Special / AP</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Target Roles <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="e.g. ECTs, Science Leads" value={proposalForm.targetRoles} onChange={e => setProposalForm({...proposalForm, targetRoles: e.target.value})} />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Format</label>
                        <select className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none bg-white text-[14pt]" value={proposalForm.formatType} onChange={e => setProposalForm({...proposalForm, formatType: e.target.value})}>
                            <option value="Online Live">Online Live</option>
                            <option value="In-Person">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Asynchronous">Asynchronous</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Approx Duration</label>
                        <input type="text" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="e.g. 2 hours, Half day" value={proposalForm.formatDuration} onChange={e => setProposalForm({...proposalForm, formatDuration: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Expected Numbers</label>
                        <select className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none bg-white text-[14pt]" value={proposalForm.expectedNumbers} onChange={e => setProposalForm({...proposalForm, expectedNumbers: e.target.value})}>
                            <option value="Small (<20)">Small (&lt;20)</option>
                            <option value="Medium (21-60)">Medium (21-60)</option>
                            <option value="Large (60+)">Large (60+)</option>
                        </select>
                      </div>
                  </div>

                  <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Feasible Date Window <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="e.g. Summer Term 1, or June 2026" value={proposalForm.dateWindow} onChange={e => setProposalForm({...proposalForm, dateWindow: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                        <label className="block text-[14pt] font-bold text-gray-700">Additional Notes (Optional)</label>
                        <textarea rows={2} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-coop-blue outline-none text-[14pt]" placeholder="Constraints, partners, accreditation info..." value={proposalForm.additionalNotes} onChange={e => setProposalForm({...proposalForm, additionalNotes: e.target.value})} />
                  </div>
              </section>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                 <button type="submit" className="bg-coop-blue text-white px-10 py-4 rounded-lg font-bold text-[16pt] hover:bg-coop-dark transition-all shadow-lg flex items-center">
                    <ClipboardList size={24} className="mr-2"/> Submit Proposal of Intent
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* VIEW: DETAIL (Read-only view of approved catalogue items) */}
      {view === 'detail' && selectedCourse && (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-5xl mx-auto animate-in slide-in-from-right duration-300">
           <div className={`h-40 ${TRUST_CPD_CATEGORIES.find(c => c.name === selectedCourse.trustCpdCategory)?.color || 'bg-coop-blue'} relative`}>
              <button onClick={() => setView('list')} className="absolute top-8 left-8 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all">
                <ArrowLeft size={28} />
              </button>
           </div>
           
           <div className="px-10 py-10 -mt-20 relative z-10">
              <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div>
                       <div className="flex flex-wrap gap-3 mb-4">
                          {getStatusBadge(selectedCourse.finalStatus)}
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-[12pt] font-bold">{selectedCourse.trustCpdCategory}</span>
                       </div>
                       <h2 className="text-[26pt] font-black text-coop-dark mb-2">{selectedCourse.title}</h2>
                       <div className="flex items-center text-gray-500 text-[14pt] font-medium">
                          <Target size={20} className="mr-2 text-coop-blue" />
                          <span>{selectedCourse.intendedAudience.main} {selectedCourse.targetAudience.length > 0 && `• ${selectedCourse.targetAudience.join(', ')}`}</span>
                       </div>
                    </div>
                    {/* Only facilitators can schedule from existing templates */}
                    {currentUser && currentUser.role !== 'Colleague' && (
                        <button 
                        onClick={() => onScheduleCourse(selectedCourse as unknown as Partial<FacilitatorFormData>)}
                        className="bg-coop-blue text-white px-8 py-4 rounded-lg font-bold text-[16pt] hover:bg-coop-dark transition-all shadow-lg flex items-center whitespace-nowrap"
                        >
                        <span>Schedule Event</span> <Calendar size={20} className="ml-2" />
                        </button>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10 border-t border-gray-100 pt-10">
                    <div className="md:col-span-2 space-y-8">
                       <div>
                          <h4 className="text-[20pt] font-black text-gray-400 mb-2">Description</h4>
                          <p className="text-gray-700 text-[14pt] leading-relaxed">{selectedCourse.description}</p>
                       </div>
                       <div>
                          <h4 className="text-[20pt] font-black text-gray-400 mb-2">Learning Objectives</h4>
                          <p className="text-gray-700 text-[14pt] leading-relaxed bg-blue-50 p-6 rounded-lg border border-blue-100">{selectedCourse.learningOutcomes || 'No specific objectives listed.'}</p>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                          <h4 className="text-[12pt] font-black text-gray-400 flex items-center mb-4"><Filter size={14} className="mr-2"/> Course Details</h4>
                          <ul className="space-y-4 text-[14pt]">
                             <li className="flex justify-between">
                                <span className="text-gray-600">Category</span>
                                <span className="font-bold text-gray-800 text-right">{selectedCourse.trustCpdCategory}</span>
                             </li>
                             <li className="flex justify-between">
                                <span className="text-gray-600">Region</span>
                                <span className="font-bold text-gray-800 text-right">{selectedCourse.intendedAudience.region || 'Any'}</span>
                             </li>
                             <li className="flex justify-between">
                                <span className="text-gray-600">Date Added</span>
                                <span className="font-bold text-gray-800 text-right">{selectedCourse.createdAt ? new Date(selectedCourse.createdAt).toLocaleDateString() : 'N/A'}</span>
                             </li>
                          </ul>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* VIEW: LIST */}
      {view === 'list' && (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 items-center">
             <div className="flex items-center text-gray-400 mr-2"><ListFilter size={24} /></div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 flex-grow w-full">
                <div className="relative">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input type="text" placeholder="Search courses..." className="w-full pl-12 pr-4 py-3 text-[14pt] border rounded focus:border-coop-blue outline-none" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                </div>

                <select className="w-full px-4 py-3 text-[14pt] border rounded focus:border-coop-blue outline-none bg-white" value={filters.audience} onChange={e => setFilters({...filters, audience: e.target.value})}>
                   <option value="">All Audiences</option>
                   {AUDIENCE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                
                <select className="w-full px-4 py-3 text-[14pt] border rounded focus:border-coop-blue outline-none bg-white" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                   <option value="">All Categories</option>
                   {TRUST_CPD_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>

                <select className="w-full px-4 py-3 text-[14pt] border rounded focus:border-coop-blue outline-none bg-white" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                   <option value="">All Statuses</option>
                   {Object.values(CPDStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select className="w-full px-4 py-3 text-[14pt] border rounded focus:border-coop-blue outline-none bg-white" value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
                   <option value="">Trust Wide</option>
                   {REGION_OPTIONS.filter(r => r !== 'Trust Wide').map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <select className="w-full px-4 py-3 text-[14pt] border rounded focus:border-coop-blue outline-none bg-white font-bold text-coop-dark" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                   <option value="title">Sort: A-Z</option>
                   <option value="created">Sort: Newest</option>
                </select>
             </div>
             
             <button onClick={() => { setFilters({search: '', category: '', status: '', audience: '', region: ''}); setSortBy('title'); }} className="text-[12pt] text-coop-blue font-bold whitespace-nowrap hover:underline">
               Reset
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const categoryData = TRUST_CPD_CATEGORIES.find(c => c.name === course.trustCpdCategory);
                
                return (
                  <div key={course.id} onClick={() => handleCourseClick(course)} className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 cursor-pointer group relative">
                    <div className="p-8 flex-grow">
                      <div className="flex flex-wrap gap-3 mb-4">
                        {categoryData && (
                          <span className={`px-2 py-1 ${categoryData.color} ${categoryData.textColor} text-[12pt] font-bold rounded`}>
                            {categoryData.name}
                          </span>
                        )}
                        {getStatusBadge(course.finalStatus)}
                      </div>
                      
                      <h3 className="text-[20pt] font-bold text-coop-dark mb-4 leading-tight group-hover:text-coop-blue transition-colors">{course.title}</h3>
                      <p className="text-gray-600 text-[14pt] mb-6 line-clamp-3">{course.description}</p>
                      
                      <div className="space-y-3 pt-4 border-t border-gray-50">
                        <div className="flex items-start">
                          <Users size={20} className="text-coop-blue mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <span className="text-[12pt] font-bold text-gray-700 block">Target Audience</span>
                            <span className="text-[12pt] text-gray-600 font-medium">
                                {course.intendedAudience?.main} 
                                {course.targetAudience.length > 0 && ` (${course.targetAudience[0]}${course.targetAudience.length > 1 ? '...' : ''})`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 group-hover:bg-blue-50 transition-colors">
                      <div className="w-full flex items-center justify-center space-x-3 text-coop-blue font-bold text-[16pt]">
                        <span>View Details</span>
                        <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center">
                 <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Search size={40} className="text-gray-400" />
                 </div>
                 <h3 className="text-[20pt] font-bold text-gray-700">No courses found</h3>
                 <p className="text-gray-500 text-[14pt] mt-2">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseCatalog;
