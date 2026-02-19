
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LabelList
} from 'recharts';
import { FacilitatorFormData, Participant, CPDStatus, Region, RoleCategory } from '../types';
import { ACADEMIES, TRUST_CPD_CATEGORIES, TRUST_PRIORITIES } from '../constants';
import { Upload, FileText, Check, X, MapPin, Monitor, Users, TrendingUp, AlertCircle, List, Filter } from 'lucide-react';

interface Props {
  events: FacilitatorFormData[];
  registrations: Participant[];
  onUploadFacilitators?: (emails: string[]) => void;
}

// --- Constants & Config ---
const STATUS_COLORS = ['#d32f2f', '#f57c00', '#00a1cc', '#78909c']; // Statutory, Mandatory, Priority, Optional
const REGION_CONFIG = {
  [Region.GreaterManchester]: { color: '#193c64', label: 'Greater Manchester' },
  [Region.WestYorkshire]: { color: '#64aa8c', label: 'West Yorkshire' },
  [Region.StokeStaffordshire]: { color: '#ffd700', label: 'Stoke & Staffordshire' },
  [Region.Merseyside]: { color: '#f082b4', label: 'Merseyside' },
  [Region.TrustWide]: { color: '#00a1cc', label: 'Trust Wide' },
};

// --- Helper Components ---

