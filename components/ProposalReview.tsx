
import React, { useState } from 'react';
import { CPDProposal, CPDStatus, TriageScore, ProposalDecision } from '../types';
import { TRUST_CPD_CATEGORIES } from '../constants';
import { ClipboardList, CheckCircle, XCircle, AlertCircle, MessageSquare, ChevronRight, User, Calendar, Target, Award } from 'lucide-react';

interface Props {
  proposals: CPDProposal[];
  onTriage: (proposalId: string, decision: ProposalDecision, scores: TriageScore, notes: string, confirmedStatus: CPDStatus) => void;
}

const RUBRIC_CRITERIA = [
  { key: 'strategicAlignment', label: 'A. Strategic Alignment', weight: 'High' },
  { key: 'statusJustification', label: 'B. Status Justification', weight: 'High' },
  { key: 'clarity', label: 'C. Clarity of Purpose', weight: 'High' },
  { key: 'audience', label: 'D. Audience & Reach', weight: 'Normal' },
  { key: 'addedValue', label: 'E. Added Value', weight: 'High' },
  { key: 'feasibility', label: 'F. Feasibility', weight: 'Normal' },
  { key: 'impact', label: 'G. Likely Impact', weight: 'Normal' }
];

const ProposalReview: React.FC<Props> = ({ proposals, onTriage }) => {
  const [selectedProposal, setSelectedProposal] = useState<CPDProposal | null>(null);
  
  // Triage Form State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [confirmedStatus, setConfirmedStatus] = useState<CPDStatus>(CPDStatus.Optional);

  const pendingProposals = proposals.filter(p => p.status === 'Pending');

  const handleSelect = (p: CPDProposal) => {
    setSelectedProposal(p);
    setScores(RUBRIC_CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {}));
    setNotes('');
    setConfirmedStatus(p.proposedStatus);
  };

  const handleScoreChange = (key: string, value: number) => {
    setScores({ ...scores, [key]: value });
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const getSuggestedDecision = (score: number) => {
    if (score >= 18) return 'Approve';
    if (score >= 13) return 'More Detail Required';
    return 'Decline';
  };

  const submitTriage = (decision: ProposalDecision) => {
    if (selectedProposal) {
      onTriage(selectedProposal.id, decision, scores as unknown as TriageScore, notes, confirmedStatus);
      setSelectedProposal(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-purple-600">
        <h2 className="text-[26pt] font-bold text-coop-dark">PDI Triage Panel</h2>
        <p className="text-gray-600 text-[14pt]">Review pending CPD proposals using the Trust rubric (A-G). Decisions trigger email notifications to facilitators.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LIST */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-500 uppercase text-sm">Pending Proposals ({pendingProposals.length})</h3>
          {pendingProposals.length === 0 && <div className="bg-gray-50 p-6 rounded text-gray-500 italic">No proposals awaiting triage.</div>}
          {pendingProposals.map(p => (
            <div 
                key={p.id} 
                onClick={() => handleSelect(p)}
                className={`bg-white p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${selectedProposal?.id === p.id ? 'border-purple-600 ring-2 ring-purple-100' : 'border-gray-200 hover:border-purple-300'}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">Stage 1</span>
                    <span className="text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-coop-dark text-lg leading-tight">{p.title}</h4>
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                    <User size={14} className="mr-1"/> {p.submittedBy.name}
                </div>
            </div>
          ))}
        </div>

        {/* DETAIL & SCORING */}
        <div className="xl:col-span-2">
            {selectedProposal ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {/* Proposal Details */}
                    <div className="p-8 border-b border-gray-200 bg-gray-50/50">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[22pt] font-black text-coop-dark">{selectedProposal.title}</h3>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Submitted by</div>
                                <div className="font-bold">{selectedProposal.submittedBy.name}</div>
                                <div className="text-xs text-gray-400">{selectedProposal.submittedBy.academy}</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Category</span>{selectedProposal.trustCpdCategory}</div>
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Description</span>{selectedProposal.description}</div>
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Learning Objectives</span>{selectedProposal.learningObjectives}</div>
                            </div>
                            <div className="space-y-4">
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Audience</span>{selectedProposal.targetAudience.phase} - {selectedProposal.targetAudience.roles}</div>
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Proposed Status</span><span className="font-bold text-coop-blue">{selectedProposal.proposedStatus}</span></div>
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Impact</span>{selectedProposal.intendedImpact}</div>
                                <div><span className="block text-xs font-bold text-gray-400 uppercase">Logistics</span>{selectedProposal.roughFormat.type} ({selectedProposal.roughFormat.duration}) - {selectedProposal.dateWindow}</div>
                            </div>
                        </div>
                        {selectedProposal.additionalNotes && (
                            <div className="bg-yellow-50 p-4 rounded text-sm border border-yellow-100 text-yellow-800">
                                <strong>Notes:</strong> {selectedProposal.additionalNotes}
                            </div>
                        )}
                    </div>

                    {/* Rubric Scoring */}
                    <div className="p-8 bg-white space-y-6">
                        <h4 className="text-[16pt] font-bold text-gray-700 flex items-center border-b pb-2"><ClipboardList size={20} className="mr-2"/> Scoring Rubric (0-3)</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {RUBRIC_CRITERIA.map((criteria) => (
                                <div key={criteria.key} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-700 block">{criteria.label}</span>
                                        <span className="text-xs text-gray-400 uppercase font-bold">{criteria.weight === 'High' ? 'High Weight' : 'Normal Weight'}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        {[0, 1, 2, 3].map(score => (
                                            <button 
                                                key={score}
                                                onClick={() => handleScoreChange(criteria.key, score)}
                                                className={`w-8 h-8 rounded font-bold transition-all ${scores[criteria.key] === score ? 'bg-purple-600 text-white shadow-md scale-110' : 'bg-white border text-gray-400 hover:border-purple-300'}`}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Decision Area */}
                        <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <span className="font-bold text-gray-600">Total Score</span>
                                    <div className="text-2xl font-black text-purple-700">{totalScore} <span className="text-sm text-gray-400 font-normal">/ 21</span></div>
                                </div>
                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                    <span className="font-bold text-gray-600">Suggested Action</span>
                                    <div className="font-bold text-coop-dark">{getSuggestedDecision(totalScore)}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Confirm CPD Status</label>
                                    <select className="w-full p-3 border rounded" value={confirmedStatus} onChange={e => setConfirmedStatus(e.target.value as CPDStatus)}>
                                        {Object.values(CPDStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Triage Notes & Feedback (Sent to Facilitator)</label>
                                <textarea 
                                    className="w-full p-4 border rounded h-32 text-sm" 
                                    placeholder="Provide rationale for decision and any required changes..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => submitTriage('Approved')} className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex items-center justify-center"><CheckCircle size={18} className="mr-2"/> Approve (Stage 1)</button>
                                    <button onClick={() => submitTriage('More Detail Required')} className="flex-1 bg-orange-500 text-white py-3 rounded font-bold hover:bg-orange-600 flex items-center justify-center"><AlertCircle size={18} className="mr-2"/> Request Detail</button>
                                    <button onClick={() => submitTriage('Declined')} className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 flex items-center justify-center"><XCircle size={18} className="mr-2"/> Decline</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12">
                    <ClipboardList size={48} className="mb-4 opacity-50"/>
                    <p className="text-xl font-bold">Select a proposal to triage</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProposalReview;
