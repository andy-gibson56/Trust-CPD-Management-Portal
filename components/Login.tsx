import React, { useState } from 'react';
import { User } from '../types';
import { PDI_TEAM_EMAILS, PDI_LOGO } from '../constants';

interface Props {
  onLogin: (user: Pick<User, 'email' | 'name' | 'role'>) => void;
  allowedFacilitators: string[];
}

const Login: React.FC<Props> = ({ onLogin, allowedFacilitators }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@coopacademies.co.uk') && !email.endsWith('@coop.co.uk')) {
      setError('Please use your Co-op Academies email address.');
      return;
    }

    const lowerEmail = email.toLowerCase();
    let role: User['role'] = 'Colleague';

    if (PDI_TEAM_EMAILS.includes(lowerEmail)) {
      role = 'PDI';
    } else if (allowedFacilitators.includes(lowerEmail)) {
      role = 'Facilitator';
    }

    const name = email.split('@')[0].replace('.', ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    onLogin({ email: lowerEmail, name: formattedName, role });
  };

  return (
    <div className="min-h-screen bg-coop-dark flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-8">
        <img 
          src={PDI_LOGO} 
          alt="Co-op Academies PDI" 
          className="h-24 mx-auto" 
        />
        
        <div className="space-y-2">
            <h1 className="text-[20pt] font-black text-coop-dark">CPD Management Portal</h1>
            <p className="text-gray-500 text-[12pt]">Please sign in with your Trust Google Account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-2">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <input 
                    type="email" 
                    required 
                    placeholder="name@coopacademies.co.uk"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg outline-none focus:border-coop-blue text-[14pt]"
                    value={email}
                    onChange={e => {setEmail(e.target.value); setError('');}}
                />
                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            </div>

            <button 
                type="submit" 
                className="w-full bg-[#4285F4] text-white p-4 rounded-lg font-bold text-[14pt] flex items-center justify-center hover:bg-[#357ae8] transition-colors shadow-lg"
            >
                <svg className="w-6 h-6 mr-3 bg-white rounded-full p-1" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </button>
        </form>

        <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500">
            <p>Access is managed via the PDI Team.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;