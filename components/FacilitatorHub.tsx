
import React from 'react';
import { CPDProposal, FacilitatorFormData } from '../types';
import { Plus, ChevronRight, Clock, CheckCircle, AlertTriangle, XCircle, Play } from 'lucide-react';

interface Props {
  proposals: CPDProposal[]; // Proposals submitted by this user
  onStartStage2: (proposal: CPDProposal) => void;
  onCreateNew: () => void;
}

const FacilitatorHub: React.FC<Props> = ({ proposals, onStartStage2, onCreateNew }) => {
  const approved = proposals.filter(p => p.status === 'Approved');
  const pending = proposals.filter(p => p.status === 'Pending' || p.status === 'More Detail Required');
  const declined = proposals.filter(p => p.status === 'Declined');

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-coop-blue flex justify-between items-center">
        <div>
            <h2 className="text-[26pt] font-bold text-coop-dark mb-1">Facilitator Hub</h2>
            <p className="text-gray-600 text-[14pt]">Manage your CPD proposals. Start new ideas in the Catalogue, track approval status, and complete full setup for approved events.</p>
        </div>
        <button onClick={onCreateNew} className="bg-coop-dark text-white px-6 py-3 rounded-lg font-bold flex items-center hover:bg-coop-blue transition-colors">
            <Plus size={20} className="mr-2"/> New Proposal (Catalogue)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ACTION REQUIRED / APPROVED */}
        <div className="space-y-6">
            <h3 className="text-[18pt] font-black text-gray-700 border-b pb-2">Ready for Setup (Stage 2)</h3>
            {approved.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-500 border border-dashed border-gray-300">
                    No approved proposals waiting for setup.
                </div>
            ) : (
                approved.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center text-green-600 font-bold text-sm mb-1">
                                    <CheckCircle size={16} className="mr-1"/> Approved - Ready for Design
                                </div>
                                <h4 className="text-[16pt] font-bold text-coop-dark">{p.title}</h4>
                                <p className="text-gray-500 mt-1">{p.trustCpdCategory} | {p.proposedStatus}</p>
                            </div>
                            <button 
                                onClick={() => onStartStage2(p)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-green-700 transition-colors shadow"
                            >
                                Complete Setup <Play size={16} className="ml-2"/>
                            </button>
                        </div>
                        {p.feedback && (
                            <div className="mt-4 bg-green-50 p-3 rounded text-sm text-green-800 border border-green-100">
                                <strong>PDI Feedback:</strong> {p.feedback}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>

        {/* PENDING & HISTORY */}
        <div className="space-y-6">
            <h3 className="text-[18pt] font-black text-gray-700 border-b pb-2">Pending & History</h3>
            <div className="space-y-4">
                {pending.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-90">
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${p.status === 'More Detail Required' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {p.status}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-[14pt] font-bold text-gray-700">{p.title}</h4>
                        {p.feedback && (
                            <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                                <strong>Action:</strong> {p.feedback}
                            </div>
                        )}
                    </div>
                ))}
                {declined.map(p => (
                    <div key={p.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 grayscale opacity-75">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700">Declined</span>
                            <span className="text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-[14pt] font-bold text-gray-600">{p.title}</h4>
                        <div className="mt-2 text-sm text-gray-500">
                            <strong>Reason:</strong> {p.feedback}
                        </div>
                    </div>
                ))}
                {pending.length === 0 && declined.length === 0 && (
                    <div className="text-center text-gray-400 py-8">No history to show.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default FacilitatorHub;
