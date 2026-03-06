import React, { useState, useEffect } from 'react';
import { MdSettings, MdEvent, MdPeopleAlt } from 'react-icons/md';
import { StockSection, WEIGHT_CONFIG, getEnglishDay } from './StockSection';
import MonthlySetupModal from './MonthlySetupModal';

const THEME_COLOR = '#ea580c';

const AsyncStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
};

export default function StockRegister({ kendraNumber }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ધોરણ ૧ થી ૫');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthlyModalVisible, setMonthlyModalVisible] = useState(false);
  
  const [displayStock, setDisplayStock] = useState([]);
  const [currentBeneficiaries, setCurrentBeneficiaries] = useState('0');

  const getDateString = (dateObj) => {
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const getDefaultItems = () => [
    { id: 1, name: 'ઘઉં', opening: 0, incoming: 0, used_bhojan: 0, closing: 0 },
    { id: 2, name: 'ચોખા', opening: 0, incoming: 0, used_bhojan: 0, closing: 0 },
    { id: 3, name: 'તુવેર દાળ', opening: 0, incoming: 0, used_bhojan: 0, closing: 0 },
    { id: 4, name: 'ચણા', opening: 0, incoming: 0, used_bhojan: 0, closing: 0 },
    { id: 5, name: 'તેલ', opening: 0, incoming: 0, used_bhojan: 0, closing: 0 },
  ];

  useEffect(() => {
    // પહેલા ખાતરી કરો કે મહિનાનો બેઝ ડેટા રેડી છે, પછી જ રોજીંદી ગણતરી કરો
    ensureMonthlySetupData().then(() => {
      calculateChainStock();
    });
  }, [selectedDate, activeTab]);

  // 🚀 માસ્ટર ઓટોમેશન ફંક્શન: પાછલા મહિનાનો ક્લોઝિંગ સ્ટોક નવા મહિનાના ઓપનિંગમાં સેટ કરશે
  const ensureMonthlySetupData = async () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const currentMonthlyKey = `@mdm_monthly_setup_${currentMonth}_${currentYear}`;

    try {
      const currentSetupStr = await AsyncStorage.getItem(currentMonthlyKey);
      
      // જો આ મહિનાનો સેટઅપ નથી, તો ઓટોમેશન ચાલુ કરો
      if (!currentSetupStr) {
        // પાછલા મહિનાની તારીખ શોધો
        const prevDate = new Date(currentYear, currentMonth - 1, 1);
        const prevMonth = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();
        const prevMonthlyKey = `@mdm_monthly_setup_${prevMonth}_${prevYear}`;
        
        const prevSetupStr = await AsyncStorage.getItem(prevMonthlyKey);
        
        let newMonthlyData = {
          'બાલવાટીકા': getDefaultItems(),
          'ધોરણ ૧ થી ૫': getDefaultItems(),
          'ધોરણ ૬ થી ૮': getDefaultItems()
        };

        // જો પાછલા મહિનાનો ડેટા હોય, તો તેમાંથી ક્લોઝિંગ બેલેન્સ શોધીને આ મહિનાનું ઓપનિંગ બનાવો
        if (prevSetupStr) {
          const prevData = JSON.parse(prevSetupStr);
          const tabsToProcess = ['બાલવાટીકા', 'ધોરણ ૧ થી ૫', 'ધોરણ ૬ થી ૮'];
          
          for (const tab of tabsToProcess) {
             const prevSyncKey = `@mdm_usage_sync_${tab}_${prevMonth}_${prevYear}`;
             const prevUsageStr = await AsyncStorage.getItem(prevSyncKey);
             const prevUsageMap = prevUsageStr ? JSON.parse(prevUsageStr) : {};

             if (prevData[tab]) {
                 newMonthlyData[tab] = prevData[tab].map(item => {
                     const op = parseFloat(item.opening || 0);
                     const inc = parseFloat(item.incoming || 0);
                     const used = prevUsageMap[item.name] || 0;
                     // પાછલા મહિનાનું બેલેન્સ = (ઓપનિંગ + આવક) - વપરાશ
                     const closingBalance = (op + inc) - used;
                     
                     return {
                         ...item,
                         opening: closingBalance > 0 ? closingBalance.toFixed(3) : 0,
                         incoming: 0, // નવા મહિનામાં આવક ઝીરોથી શરૂ થાય
                         used_bhojan: 0,
                         closing: 0
                     };
                 });
             }
          }
        }
        
        // ઓટોમેટિક નવા મહિનાનો ડેટા સેવ કરી લો
        await AsyncStorage.setItem(currentMonthlyKey, JSON.stringify(newMonthlyData));
      }
    } catch (e) {
      console.error("Auto-forward error", e);
    }
  };

  const calculateChainStock = async () => {
    setLoading(true);
    try {
      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      const monthlyKey = `@mdm_monthly_setup_${currentMonth}_${currentYear}`;

      const monthlySetupStr = await AsyncStorage.getItem(monthlyKey);
      const monthlyData = monthlySetupStr ? JSON.parse(monthlySetupStr) : null;
      
      let runningStock = getDefaultItems(); 
      
      if (monthlyData && monthlyData[activeTab]) {
        runningStock = monthlyData[activeTab].map(item => ({
          ...item,
          opening: parseFloat(item.opening || 0),
          incoming: parseFloat(item.incoming || 0),
          used_bhojan: 0,
          closing: 0 
        }));
      }

      const targetDate = selectedDate.getDate();
      let totalUsageMap = {}; 

      for (let d = 1; d <= targetDate; d++) {
        const loopDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
        const dateStr = getDateString(loopDate);
        const dayName = getEnglishDay(loopDate);

        const reportKey = `@mdm_daily_data_${kendraNumber}_${dateStr}`;
        const reportStr = await AsyncStorage.getItem(reportKey);
        
        let displayCount = 0; 
        let countBalvatika = 0;
        let count1to5 = 0;
        let count6to8 = 0;

        if (reportStr) {
          const report = JSON.parse(reportStr);
          const getCnt = (key) => {
             if (report[key] && report[key].meals) {
               const m = report[key].meals;
               return (+m.sc || 0) + (+m.st || 0) + (+m.obc || 0) + (+m.other || 0);
             }
             return 0;
          };

          countBalvatika = getCnt('બાલવાટીકા');
          count1to5 = getCnt('ધો. ૧ થી ૫');
          count6to8 = getCnt('ધો. ૬ થી ૮');

          if (activeTab === 'ધોરણ ૧ થી ૫') displayCount = count1to5; 
          else if (activeTab === 'ધોરણ ૬ થી ૮') displayCount = count6to8;
          else if (activeTab === 'બાલવાટીકા') displayCount = countBalvatika;
        }

        if (d === targetDate) {
          setCurrentBeneficiaries(displayCount.toString());
        }

        let dailyItems = runningStock.map(item => {
            let opening, incoming;
            if (d === 1) {
              opening = parseFloat(item.opening);
              incoming = parseFloat(item.incoming);
            } else {
              opening = parseFloat(item.closing);
              incoming = 0; 
            }
            
            let usage1to5 = 0, usageBalvatika = 0, usage6to8 = 0;

            const weightObj1to5 = WEIGHT_CONFIG['ધોરણ ૧ થી ૫']?.[item.name];
            const weightVal1to5 = weightObj1to5 ? (weightObj1to5[dayName] || weightObj1to5['all'] || 0) : 0;
            
            if (count1to5 > 0) usage1to5 = count1to5 * weightVal1to5;
            if (countBalvatika > 0) usageBalvatika = countBalvatika * weightVal1to5;

            const weightObj6to8 = WEIGHT_CONFIG['ધોરણ ૬ થી ૮']?.[item.name];
            const weightVal6to8 = weightObj6to8 ? (weightObj6to8[dayName] || weightObj6to8['all'] || 0) : 0;
            if (count6to8 > 0) usage6to8 = count6to8 * weightVal6to8;

            let sukhdi1to5 = 0, sukhdiBalvatika = 0, sukhdi6to8 = 0;
            
            if (dayName === 'Thursday') {
               if (item.name === 'ઘઉં') {
                   sukhdi1to5 = count1to5 * 0.020; sukhdiBalvatika = countBalvatika * 0.020; sukhdi6to8 = count6to8 * 0.025;
               }
               if (item.name === 'તેલ') {
                   sukhdi1to5 = count1to5 * 0.010; sukhdiBalvatika = countBalvatika * 0.010; sukhdi6to8 = count6to8 * 0.010;
               }
            }

            let totalRequired = 0, displayUsed = 0, displaySukhdi = 0;

            if (activeTab === 'ધોરણ ૧ થી ૫') {
                displayUsed = usage1to5; displaySukhdi = sukhdi1to5;
                totalRequired = (usage1to5 + usageBalvatika) + (sukhdi1to5 + sukhdiBalvatika);
            } else if (activeTab === 'બાલવાટીકા') {
                displayUsed = usageBalvatika; displaySukhdi = sukhdiBalvatika; 
                totalRequired = 0; 
            } else if (activeTab === 'ધોરણ ૬ થી ૮') {
                displayUsed = usage6to8; displaySukhdi = sukhdi6to8;
                totalRequired = usage6to8 + sukhdi6to8;
            }

            return {
              ...item,
              opening, incoming, available: opening + incoming, required: totalRequired,
              originalUsage1to5: usage1to5, originalUsageBalvatika: usageBalvatika,
              actualUsed: 0, displayUsed: displayUsed, sukhdiShow: displaySukhdi
            };
        });

        // અવેજી વ્યવસ્થા (ચોખા ના હોય તો ઘઉં વપરાય વગેરે)
        const pairs = [ { main: 'ઘઉં', sub: 'ચોખા' }, { main: 'ચોખા', sub: 'ઘઉં' }, { main: 'તુવેર દાળ', sub: 'ચણા' }, { main: 'ચણા', sub: 'તુવેર દાળ' } ];
        pairs.forEach(pair => {
            const mainIndex = dailyItems.findIndex(i => i.name === pair.main);
            const subIndex = dailyItems.findIndex(i => i.name === pair.sub);
            if (mainIndex !== -1 && subIndex !== -1) {
                const mainItem = dailyItems[mainIndex];
                if (mainItem.required > mainItem.available) {
                    const diff = mainItem.required - mainItem.available;
                    dailyItems[mainIndex].actualUsed = mainItem.available; 
                    dailyItems[subIndex].required += diff;
                } else {
                    dailyItems[mainIndex].actualUsed = mainItem.required;
                }
            }
        });

        dailyItems.forEach((item) => {
             if (item.actualUsed === 0 && item.required > 0) {
                 item.actualUsed = item.available >= item.required ? item.required : item.available;
             }
             if(item.required === 0) item.actualUsed = 0;
             if (activeTab === 'ધોરણ ૧ થી ૫' && item.required > 0) {
                 const ratio = item.originalUsage1to5 / item.required;
                 item.displayUsed = item.actualUsed * ratio;
             }
        });

        runningStock = dailyItems.map(item => {
            const closing = item.available - item.actualUsed;
            totalUsageMap[item.name] = (totalUsageMap[item.name] || 0) + item.actualUsed;
            
            return {
                ...item, opening: item.opening, incoming: item.incoming,
                used_bhojan: (activeTab === 'ધોરણ ૧ થી ૫' || activeTab === 'બાલવાટીકા') ? item.displayUsed : item.actualUsed,
                used_sukhdi: item.sukhdiShow, closing: closing
            };
        });
      }

      // આખા મહિનાનો કુલ વપરાશ સેવ કરો (જે આગળના મહિનાના ઓટોમેશનમાં કામ આવશે)
      const syncKey = `@mdm_usage_sync_${activeTab}_${currentMonth}_${currentYear}`;
      await AsyncStorage.setItem(syncKey, JSON.stringify(totalUsageMap));

      const formattedStock = runningStock.map(item => ({
        ...item,
        opening: item.opening.toFixed(3), incoming: item.incoming.toFixed(3),
        used_bhojan: item.used_bhojan.toFixed(3), used_sukhdi: item.used_sukhdi.toFixed(3),
        closing: item.closing.toFixed(3) 
      }));

      setDisplayStock(formattedStock);

    } catch (e) { console.error("Calculation Error:", e); }
    setLoading(false);
  };

  const handleMonthlyUpdate = () => { calculateChainStock(); };

  const getFormattedDateForInput = () => {
    return `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
  };

  const handleDateChange = (e) => {
    if(e.target.value) setSelectedDate(new Date(e.target.value));
  };

  return (
    <>
      <style>{`
        .register-container { padding: 30px; max-width: 1400px; margin: 0 auto; background: #f8fafc; min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        
        .header-panel { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 30px; display: flex; flex-direction: column; gap: 20px; border: 1px solid #e2e8f0; }
        .header-top { display: flex; justify-content: space-between; align-items: center; }
        
        .beneficiary-badge { display: flex; align-items: center; background: #fff7ed; padding: 10px 20px; border-radius: 12px; border: 1px solid #ffedd5; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.1); }
        .ben-label { font-size: 14px; font-weight: bold; color: #c2410c; margin-right: 8px; margin-left: 8px;}
        .ben-value { font-size: 22px; font-weight: 900; color: #ea580c; }

        .setup-btn { display: flex; align-items: center; gap: 8px; background: #0f172a; color: white; padding: 12px 25px; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.3); }
        .setup-btn:hover { background: #1e293b; transform: translateY(-2px); }

        .control-row { display: flex; gap: 20px; align-items: stretch; }
        
        .date-picker-wrapper { flex: 1; display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 15px 20px; border-radius: 12px; border: 2px solid #e2e8f0; }
        .date-icon { background: #fff7ed; color: #ea580c; width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
        .date-info { display: flex; flex-direction: column; flex: 1; }
        .date-label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .web-date-input { border: none; background: transparent; font-size: 18px; font-weight: bold; color: #1e293b; outline: none; cursor: pointer; }
        
        .web-tabs { flex: 2; display: flex; background: #f1f5f9; padding: 6px; border-radius: 12px; }
        .tab-btn { flex: 1; border: none; background: transparent; padding: 12px; font-size: 15px; font-weight: bold; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.3s; }
        .tab-btn.active { background: white; color: ${THEME_COLOR}; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

        .loading-box { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 300px; }
        .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ea580c; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="register-container">
        
        <div className="header-panel">
          <div className="header-top">
            <div className="beneficiary-badge">
              <MdPeopleAlt size={22} color="#ea580c" />
              <span className="ben-label">આજની તારીખે કુલ લાભાર્થી:</span>
              <span className="ben-value">{currentBeneficiaries}</span>
            </div>

            <button className="setup-btn" onClick={() => setMonthlyModalVisible(true)}>
              <MdSettings size={20} /> માસિક સેટઅપ (વધારાની આવક માટે)
            </button>
          </div>

          <div className="control-row">
            <div className="date-picker-wrapper">
              <div className="date-icon"><MdEvent size={26} /></div>
              <div className="date-info">
                <span className="date-label">તારીખ પસંદ કરો</span>
                <input 
                  type="date" 
                  className="web-date-input" 
                  value={getFormattedDateForInput()} 
                  onChange={handleDateChange} 
                />
              </div>
            </div>

            <div className="web-tabs">
              {['બાલવાટીકા', 'ધોરણ ૧ થી ૫', 'ધોરણ ૬ થી ૮'].map(tab => (
                <button 
                  key={tab} 
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="stock-content">
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <h3 style={{color: '#94a3b8', marginTop: 15}}>સ્ટોકનું ઓટોમેટિક કેલ્ક્યુલેશન થઈ રહ્યું છે...</h3>
            </div>
          ) : (
            <StockSection data={displayStock} />
          )}
        </div>

        <MonthlySetupModal 
          visible={isMonthlyModalVisible} 
          onClose={() => setMonthlyModalVisible(false)}
          onSaveSuccess={handleMonthlyUpdate}
          selectedDate={selectedDate} 
        />

      </div>
    </>
  );
}