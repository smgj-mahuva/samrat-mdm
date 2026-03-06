import React, { useState, useEffect } from 'react';
import { MdEvent, MdCheckCircle, MdError, MdCloudUpload, MdBeachAccess } from 'react-icons/md';
import MDMCategory from './MDMCategory'; 
import { SyncService } from './SyncService'; 
import { GOOGLE_SCRIPT_URL } from './Config'; 

const TABS = ['બાલવાટીકા', 'ધો. ૧ થી ૫', 'ધો. ૬ થી ૮', 'અલ્પાહાર'];

const AsyncStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  getAllKeys: async () => Object.keys(localStorage),
};

const getMenuForDate = (dateObj) => {
    if (!dateObj) return "";
    const dayIndex = dateObj.getDay(); 
    const menuMap = { 1: "વેજ. પુલાવ-શાક", 2: "દાળ-ઢોકળી-શાક", 3: "દાળ-ભાત-શાક", 4: "દાળ-ઢોકળી-શાક", 5: "વેજ. મુઠીયા-શાક", 6: "વેજ. ખિચડી-દાળ", 0: "રવિવારની રજા" };
    return menuMap[dayIndex] || "મેનુ નક્કી નથી";
};

export default function DailyReport({ kendraNumber }) {
  const [activeTab, setActiveTab] = useState('ધો. ૧ થી ૫');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({}); 
  const [schoolType, setSchoolType] = useState('મિશ્ર'); 
  
  const [isGlobalHoliday, setIsGlobalHoliday] = useState(false);
  const [globalHolidayReason, setGlobalHolidayReason] = useState('');

  const [dayData, setDayData] = useState({
    'બાલવાટીકા': getDefaultsForTab('બાલવાટીકા'),
    'ધો. ૧ થી ૫': getDefaultsForTab('ધો. ૧ થી ૫'),
    'ધો. ૬ થી ૮': getDefaultsForTab('ધો. ૬ થી ૮'),
    'અલ્પાહાર': getDefaultsForTab('અલ્પાહાર'),
  });

  const isSunday = date.getDay() === 0;
  const todaysMenu = getMenuForDate(date);

  const getDailyKey = (dateStr) => `@mdm_daily_data_${kendraNumber}_${dateStr}`;
  // 🌟 માસ્ટર બેકઅપ કી (આ કી માં રજિસ્ટર્ડ ડેટા કાયમ સચવાશે)
  const getLastRegisterKey = () => `@mdm_master_register_${kendraNumber}`;

  useEffect(() => {
    fetchSchoolType(); 
    fetchExistingData();
    generateCalendarMarkers(); 
  }, [date, kendraNumber]);

  const fetchSchoolType = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('@mdm_auth_session');
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        if (sessionData.schoolType) setSchoolType(sessionData.schoolType); 
      }
    } catch (e) {}
  };

  const generateCalendarMarkers = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dailyKeys = keys.filter(k => k.startsWith(`@mdm_daily_data_${kendraNumber}_`));
      let marks = {};
      for (let key of dailyKeys) {
        const datePart = key.replace(`@mdm_daily_data_${kendraNumber}_`, ''); 
        const [d, m, y] = datePart.split('/');
        marks[`${y}-${m}-${d}`] = { saved: true };
      }
      setMarkedDates(marks);
    } catch (e) {}
  };

  const fetchExistingData = async () => {
    if (isSunday) return;
    setLoading(true);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    try {
      const localKey = getDailyKey(dateStr); 
      const localDataStr = await AsyncStorage.getItem(localKey);
      
      // 🌟 માસ્ટર બેકઅપ મેળવો
      const lastRegisterStr = await AsyncStorage.getItem(getLastRegisterKey()); 
      const lastRegisterData = lastRegisterStr ? JSON.parse(lastRegisterStr) : null;

      // 🌟 ઓટો-ફિલ ફંક્શન (જો રજિસ્ટર્ડ સંખ્યા 0 હોય, તો જુનો બેકઅપ લગાવી દેશે)
      const applyBackup = (targetData) => {
          if (!lastRegisterData) return targetData;
          TABS.forEach(tab => {
              const getRegTotal = (r) => (+r.sc||0) + (+r.st||0) + (+r.obc||0) + (+r.other||0);
              
              if (lastRegisterData[tab]) {
                  // જો વર્તમાન ફોર્મમાં રજિસ્ટર્ડ 0 હોય, તો બેકઅપમાંથી ભરી દો
                  if (getRegTotal(targetData[tab].register) === 0 && lastRegisterData[tab].register) {
                      targetData[tab].register = lastRegisterData[tab].register;
                  }
                  // ધોરણ અને વર્ગો પણ ઓટો-ફિલ કરો
                  if ((!targetData[tab].stdCount || targetData[tab].stdCount === '0') && lastRegisterData[tab].stdCount) {
                      targetData[tab].stdCount = lastRegisterData[tab].stdCount;
                  }
                  if ((!targetData[tab].classCount || targetData[tab].classCount === '0') && lastRegisterData[tab].classCount) {
                      targetData[tab].classCount = lastRegisterData[tab].classCount;
                  }
              }
          });
          return targetData;
      };

      if (localDataStr) {
        let parsedData = JSON.parse(localDataStr);
        if (parsedData['ધો. ૧ થી ૫']?.menu === 'રજા') {
            setIsGlobalHoliday(true);
            setGlobalHolidayReason(parsedData['ધો. ૧ થી ૫'].holidayReason || '');
        } else {
            setIsGlobalHoliday(false);
            setGlobalHolidayReason('');
        }
        
        // 🌟 લોકલ ડેટા પર પણ બેકઅપ લાગુ કરો (કદાચ કોઈ ખાનું ભૂલથી રહી ગયું હોય તો)
        parsedData = applyBackup(parsedData);
        setDayData(parsedData);
      } 
      else {
        setIsGlobalHoliday(false);
        setGlobalHolidayReason('');
        let isDataFetchedFromServer = false;

        try {
          const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getDailyData&kendra=${encodeURIComponent(kendraNumber)}&date=${encodeURIComponent(dateStr)}`);
          const serverResponse = await response.json();

          if (serverResponse && serverResponse.success && serverResponse.data) {
             let serverData = JSON.parse(serverResponse.data); 
             if (serverData['ધો. ૧ થી ૫']?.menu === 'રજા') {
                 setIsGlobalHoliday(true);
                 setGlobalHolidayReason(serverData['ધો. ૧ થી ૫'].holidayReason || '');
             }
             
             // 🌟 સર્વરના ડેટામાં પણ રજિસ્ટર્ડ બેકઅપ લાગુ કરો
             serverData = applyBackup(serverData);
             await AsyncStorage.setItem(localKey, JSON.stringify(serverData));
             setDayData(serverData);
             isDataFetchedFromServer = true;
          }
        } catch (networkError) {}

        if (!isDataFetchedFromServer) {
          // 🌟 નવી તારીખ માટે એકદમ ફ્રેશ ફોર્મ બનાવીને તેમાં માસ્ટર બેકઅપ ભરી દો
          let newDayState = {};
          TABS.forEach(tab => { newDayState[tab] = getDefaultsForTab(tab); });
          
          newDayState = applyBackup(newDayState);
          setDayData(newDayState);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const updateCategoryData = (cat, type, field, val) => {
    setDayData(prev => {
      const newData = { ...prev };
      const category = { ...newData[cat] };
      const safeVal = val === '' ? '0' : val;

      if (type === 'extra') category[field] = safeVal; 
      else {
        category[type] = { ...category[type], [field]: safeVal };
        const s = category[type];
        const total = (+s.sc || 0) + (+s.st || 0) + (+s.obc || 0) + (+s.other || 0);
        
        if (schoolType === 'કુમાર') { s.boys = total.toString(); s.girls = '0'; } 
        else if (schoolType === 'કન્યા') { s.boys = '0'; s.girls = total.toString(); } 
        else { s.girls = Math.max(0, total - (+s.boys || 0)).toString(); }
      }
      newData[cat] = category;

      if (cat !== 'અલ્પાહાર' && (type === 'register' || type === 'present')) {
        const alp = { ...newData['અલ્પાહાર'] };
        const sumField = (fType, subF) => ['બાલવાટીકા', 'ધો. ૧ થી ૫', 'ધો. ૬ થી ૮'].reduce((sum, t) => sum + (+newData[t][fType][subF] || 0), 0).toString();
        ['sc', 'st', 'obc', 'other', 'boys'].forEach(f => {
          alp.register[f] = sumField('register', f);
          alp.present[f] = sumField('present', f);
        });
        const rT = (+alp.register.sc)+(+alp.register.st)+(+alp.register.obc)+(+alp.register.other);
        alp.register.girls = (rT - (+alp.register.boys)).toString();
        const pT = (+alp.present.sc)+(+alp.present.st)+(+alp.present.obc)+(+alp.present.other);
        alp.present.girls = (pT - (+alp.present.boys)).toString();
        newData['અલ્પાહાર'] = alp;
      }
      return newData;
    });
  };

  const handleFastSave = async () => {
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    setLoading(true);

    let finalDataToSave = JSON.parse(JSON.stringify(dayData));
    TABS.forEach(tab => {
        finalDataToSave[tab].menu = isGlobalHoliday ? 'રજા' : todaysMenu;
        finalDataToSave[tab].holidayReason = isGlobalHoliday ? globalHolidayReason : '';
    });

    const payload = {
      action: 'saveDaily',
      kendra: kendraNumber,
      date: dateStr,
      fullJson: JSON.stringify(finalDataToSave),
      allTabsData: TABS.map(tab => ({ standard: tab, rowData: prepareRowData(dateStr, tab, finalDataToSave[tab]) }))
    };

    const success = await SyncService.saveOffline(payload);

    if (success) {
      await AsyncStorage.setItem(getDailyKey(dateStr), JSON.stringify(finalDataToSave));
      
      // 🌟 ડેટા સેવ થાય ત્યારે રજિસ્ટર્ડ, ધોરણ અને વર્ગોની સંખ્યાનો માસ્ટર બેકઅપ લઈ લો
      const registerBackup = {};
      TABS.forEach(t => { 
          registerBackup[t] = { 
              register: finalDataToSave[t].register,
              stdCount: finalDataToSave[t].stdCount,
              classCount: finalDataToSave[t].classCount
          }; 
      });
      await AsyncStorage.setItem(getLastRegisterKey(), JSON.stringify(registerBackup));
      
      generateCalendarMarkers();
      window.alert("✅ સેવ સફળ: ડેટા સેવ થઈ ગયો છે.");
      SyncService.processQueue(GOOGLE_SCRIPT_URL);
    }
    setLoading(false);
  };

  const prepareRowData = (dateStr, tab, d) => {
      const r = d.register; const p = d.present; const m = d.meals;
      const rT = (+r.sc||0)+(+r.st||0)+(+r.obc||0)+(+r.other||0);
      const pT = (+p.sc||0)+(+p.st||0)+(+p.obc||0)+(+p.other||0);
      const mT = (+m.sc||0)+(+m.st||0)+(+m.obc||0)+(+m.other||0);
      return [
        dateStr, "", tab, d.stdCount || '0', d.classCount || '0',
        r.sc, r.st, r.obc, r.other, rT, r.boys, r.girls,
        p.sc, p.st, p.obc, p.other, pT, p.boys, p.girls,
        m.sc, m.st, m.obc, m.other, mT, m.boys, m.girls,
        d.menu === 'રજા' ? d.holidayReason : (d.menu || '-')
      ];
  };

  return (
    <>
      <style>{`
        .report-wrapper { height: 100vh; display: flex; flex-direction: column; background: #f8fafc; overflow: hidden; padding: 15px 20px; box-sizing: border-box; }
        
        .master-header { background: white; border-radius: 12px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 15px; border: 1px solid #e2e8f0; }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .date-input { padding: 8px 12px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 16px; font-weight: bold; outline: none; background: #f8fafc; }
        .date-input:focus { border-color: #ea580c; }
        
        .menu-badge { background: #fff7ed; color: #c2410c; padding: 8px 15px; border-radius: 8px; font-weight: bold; font-size: 15px; border: 1px solid #fdba74; }
        
        .holiday-toggle-group { display: flex; background: #f1f5f9; border-radius: 8px; padding: 3px; border: 1px solid #cbd5e1; }
        .toggle-btn { padding: 6px 20px; border: none; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; color: #64748b; background: transparent; }
        .toggle-btn.work-active { background: #16a34a; color: white; }
        .toggle-btn.hol-active { background: #dc2626; color: white; }

        .save-btn { background: #ea580c; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3); }
        .save-btn:hover:not(:disabled) { background: #c2410c; transform: translateY(-2px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .tabs-row { display: flex; gap: 10px; margin-bottom: 15px; }
        .tab-btn { flex: 1; padding: 12px; border: none; background: white; color: #64748b; font-size: 15px; font-weight: bold; border-radius: 10px; cursor: pointer; border: 1px solid #e2e8f0; transition: 0.2s; }
        .tab-btn.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2); }

        .content-area { flex: 1; background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; position: relative; display: flex; flex-direction: column; overflow: hidden; }
        
        .holiday-reason-box { background: #fef2f2; padding: 20px; border-radius: 10px; border: 1px solid #fecaca; display: flex; align-items: center; gap: 15px; margin-top: 20px; }
        .reason-input { flex: 1; padding: 10px 15px; border-radius: 8px; border: 1px solid #fca5a5; font-size: 16px; font-weight: bold; outline: none; }
        .reason-input:focus { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2); }

        .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="report-wrapper">
        
        {/* 🎛️ Master Header */}
        <div className="master-header">
          <div className="header-left">
            <input 
              type="date" 
              className="date-input" 
              value={`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`} 
              onChange={(e) => e.target.value && setDate(new Date(e.target.value))} 
              max={new Date().toISOString().split('T')[0]}
            />
            
            {isSunday ? (
              <div className="menu-badge">🌴 રવિવારની રજા</div>
            ) : (
              <>
                <div className="menu-badge">🍱 {todaysMenu}</div>
                <div className="holiday-toggle-group">
                  <button className={`toggle-btn ${!isGlobalHoliday ? 'work-active' : ''}`} onClick={() => {setIsGlobalHoliday(false); setGlobalHolidayReason('');}}>શાળા ચાલુ છે</button>
                  <button className={`toggle-btn ${isGlobalHoliday ? 'hol-active' : ''}`} onClick={() => setIsGlobalHoliday(true)}>શાળામાં રજા છે</button>
                </div>
              </>
            )}
          </div>

          <button className="save-btn" onClick={handleFastSave} disabled={loading}>
            {loading ? <div className="spinner"></div> : <MdCloudUpload size={22} />}
            {loading ? "સેવ..." : "ડેટા સેવ કરો"}
          </button>
        </div>

        {/* 🌴 If Holiday -> Show Only Reason */}
        {(isGlobalHoliday && !isSunday) ? (
           <div className="content-area" style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff7ed', borderStyle: 'dashed'}}>
              <MdBeachAccess size={80} color="#ea580c" style={{opacity: 0.2}} />
              <h2 style={{color: '#c2410c', marginTop: 15}}>આજે શાળામાં રજા જાહેર કરવામાં આવી છે.</h2>
              <div className="holiday-reason-box" style={{width: '60%'}}>
                  <strong style={{color: '#dc2626'}}>રજાનું કારણ:</strong>
                  <input 
                      type="text" 
                      className="reason-input" 
                      placeholder="દા.ત. જાહેર રજા / સ્થાનિક રજા / ચૂંટણી"
                      value={globalHolidayReason}
                      onChange={(e) => setGlobalHolidayReason(e.target.value)}
                  />
              </div>
           </div>
        ) : isSunday ? (
           <div className="content-area" style={{justifyContent: 'center', alignItems: 'center'}}>
              <h1 style={{color: '#94a3b8'}}>આજે રવિવાર છે 🌴</h1>
           </div>
        ) : (
           <>
              {/* 📑 Tabs Row */}
              <div className="tabs-row">
                {TABS.map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* 📦 Compact Data Entry Area */}
              <div className="content-area">
                <MDMCategory 
                  title={activeTab} 
                  data={dayData[activeTab]} 
                  setData={(t, f, v) => updateCategoryData(activeTab, t, f, v)} 
                  schoolType={schoolType} 
                />
              </div>
           </>
        )}

      </div>
    </>
  );
}

function getDefaultsForTab(tab) {
  let defaultStd = '0', defaultClass = '0';
  if (tab === 'ધો. ૧ થી ૫') { defaultStd = '5'; defaultClass = '5'; } else if (tab === 'ધો. ૬ થી ૮') { defaultStd = '3'; defaultClass = '3'; } else if (tab === 'બાલવાટીકા') { defaultStd = '1'; defaultClass = '1'; } else if (tab === 'અલ્પાહાર') { defaultStd = '9'; defaultClass = '9'; }
  return {
    register: { sc: '0', st: '0', obc: '0', other: '0', boys: '0', girls: '0' },
    present: { sc: '0', st: '0', obc: '0', other: '0', boys: '0', girls: '0' },
    meals: { sc: '0', st: '0', obc: '0', other: '0', boys: '0', girls: '0' },
    menu: '', stdCount: defaultStd, classCount: defaultClass, holidayReason: '' 
  };
}