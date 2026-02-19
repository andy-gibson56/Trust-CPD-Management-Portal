import React, { useState } from 'react';
import { FacilitatorFormData, CPDStatus, RoleCategory, Participant } from '../types';
import { ACADEMIES, TRUST_CPD_CATEGORIES } from '../constants';
import { MapPin, Clock, Calendar, AlertTriangle, CheckCircle, Star, Circle, Info, Lock, UserPlus, Bell, RefreshCw, Users, User } from 'lucide-react';
import { askAboutVenue } from '../services/geminiService';

interface Props {
  events: FacilitatorFormData[];
  registrations: Participant[];
  onRegister: (eventId: string, details: any, status: 'Registered' | 'Requested' | 'Waitlisted') => void;
}

const ParticipantPortal: React.FC<Props> = ({ events, registrations, onRegister }) => {
  const [selectedEvent, setSelectedEvent] = useState<FacilitatorFormData | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isWaitlisting, setIsWaitlisting] = useState(false);
  
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    academy: '',
    role: '' as RoleCategory,
    accessibility: '',
    dietary: '',
    consent: false
  });

  const [venueInfo, setVenueInfo] = useState<string | null>(null);

  const triggerZapierWebhook = async (data: any) => {
    console.log("Triggering Zapier Webhook: Exporting to Google Sheet Register...", data);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      const status = isWaitlisting ? 'Waitlisted' : (selectedEvent.isRequestOnly ? 'Requested' : 'Registered');
      
      const details = {
        fullName: regForm.fullName,
        email: regForm.email,
        academy: regForm.academy,
        role: regForm.role,
        accessibilityNeeds: regForm.accessibility,
        dietaryRequirements: regForm.dietary,
      };

      onRegister(selectedEvent.id, details, status);
      
      if (status === 'Registered') {
        await triggerZapierWebhook({ ...details, eventTitle: selectedEvent.title, eventDate: selectedEvent.date });
      }

      setShowRegistration(false);
      setSelectedEvent(null);
      setIsWaitlisting(false);
      alert(status === 'Registered' ? "Registration Successful! Added to portal and Trust registers." : "Interest logged. You will be updated shortly.");
    }
  };

  const getEventState = (event: FacilitatorFormData) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const count = registrations.filter(r => r.eventId === event.id).length;
    const isPast = eventDate < today;
    const isFull = count >= event.capacity;

    if (isPast) return 'past';
    if (isFull) return 'full';
    if (event.isRequestOnly) return 'request';
    return 'open';
  };

  const getStatusBadge = (status: CPDStatus) => {
    switch (status) {
      case CPDStatus.Statutory:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[12pt] font-bold bg-red-600 text-white"><AlertTriangle size={14} className="mr-1"/> Statutory</span>;
      case CPDStatus.Mandatory:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[12pt] font-bold bg-orange-500 text-white"><CheckCircle size={14} className="mr-1"/> Mandatory</span>;
      case CPDStatus.Priority:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[12pt] font-bold bg-coop-blue text-white"><Star size={14} className="mr-1"/> Priority</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[12pt] font-bold bg-gray-400 text-white"><Circle size={14} className="mr-1"/> Optional</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-coop-blue flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 max-w-4xl">
          <h2 className="text-[26pt] font-bold text-coop-dark">Professional Journey Portal</h2>
          <p className="text-[14pt] text-gray-500">Your hub for professional growth. Browse upcoming CPD events, register for sessions relevant to your role, request places on restricted courses, or join waiting lists for fully booked sessions to ensure you never miss a learning opportunity.</p>
        </div>
        <div className="flex gap-4 text-[12pt] flex-shrink-0">
          <span className="flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded">● Upcoming</span>
          <span className="flex items-center px-3 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded">● Past / Full</span>
        </div>
      </div>

      {!showRegistration ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event) => {
            const state = getEventState(event);
            const regCount = registrations.filter(r => r.eventId === event.id).length;
            const categoryData = TRUST_CPD_CATEGORIES.find(c => c.name === event.trustCpdCategory);
            
            return (
              <div key={event.id} className={`bg-white rounded-lg shadow-sm transition-all flex flex-col border-t-4 ${categoryData ? categoryData.border : 'border-gray-200'} ${state === 'past' || state === 'full' ? 'grayscale opacity-75' : 'hover:shadow-md'}`}>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                        {getStatusBadge(event.finalStatus)}
                        {categoryData && (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[12pt] font-bold ${categoryData.color} ${categoryData.textColor}`}>
                                {categoryData.name}
                            </span>
                        )}
                    </div>
                    <div className="text-[12pt] font-bold text-gray-400 flex items-center">
                        <Users size={16} className="mr-1" /> {regCount} / {event.capacity}
                    </div>
                  </div>
                  
                  <h3 className="text-[20pt] font-bold text-coop-dark leading-tight mb-3">{event.title}</h3>
                  <p className="text-gray-500 text-[14pt] mb-6 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center text-[12pt] text-gray-600"><Calendar size={16} className="mr-2 text-coop-blue"/> {event.date}</div>
                    <div className="flex items-center text-[12pt] text-gray-600"><Clock size={16} className="mr-2 text-coop-blue"/> {event.startTime} - {event.endTime}</div>
                    <div className="flex items-center text-[12pt] text-gray-600"><MapPin size={16} className="mr-2 text-coop-blue"/> {event.venue || event.location}</div>
                    <div className="flex items-center text-[12pt] text-gray-600"><User size={16} className="mr-2 text-coop-blue"/> {event.facilitators && event.facilitators.length > 0 ? event.facilitators[0].name : 'Facilitator TBC'}</div>
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50/50 rounded-b-lg">
                  {state === 'open' && (
                    <button 
                      onClick={() => { setSelectedEvent(event); setShowRegistration(true); setIsWaitlisting(false); }}
                      className="w-full bg-coop-blue text-white py-3 rounded font-bold text-[16pt] flex items-center justify-center hover:bg-coop-dark transition-colors"
                    >
                      <UserPlus size={20} className="mr-2"/> Register Now
                    </button>
                  )}
                  {state === 'request' && (
                    <button 
                      onClick={() => { setSelectedEvent(event); setShowRegistration(true); setIsWaitlisting(false); }}
                      className="w-full bg-white text-coop-dark border-2 border-coop-dark py-3 rounded font-bold text-[16pt] flex items-center justify-center hover:bg-coop-dark hover:text-white transition-all"
                    >
                      <Lock size={20} className="mr-2"/> Request to Attend
                    </button>
                  )}
                  {state === 'full' && (
                    <div className="space-y-3">
                       <button 
                        onClick={() => { setSelectedEvent(event); setShowRegistration(true); setIsWaitlisting(true); }}
                        className="w-full bg-orange-500 text-white py-3 rounded font-bold text-[16pt] flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <Bell size={20} className="mr-2"/> Notify Me of Space
                      </button>
                      <div className="text-[12pt] text-center text-gray-500 italic">Event capacity reached.</div>
                    </div>
                  )}
                  {state === 'past' && (
                    <div className="space-y-3">
                      <div className="bg-gray-200 text-gray-500 py-3 rounded font-bold text-[16pt] text-center">Event Concluded</div>
                      {event.isRepeated === 'Repeated on multiple dates with same content' && (
                        <div className="text-[12pt] text-coop-blue flex items-center justify-center">
                          <RefreshCw size={14} className="mr-1" /> Repeated Series
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
           {selectedEvent && (
            <>
              <div className="bg-coop-dark text-white p-8 relative">
                 <button onClick={() => setShowRegistration(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><Info size={28} /></button>
                 <span className="text-[12pt] font-bold text-coop-blue mb-2 block">Registration Entry</span>
                 <h2 className="text-[26pt] font-bold">{selectedEvent.title}</h2>
                 <p className="text-[14pt] opacity-70 mt-2 mb-4">{isWaitlisting ? "Joining Notification List" : (selectedEvent.isRequestOnly ? "Requesting Place" : "Direct Registration")}</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/20 text-[12pt] font-medium text-gray-300">
                    <div className="flex items-center"><Calendar size={16} className="mr-2 text-coop-blue"/> {selectedEvent.date}</div>
                    <div className="flex items-center"><Clock size={16} className="mr-2 text-coop-blue"/> {selectedEvent.startTime} - {selectedEvent.endTime}</div>
                    <div className="flex items-center"><MapPin size={16} className="mr-2 text-coop-blue"/> {selectedEvent.venue || selectedEvent.location}</div>
                    <div className="flex items-center"><User size={16} className="mr-2 text-coop-blue"/> {selectedEvent.facilitators?.[0]?.name || 'Facilitator TBC'}</div>
                 </div>
              </div>

              <div className="p-10">
                <form onSubmit={handleRegisterSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[16pt] font-bold text-gray-500 mb-2">Full Name</label>
                      <input required className="w-full border-b-2 border-gray-200 focus:border-coop-blue p-3 text-[14pt] outline-none transition-colors" value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[16pt] font-bold text-gray-500 mb-2">Co-op Email</label>
                      <input type="email" required className="w-full border-b-2 border-gray-200 focus:border-coop-blue p-3 text-[14pt] outline-none transition-colors" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[16pt] font-bold text-gray-500 mb-2">Academy / Work Location</label>
                      <select required className="w-full border-b-2 border-gray-200 focus:border-coop-blue p-3 text-[14pt] outline-none transition-colors" value={regForm.academy} onChange={e => setRegForm({...regForm, academy: e.target.value})}>
                        <option value="">Select...</option>
                        <option value="Central Team">Central Team</option>
                        {ACADEMIES.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[16pt] font-bold text-gray-500 mb-2">Role Category</label>
                      <select required className="w-full border-b-2 border-gray-200 focus:border-coop-blue p-3 text-[14pt] outline-none transition-colors" value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value as RoleCategory})}>
                        <option value="">Select...</option>
                        {Object.values(RoleCategory).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[16pt] font-bold text-gray-500 mb-2">Accessibility / Dietary</label>
                    <textarea rows={2} className="w-full border-b-2 border-gray-200 focus:border-coop-blue p-3 text-[14pt] outline-none transition-colors" placeholder="List any requirements..." value={regForm.accessibility} onChange={e => setRegForm({...regForm, accessibility: e.target.value})} />
                  </div>

                  <div className="flex items-start bg-gray-50 p-6 rounded text-[12pt] text-gray-600 border border-gray-200">
                    <input type="checkbox" required className="mt-1 mr-4 w-5 h-5" checked={regForm.consent} onChange={e => setRegForm({...regForm, consent: e.target.checked})} />
                    <span>I confirm I am a Co-op Academies Trust colleague. I understand my details will be added to the event portal register and exported to the facilitator's Google Sheet tracking for attendance purposes.</span>
                  </div>

                  <div className="flex gap-6">
                    <button type="button" onClick={() => setShowRegistration(false)} className="flex-1 py-4 text-gray-500 font-bold text-[16pt]">Cancel</button>
                    <button type="submit" className="flex-[2] bg-coop-blue text-white py-4 rounded font-bold text-[16pt] shadow-lg hover:bg-coop-dark transition-all">
                      {isWaitlisting ? "Notify Me" : (selectedEvent.isRequestOnly ? "Submit Request" : "Complete Registration")}
                    </button>
                  </div>
                </form>
              </div>
            </>
           )}
        </div>
      )}
    </div>
  );
};

export default ParticipantPortal;