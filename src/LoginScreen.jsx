import React, { useState } from 'react';
import { MdAssignment, MdSchool, MdLock, MdArrowForward } from 'react-icons/md';
import { FaMobileAlt } from 'react-icons/fa';
import { GOOGLE_SCRIPT_URL } from './Config';

export default function LoginScreen({ onLoginSuccess }) {
  const [kendraNumber, setKendraNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedKendra = kendraNumber.trim();
    const trimmedPin = pin.trim();

    if (!trimmedKendra || !trimmedPin) return window.alert("ભૂલ: વિગતો અધૂરી છે.");
    
    setLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        // 🔴 જૂનું: headers: { 'Content-Type': 'application/json' },
        // 🟢 નવું (CORS એરર સોલ્વ કરવા માટે):
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', kendra: trimmedKendra, pin: trimmedPin })
      });
      const result = await response.json();
      
      if (result.result === 'success') {
        const sessionData = { 
            kendra: trimmedKendra, 
            name: result.schoolName,
            role: result.role || 'user',
            schoolType: result.schoolType || 'મિશ્ર' 
        };

        // વેબ માટે localStorage નો ઉપયોગ
        localStorage.setItem('@mdm_auth_session', JSON.stringify(sessionData));
        onLoginSuccess(sessionData); 
      } else {
        window.alert("નિષ્ફળ: કેન્દ્ર નંબર અથવા પિન ખોટો છે.");
      }
    } catch (e) {
      window.alert("Error: સર્વર કનેક્શન એરર.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* 🎨 PC માટે ખાસ CSS Styles */}
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .login-container { display: flex; height: 100vh; width: 100%; background-color: #f8fafc; }
        
        /* ડાબી બાજુની બ્રાન્ડ પેનલ (PC માં દેખાશે) */
        .left-panel { flex: 1.2; background: linear-gradient(135deg, #ea580c 0%, #9a3412 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 40px; text-align: center; }
        .logo-circle { width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 20px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .brand-title { font-size: 42px; font-weight: 900; letter-spacing: 2px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .brand-subtitle { font-size: 18px; color: #fed7aa; margin-top: 10px; font-weight: 500; }
        .contact-chip { background: rgba(0,0,0,0.2); padding: 10px 20px; border-radius: 30px; margin-top: 40px; font-size: 14px; font-weight: bold; letter-spacing: 1px; }

        /* જમણી બાજુની ફોર્મ પેનલ */
        .right-panel { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; background-color: #f1f5f9; }
        .login-card { width: 100%; max-width: 450px; background: white; padding: 50px 40px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); transition: transform 0.3s ease; }
        .login-card:hover { transform: translateY(-5px); }
        
        .form-header { text-align: center; margin-bottom: 35px; }
        .form-icon { background: #fff7ed; width: 70px; height: 70px; border-radius: 35px; display: flex; justify-content: center; align-items: center; margin: 0 auto 15px auto; color: #ea580c; border: 1px solid #ffedd5; }
        .form-title { font-size: 26px; font-weight: bold; color: #1e293b; margin: 0 0 8px 0; }
        .form-subtitle { font-size: 15px; color: #64748b; margin: 0; }

        .input-group { margin-bottom: 22px; }
        .input-label { display: block; font-size: 14px; color: #334155; font-weight: 600; margin-bottom: 8px; padding-left: 4px; }
        .input-wrapper { display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 0 16px; transition: all 0.3s ease; }
        .input-wrapper:focus-within { border-color: #ea580c; background: #fff; box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1); }
        .input-icon { color: #94a3b8; margin-right: 12px; transition: color 0.3s; }
        .input-wrapper:focus-within .input-icon { color: #ea580c; }
        .login-input { flex: 1; border: none; background: transparent; padding: 16px 0; font-size: 16px; color: #1e293b; outline: none; }

        .login-btn { background: #ea580c; color: white; border: none; padding: 16px; width: 100%; border-radius: 14px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.3s ease; margin-top: 10px; box-shadow: 0 8px 15px rgba(234, 88, 12, 0.3); }
        .login-btn:hover:not(:disabled) { background: #c2410c; transform: translateY(-2px); box-shadow: 0 12px 20px rgba(234, 88, 12, 0.4); }
        .login-btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* નાની સ્ક્રીન (Mobile) માટે ડાબી પેનલ છુપાવી દેવા */
        @media (max-width: 900px) {
          .left-panel { display: none; }
        }
      `}</style>

      <div className="login-container">
        
        {/* 🌟 Left Panel (Branding) - PC માં અદભુત દેખાશે */}
        <div className="left-panel">
          <div className="logo-circle">
            <FaMobileAlt size={45} color="#FFF" />
          </div>
          <h1 className="brand-title">SAMRAT MOBILE</h1>
          <p className="brand-subtitle">MDM Data Management System</p>
          <div className="contact-chip">
            📞 +91 84010 91051 &nbsp;|&nbsp; 80008 19393
          </div>
        </div>

        {/* 📝 Right Panel (Login Form) */}
        <div className="right-panel">
          <div className="login-card">
            
            <div className="form-header">
              <div className="form-icon">
                <MdAssignment size={35} />
              </div>
              <h2 className="form-title">MDM Daily Reporting</h2>
              <p className="form-subtitle">તમારી વિગતો સાથે લોગિન કરો</p>
            </div>

            <div className="input-group">
              <label className="input-label">કેન્દ્ર નંબર</label>
              <div className="input-wrapper">
                <MdSchool size={22} className="input-icon" />
                <input 
                  type="number"
                  className="login-input" 
                  placeholder="Kendra Number" 
                  value={kendraNumber} 
                  onChange={(e) => setKendraNumber(e.target.value)} 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">સિક્યુરિટી પિન</label>
              <div className="input-wrapper">
                <MdLock size={22} className="input-icon" />
                <input 
                  type="password"
                  maxLength={4}
                  className="login-input" 
                  placeholder="4-Digit PIN" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)} 
                />
              </div>
            </div>

            <button 
              className="login-btn" 
              onClick={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>લોગિન કરો</span>
                  <MdArrowForward size={22} />
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}