const DrillDownModal = ({ 
  isOpen, 
  onClose, 
  title, 
  events 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  events: FacilitatorFormData[] 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h3 className="text-[16pt] font-black text-coop-dark">{title}</h3>
            <p className="text-gray-500 text-sm">{events.length} Events Found</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          {events.length === 0 ? (
             <p className="text-center text-gray-500 py-10">No events found for this category.</p>
          ) : (
            events.map(event => (
                <div key={event.id} className="border border-gray-200 p-4 rounded-xl hover:border-coop-blue hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded text-white
                                    ${event.finalStatus === CPDStatus.Statutory ? 'bg-red-600' : 
                                      event.finalStatus === CPDStatus.Mandatory ? 'bg-orange-500' :
                                      event.finalStatus === CPDStatus.Priority ? 'bg-coop-blue' : 'bg-gray-400'}`}>
                                    {event.finalStatus}
                                </span>
                                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">
                                    {event.trustCpdCategory}
                                </span>
                            </div>
                            <h4 className="text-[14pt] font-bold text-coop-dark">{event.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{event.date} | {event.venue}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase">Audience</p>
                             <p className="text-sm font-medium">{event.intendedAudience.main}</p>
                             {event.intendedAudience.phase && <p className="text-xs text-gray-500">{event.intendedAudience.phase}</p>}
                        </div>
                    </div>
                </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end rounded-b-2xl">
            <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
    <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        <h4 className="text-[16pt] font-black text-coop-dark mb-6 tracking-tight font-sans">{title}</h4>
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-lg z-50 font-sans">
          <p className="text-[12pt] font-black text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
              <p key={index} className="text-[12pt] font-bold" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
          ))}
        </div>
      );
    }
    return null;
};

// --- Main Component ---

const Dashboard: React.FC<Props> = ({ events, registrations, onUploadFacilitators }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Drill-down state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalEvents, setModalEvents] = useState<FacilitatorFormData[]>([]);

  // Academy Attendance Filters
  const [attendanceRegionFilter, setAttendanceRegionFilter] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('');

  // 1. Status Data (Classification Profile)
  const statusData = useMemo(() => [
    { name: 'Statutory', value: events.filter(e => e.finalStatus === CPDStatus.Statutory).length, status: CPDStatus.Statutory },
    { name: 'Mandatory', value: events.filter(e => e.finalStatus === CPDStatus.Mandatory).length, status: CPDStatus.Mandatory },
    { name: 'Priority', value: events.filter(e => e.finalStatus === CPDStatus.Priority).length, status: CPDStatus.Priority },
    { name: 'Optional', value: events.filter(e => e.finalStatus === CPDStatus.Optional).length, status: CPDStatus.Optional },
  ].filter(d => d.value > 0), [events]);

  // 2. Region Data (Registrations)
  const regionData = useMemo(() => {
    const counts: Record<string, number> = {
        [Region.GreaterManchester]: 0,
        [Region.WestYorkshire]: 0,
        [Region.StokeStaffordshire]: 0,
        [Region.Merseyside]: 0,
        [Region.TrustWide]: 0,
    };
    registrations.forEach(reg => {
        if (reg.academy === 'Trust Wide') {
            counts[Region.TrustWide]++;
        } else {
            const academy = ACADEMIES.find(a => a.name === reg.academy);
            const r = academy ? academy.region : Region.TrustWide;
            if (counts[r] !== undefined) counts[r]++;
        }
    });
    return Object.entries(counts).map(([region, count]) => ({
        name: region.replace('Greater ', '').replace(' & Staffordshire', '').replace(' / National', '').split(' ')[0], 
        count: count,
        fullRegion: region,
        color: REGION_CONFIG[region as Region]?.color || '#000'
    })).sort((a, b) => b.count - a.count);
  }, [registrations]);

  // 3. Audience Analysis (Compliance vs Development)
  const audienceAnalysis = useMemo(() => {
    const groups: Record<string, { compliance: number; development: number; total: number }> = {};
    events.forEach(e => {
        const aud = e.intendedAudience.main || 'Unknown';
        if (!groups[aud]) groups[aud] = { compliance: 0, development: 0, total: 0 };
        groups[aud].total++;
        if (e.finalStatus === CPDStatus.Statutory || e.finalStatus === CPDStatus.Mandatory) {
            groups[aud].compliance++;
        } else {
            groups[aud].development++;
        }
    });
    return Object.entries(groups)
        .map(([name, stats]) => ({
            name,
            Compliance: stats.compliance,
            Development: stats.development,
            devRatio: stats.total > 0 ? (stats.development / stats.total) : 0
        }))
        .sort((a, b) => (b.Compliance + b.Development) - (a.Compliance + a.Development));
  }, [events]);

  // 4. Priority Coverage
  const priorityData = useMemo(() => {
      const counts: Record<string, number> = {};
      TRUST_PRIORITIES.forEach(p => counts[p] = 0);
      events.forEach(e => {
          e.trustPriorities.forEach(p => {
              if (counts[p] !== undefined) counts[p]++;
          });
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [events]);

  // 5. Category Coverage
  const categoryData = useMemo(() => {
      const counts: Record<string, number> = {};
      events.forEach(e => {
          if (counts[e.trustCpdCategory]) counts[e.trustCpdCategory]++;
          else counts[e.trustCpdCategory] = 1;
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [events]);

  // 6. Logistics (Form & Venue)
  const logisticsData = useMemo(() => {
      const breakdown: Record<string, number> = {};
      const venueCounts: Record<string, number> = {};
      
      events.forEach(e => {
          // Use subFormType for breakdown, fall back to "Unspecified" or main formType
          const type = e.subFormType || (e.formType === 'Online Live' ? 'Online Live' : (e.formType === 'In-Person' ? 'In-Person' : e.formType));
          const key = type || 'Unspecified';
          breakdown[key] = (breakdown[key] || 0) + 1;

          if (e.venue) venueCounts[e.venue] = (venueCounts[e.venue] || 0) + 1;
      });

      const pieData = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
      const topVenues = Object.entries(venueCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      return { pieData, topVenues, total: events.length };
  }, [events]);

  // 7. Phase / Reach Breakdown
  const phaseData = useMemo(() => {
      const counts: Record<string, number> = {};
      events.forEach(e => {
          const phase = e.intendedAudience.phase || 'Unspecified';
          counts[phase] = (counts[phase] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [events]);

  // 8. Academy Attendance Data
  const academyAttendanceData = useMemo(() => {
      const today = new Date();
      today.setHours(0,0,0,0);

      return ACADEMIES.map(academy => {
          // Filter events based on dashboard controls first
          const filteredEventIds = events.filter(e => {
              const matchStatus = !attendanceStatusFilter || e.finalStatus === attendanceStatusFilter;
              return matchStatus;
          }).map(e => e.id);

          const academyRegs = registrations.filter(r => 
              r.academy === academy.name && 
              filteredEventIds.includes(r.eventId)
          );

          let attended = 0;
          let expected = 0;

          academyRegs.forEach(reg => {
              const event = events.find(e => e.id === reg.eventId);
              if (event) {
                  const evtDate = new Date(event.date);
                  if (evtDate < today) {
                      attended++;
                  } else {
                      expected++;
                  }
              }
          });

          return {
              name: academy.name,
              region: academy.region,
              attended, // Past registrations
              expected, // Future registrations
              total: attended + expected
          };
      })
      .filter(ac => !attendanceRegionFilter || ac.region === attendanceRegionFilter)
      .sort((a, b) => b.total - a.total);
  }, [events, registrations, attendanceRegionFilter, attendanceStatusFilter]);

  // 9. Cohort & Programme Insights
  const cohortEvents = useMemo(() => {
      return events.filter(e => ['defined', 'invite', 'programme'].includes(e.attendanceOption));
  }, [events]);


  // --- Interactions ---

  const handleStatusClick = (data: any) => {
     if (!data) return;
     const status = data.payload.status; 
     const filteredEvents = events.filter(e => e.finalStatus === status);
     setModalTitle(`${status} Events`);
     setModalEvents(filteredEvents);
     setModalOpen(true);
  };

  const handleRegionClick = (data: any) => {
      if (!data) return;
      const region = data.fullRegion;
      const eventIdsInRegion = new Set<string>();
      registrations.forEach(reg => {
          let regRegion = Region.TrustWide;
          if (reg.academy !== 'Trust Wide') {
              const ac = ACADEMIES.find(a => a.name === reg.academy);
              if (ac) regRegion = ac.region;
          }
          if (regRegion === region) eventIdsInRegion.add(reg.eventId);
      });
      const filteredEvents = events.filter(e => eventIdsInRegion.has(e.id));
      setModalTitle(`Events active in ${region}`);
      setModalEvents(filteredEvents);
      setModalOpen(true);
  };

  const handleAudienceClick = (data: any) => {
      if (!data) return;
      const audienceName = data.name;
      const filteredEvents = events.filter(e => e.intendedAudience.main === audienceName);
      setModalTitle(`${audienceName} Events`);
      setModalEvents(filteredEvents);
      setModalOpen(true);
  };

  const handlePriorityClick = (data: any) => {
      if (!data) return;
      const priority = data.name;
      const filteredEvents = events.filter(e => e.trustPriorities.includes(priority));
      setModalTitle(`Events supporting: ${priority}`);
      setModalEvents(filteredEvents);
      setModalOpen(true);
  };

  const handleCategoryClick = (data: any) => {
      if (!data) return;
      const category = data.name;
      const filteredEvents = events.filter(e => e.trustCpdCategory === category);
      setModalTitle(`Category: ${category}`);
      setModalEvents(filteredEvents);
      setModalOpen(true);
  };

  const handleFormatClick = (data: any) => {
      if (!data) return;
      const formatType = data.name; 
      const filteredEvents = events.filter(e => 
          e.subFormType === formatType || e.formType === formatType
      );
      setModalTitle(`${formatType} Events`);
      setModalEvents(filteredEvents);
      setModalOpen(true);
  };

  const handlePhaseClick = (data: any) => {
      if (!data) return;
      const phase = data.name;
      const filteredEvents = events.filter(e => e.intendedAudience.phase === phase);
      setModalTitle(`Phase: ${phase}`);
      setModalEvents(filteredEvents);
      setModalOpen(true);
  };

  const handleCsvUpload = () => {
    if (!csvFile || !onUploadFacilitators) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const emails = text
            .split(/\r\n|\n/)
            .map(line => line.split(',')[0].trim())
            .filter(email => email.includes('@') && (email.endsWith('coop.co.uk') || email.endsWith('coopacademies.co.uk')));
        if (emails.length > 0) {
            onUploadFacilitators(emails);
            setUploadStatus('success');
            setCsvFile(null);
            setTimeout(() => setUploadStatus('idle'), 3000);
        } else {
            setUploadStatus('error');
        }
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 font-sans">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border-b-4 border-coop-blue transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-400 text-[12pt] font-black uppercase mb-2">Live Events</h3>
          <p className="text-[26pt] font-black text-coop-dark tracking-tighter">{events.length}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border-b-4 border-region-wy transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-400 text-[12pt] font-black uppercase mb-2">Colleague Enrolments</h3>
          <p className="text-[26pt] font-black text-coop-dark tracking-tighter">{registrations.length}</p>
        </div>
         <div className="bg-white p-8 rounded-2xl shadow-sm border-b-4 border-region-stoke transition-transform hover:scale-[1.02]">
          <h3 className="text-gray-400 text-[12pt] font-black uppercase mb-2">Avg Engagement</h3>
          <p className="text-[26pt] font-black text-coop-dark tracking-tighter">
            {events.length > 0 ? (registrations.length / events.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Admin Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[20pt] font-black text-coop-dark mb-4">PDI Administration</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
                <p className="text-gray-600 mb-2 text-[14pt]">Manage Facilitator Access</p>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-coop-blue hover:bg-gray-50 transition-colors">
                        <Upload size={20} className="text-gray-400 mr-2"/>
                        <span className="text-gray-500 font-bold text-[14pt]">{csvFile ? csvFile.name : "Select CSV File"}</span>
                        <input type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                    </label>
                    <button 
                        onClick={handleCsvUpload} 
                        disabled={!csvFile}
                        className="bg-coop-blue text-white px-6 py-2 rounded-lg font-bold text-[14pt] disabled:opacity-50 hover:bg-coop-dark transition-colors"
                    >
                        Grant Access
                    </button>
                    {uploadStatus === 'success' && <span className="text-green-600 flex items-center font-bold text-[14pt]"><Check size={20} className="mr-1"/> Updated!</span>}
                    {uploadStatus === 'error' && <span className="text-red-500 font-bold text-[14pt]">No valid emails found.</span>}
                </div>
            </div>
            <div className="h-16 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex-1">
                 <div className="flex items-center space-x-2 text-gray-500">
                    <FileText size={20}/>
                    <span className="text-[14pt]">Download Attendance Report</span>
                 </div>
                 <button className="text-coop-blue font-bold hover:underline mt-1 text-[14pt]">Generate CSV</button>
            </div>
        </div>
      </div>

      {/* --- INSIGHTS ROW 1: Classification & Region --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Classification Profile */}
        <InsightCard title="Classification Profile">
          <div className="flex justify-between items-center mb-4">
             <div className="bg-gray-100 px-4 py-2 rounded-full text-[12pt] font-bold text-gray-500">Stage 1 Outcomes</div>
             <span className="text-xs text-blue-500 flex items-center"><Monitor size={14} className="mr-1"/> Click segment to drill down</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  onClick={handleStatusClick}
                  className="cursor-pointer focus:outline-none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} stroke="none" className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12pt' }} />
                <Legend verticalAlign="bottom" height={40} iconType="circle" formatter={(value) => <span className="text-[14pt] font-bold text-gray-600 px-2 font-sans">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </InsightCard>

        {/* Regional Distribution */}
        <InsightCard title="Regional Distribution">
           <div className="flex justify-between items-center mb-4">
             <div className="bg-blue-50 px-4 py-2 rounded-full text-[12pt] font-bold text-coop-blue">Colleague Reach</div>
             <span className="text-xs text-blue-500 flex items-center"><Monitor size={14} className="mr-1"/> Click bar to see events</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: '14px', fontWeight: 700, fontFamily: 'sans-serif' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: '14px', fontWeight: 700, fontFamily: 'sans-serif' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} animationBegin={200} animationDuration={1800} onClick={handleRegionClick} className="cursor-pointer">
                  {regionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity"/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InsightCard>
      </div>

      {/* --- INSIGHTS ROW 2: Audience Analysis (Compliance vs Development) --- */}
      <div className="grid grid-cols-1 gap-10">
        <InsightCard title="Audience Development Analysis">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
                <p className="text-gray-500 text-[14pt] max-w-2xl font-sans">
                    Analysing the balance between <strong>Compliance</strong> (Statutory/Mandatory) and <strong>Developmental</strong> (Priority/Optional) training across different roles. 
                </p>
                <div className="mt-4 md:mt-0 flex gap-4 text-[14pt] font-bold font-sans">
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div>Compliance</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-2"></div>Development</div>
                </div>
             </div>

             <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={audienceAnalysis} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={handleAudienceClick} className="cursor-pointer">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={180} axisLine={false} tickLine={false} tick={{ fontSize: '14px', fontWeight: 600, fill: '#333', fontFamily: 'sans-serif' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="Compliance" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]} />
                        <Bar dataKey="Development" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
             
             {/* Narrative Insight */}
             <div className="mt-6 bg-yellow-50 p-6 rounded-xl border border-yellow-200 flex items-start gap-4 font-sans text-[14pt]">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                <div>
                    <h5 className="font-bold text-yellow-800 text-[14pt]">Key Insight</h5>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-yellow-900">
                        {audienceAnalysis.map(aud => {
                            if (aud.devRatio < 0.3) return <li key={aud.name}><strong>{aud.name}</strong> has a heavy focus on compliance ({((1-aud.devRatio)*100).toFixed(0)}%), with limited developmental opportunities currently scheduled.</li>
                            if (aud.devRatio > 0.7) return <li key={aud.name}><strong>{aud.name}</strong> has a strong developmental offer, with {((aud.devRatio)*100).toFixed(0)}% of sessions focused on growth.</li>
                            return null;
                        })}
                        {audienceAnalysis.every(a => a.devRatio >= 0.3 && a.devRatio <= 0.7) && <li>There is a generally balanced spread of compliance and development across all roles.</li>}
                    </ul>
                </div>
             </div>
        </InsightCard>
      </div>

      {/* --- INSIGHTS ROW 3: Categories & Priorities --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <InsightCard title="Trust Strategic Priorities Coverage">
            <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar cursor-pointer">
                {priorityData.map((item, idx) => (
                    <div key={idx} className="mb-4 hover:bg-gray-50 p-2 rounded transition-colors" onClick={() => handlePriorityClick(item)}>
                        <div className="flex justify-between mb-1 text-[14pt] font-bold text-gray-700 font-sans">
                            <span>{item.name}</span>
                            <span>{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div 
                                className="bg-coop-blue h-3 rounded-full transition-all duration-1000" 
                                style={{ width: `${(item.value / Math.max(...priorityData.map(d => d.value))) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
         </InsightCard>

         <InsightCard title="CPD Category Distribution">
             {/* Make the chart area scrollable by setting a fixed container height and allowing overflow */}
             <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Dynamically set height to allow scrolling if many items */}
                <div style={{ height: Math.max(400, categoryData.length * 60) }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} onClick={handleCategoryClick} className="cursor-pointer">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={10} hide />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="value" fill="#8884d8" radius={[0, 8, 8, 0]} barSize={30}>
                                {categoryData.map((entry, index) => {
                                    const cat = TRUST_CPD_CATEGORIES.find(c => c.name === entry.name);
                                    return <Cell key={`cell-${index}`} fill={cat?.color.replace('bg-', '').replace('text-', '') || '#8884d8'} />; 
                                })}
                                <LabelList dataKey="name" position="insideLeft" style={{ fill: '#fff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'sans-serif' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
         </InsightCard>
      </div>

      {/* --- INSIGHTS ROW 4: Logistics & Phase --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-[16pt] font-black text-coop-dark mb-6 font-sans">Delivery Format</h4>
                <div className="flex items-center justify-center h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart onClick={handleFormatClick} className="cursor-pointer">
                            <Pie
                                data={logisticsData.pieData}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {logisticsData.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f97316'][index % 5]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-2xl font-black text-gray-700">{logisticsData.total}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold">Events</span>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {logisticsData.pieData.map((d, i) => (
                         <div key={d.name} className="flex items-center text-sm text-gray-600 font-sans">
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f97316'][i % 5]}}></div>
                            {d.name} ({d.value})
                         </div>
                    ))}
                </div>
            </div>

            {/* New Insight: Phase/Reach */}
            <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-[16pt] font-black text-coop-dark mb-6 font-sans">Phase & Reach</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart onClick={handlePhaseClick} className="cursor-pointer">
                            <Pie
                                data={phaseData}
                                cx="50%" cy="50%"
                                outerRadius={80}
                                dataKey="value"
                            >
                                {phaseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs font-sans">
                    {phaseData.map((p, i) => (
                        <div key={p.name} className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][i % 5]}}></div>
                            {p.name} ({p.value})
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-[16pt] font-black text-coop-dark mb-6 font-sans">Top Venues</h4>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {logisticsData.topVenues.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 font-sans">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm text-coop-blue font-bold w-6 h-6 text-xs flex items-center justify-center">
                                    {i + 1}
                                </div>
                                <span className="font-bold text-gray-700 text-sm truncate max-w-[150px] text-[14pt]">{v.name}</span>
                            </div>
                            <span className="text-xs bg-coop-dark text-white px-2 py-1 rounded-md font-bold">{v.value} Events</span>
                        </div>
                    ))}
                </div>
            </div>
      </div>

      {/* --- NEW INSIGHT: ACADEMY ATTENDANCE TRACKER --- */}
      <InsightCard title="Academy Attendance Tracker">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 font-sans">
              <p className="text-gray-500 text-[14pt] max-w-xl">
                  Tracking <strong>Attended</strong> (Past events) and <strong>Expected</strong> (Registered for Future events) engagement per academy.
              </p>
              <div className="flex gap-4">
                  <select 
                    className="border p-2 rounded text-[14pt] outline-none focus:border-coop-blue"
                    value={attendanceRegionFilter}
                    onChange={e => setAttendanceRegionFilter(e.target.value)}
                  >
                      <option value="">All Regions</option>
                      {Object.keys(REGION_CONFIG).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select 
                    className="border p-2 rounded text-[14pt] outline-none focus:border-coop-blue"
                    value={attendanceStatusFilter}
                    onChange={e => setAttendanceStatusFilter(e.target.value)}
                  >
                      <option value="">All Classifications</option>
                      {Object.values(CPDStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </div>
          </div>
          
          <div className="h-[500px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academyAttendanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={220} axisLine={false} tickLine={false} tick={{ fontSize: '14px', fontWeight: 600, fill: '#333', fontFamily: 'sans-serif' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="attended" name="Attended (Past)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="expected" name="Expected (Future)" stackId="a" fill="#00a1cc" radius={[0, 4, 4, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
      </InsightCard>

      {/* --- NEW INSIGHT: COHORT & PROGRAMMES --- */}
      <InsightCard title="Defined Cohorts & Programme Groups">
          <p className="text-gray-500 mb-6 text-[14pt] font-sans">Tracking events with fixed or invited attendee bases (e.g. NPQs, Network Leads, ECTs).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {cohortEvents.length > 0 ? cohortEvents.map(event => (
                  <div key={event.id} className="border border-l-4 border-l-purple-500 border-gray-200 p-6 rounded-xl hover:shadow-md transition-all bg-purple-50/10">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-700 uppercase">{event.attendanceOption === 'programme' ? 'Programme' : 'Cohort / Invite'}</span>
                          <span className="text-xs text-gray-400">{event.date}</span>
                      </div>
                      <h5 className="font-bold text-coop-dark text-lg mb-2">{event.title}</h5>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-xs font-bold text-gray-500">
                          <Users size={14} className="mr-1"/> 
                          {event.intendedAudience.main} {event.intendedAudience.sub ? `(${event.intendedAudience.sub})` : ''}
                      </div>
                  </div>
              )) : (
                  <div className="col-span-full text-center py-10 text-gray-400 italic">No cohort-specific events found.</div>
              )}
          </div>
      </InsightCard>

      <DrillDownModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
        events={modalEvents} 
      />
    </div>
  );
};

export default Dashboard;
