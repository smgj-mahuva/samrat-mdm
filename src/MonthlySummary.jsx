import React, { useState, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight, MdCheckCircle, MdRestaurant, MdOfflinePin, MdBeachAccess, MdRefresh } from 'react-icons/md';

const AsyncStorage = {
  getItem: async (key) => localStorage.getItem(key),
  getAllKeys: async () => Object.keys(localStorage),
};

export default function MonthlySummary({ kendraNumber }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  const [summaryData, setSummaryData] = useState({
    totalPresent: 0, totalMeals: 0,
    balvatikaTotal: 0, primaryTotal: 0, upperPrimaryTotal: 0, alpaharTotal: 0, 
    balvatikaMeals: 0, primaryMeals: 0, upperPrimaryMeals: 0, alpaharMeals: 0,
    holidays: 0
  });

  const currentMonthName = currentDate.toLocaleString('gu-IN', { month: 'long', year: 'numeric' });
  const currentMonthYear = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

  useEffect(() => {
    calculateLocalSummary();
  }, [currentDate, kendraNumber]); 

  const getTrueTotal = (sectionData) => {
    if (!sectionData) return 0;
    return (
      (parseInt(sectionData.sc) || 0) + 
      (parseInt(sectionData.st) || 0) + 
      (parseInt(sectionData.obc) || 0) + 
      (parseInt(sectionData.other) || 0)
    );
  };

  const calculateLocalSummary = async () => {
    setLoading(true);
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      const dailyKeys = allKeys.filter(key => 
        key.includes(`@mdm_daily_data_${kendraNumber}_`) && key.includes(`/${currentMonthYear}`)
      );

      let totals = {
        totalPresent: 0, totalMeals: 0,
        balvatikaTotal: 0, primaryTotal: 0, upperPrimaryTotal: 0, alpaharTotal: 0,
        balvatikaMeals: 0, primaryMeals: 0, upperPrimaryMeals: 0, alpaharMeals: 0,
        holidays: 0
      };

      for (let key of dailyKeys) {
        const rawData = await AsyncStorage.getItem(key);
        if (rawData) {
          const day = JSON.parse(rawData);
          
          const balP = getTrueTotal(day['બાલવાટીકા']?.present);
          const priP = getTrueTotal(day['ધો. ૧ થી ૫']?.present);
          const upriP = getTrueTotal(day['ધો. ૬ થી ૮']?.present);
          const alpP = getTrueTotal(day['અલ્પાહાર']?.present); 

          const balM = getTrueTotal(day['બાલવાટીકા']?.meals);
          const priM = getTrueTotal(day['ધો. ૧ થી ૫']?.meals);
          const upriM = getTrueTotal(day['ધો. ૬ થી ૮']?.meals);
          const alpM = getTrueTotal(day['અલ્પાહાર']?.meals); 

          totals.balvatikaTotal += balP;
          totals.primaryTotal += priP;
          totals.upperPrimaryTotal += upriP;
          totals.alpaharTotal += alpP;

          totals.balvatikaMeals += balM;
          totals.primaryMeals += priM;
          totals.upperPrimaryMeals += upriM;
          totals.alpaharMeals += alpM;

          if (day['ધો. ૧ થી ૫']?.menu === 'રજા') totals.holidays += 1;
        }
      }

      totals.totalPresent = totals.balvatikaTotal + totals.primaryTotal + totals.upperPrimaryTotal;
      totals.totalMeals = totals.balvatikaMeals + totals.primaryMeals + totals.upperPrimaryMeals;
      
      setSummaryData(totals);
    } catch (e) {
      console.error("Calculation error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return (
    <>
      <style>{`
        /* 🚫 Compact Zero-Scroll Layout */
        .summary-wrapper { padding: 20px 30px; max-width: 1400px; margin: 0 auto; height: 100vh; background-color: #f8fafc; font-family: 'Segoe UI', sans-serif; overflow: hidden; display: flex; flex-direction: column; }
        
        /* 📅 Header (Compact) */
        .month-header-card { background: white; padding: 15px 30px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.03); margin-bottom: 20px; border: 1px solid #e2e8f0; }
        .month-nav { display: flex; align-items: center; gap: 15px; }
        .nav-btn { background: #f1f5f9; border: none; border-radius: 8px; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; color: #475569; cursor: pointer; transition: 0.2s; }
        .nav-btn:hover { background: #e2e8f0; color: #1e293b; }
        .month-title { font-size: 22px; font-weight: 900; color: #1e293b; min-width: 250px; text-align: center; }
        
        .refresh-btn { background: #ea580c; color: white; border: none; padding: 10px 20px; border-radius: 8px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; font-weight: bold; font-size: 15px; }
        .refresh-btn:hover { background: #c2410c; }
        
        /* 💻 Dashboard Grid (Side-by-Side) */
        .dashboard-grid { display: flex; gap: 20px; flex: 1; }
        
        /* 📈 Left Side: Highlights */
        .highlight-col { display: flex; flex-direction: column; gap: 20px; width: 300px; }
        .stat-card { background: white; padding: 25px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; flex: 1; }
        .stat-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; }
        .stat-value { font-size: 42px; font-weight: 900; color: #1e293b; line-height: 1; }
        .stat-label { font-size: 15px; color: #64748b; font-weight: bold; margin-top: 8px; text-transform: uppercase; }

        .holiday-banner { background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 0.8; }
        .holiday-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: bold; color: #dc2626; margin-bottom: 5px; }
        .holiday-value { font-size: 32px; font-weight: 900; color: #b91c1c; }

        /* 📊 Right Side: Data Table */
        .data-col { flex: 1; display: flex; flex-direction: column; }
        .data-card { background: white; border-radius: 16px; padding: 25px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; flex: 1; display: flex; flex-direction: column; }
        
        .table-section-title { font-size: 18px; font-weight: bold; color: #334155; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
        
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th { background: #f8fafc; color: #64748b; padding: 15px; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
        .custom-table th:first-child { text-align: left; border-top-left-radius: 8px; }
        .custom-table th:last-child { border-top-right-radius: 8px; }
        
        .custom-table td { padding: 18px 15px; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b; border-bottom: 1px dashed #e2e8f0; }
        .custom-table td:first-child { text-align: left; color: #475569; font-size: 18px; }
        .custom-table tr:hover td { background: #f8fafc; }
        .custom-table tr:last-child td { border-bottom: none; }

        /* ℹ️ Info Footer */
        .info-footer { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 0; margin-top: auto; }
        .info-text { font-size: 13px; color: #94a3b8; font-weight: 600; margin: 0; }

        /* ⏳ Loader */
        .loader-container { display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #ea580c; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="summary-wrapper">
        
        {/* 📅 Navigation Header */}
        <div className="month-header-card">
          <div className="month-nav">
            <button className="nav-btn" onClick={handlePrevMonth}><MdChevronLeft size={28} /></button>
            <div className="month-title">{currentMonthName}</div>
            <button className="nav-btn" onClick={handleNextMonth}><MdChevronRight size={28} /></button>
          </div>
          
          <button className="refresh-btn" onClick={() => { setRefreshing(true); calculateLocalSummary(); }}>
            <MdRefresh size={20} className={refreshing ? "spin-icon" : ""} /> રીફ્રેશ ડેટા
          </button>
        </div>

        {loading && !refreshing ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <h3 style={{color: '#64748b', marginTop: 15}}>ગણતરી થઈ રહી છે...</h3>
          </div>
        ) : (
          <div className="dashboard-grid">
            
            {/* 📈 Left Side: Highlights */}
            <div className="highlight-col">
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#dcfce7', color: '#16a34a'}}><MdCheckCircle size={30} /></div>
                <div className="stat-value">{summaryData.totalPresent}</div>
                <div className="stat-label">કુલ હાજરી</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#ffedd5', color: '#ea580c'}}><MdRestaurant size={30} /></div>
                <div className="stat-value">{summaryData.totalMeals}</div>
                <div className="stat-label">કુલ ભોજન</div>
              </div>

              <div className="holiday-banner">
                <div className="holiday-label"><MdBeachAccess size={20} /> કુલ રજાના દિવસો</div>
                <div className="holiday-value">{summaryData.holidays}</div>
              </div>
            </div>

            {/* 📊 Right Side: Data Table */}
            <div className="data-col">
              <div className="data-card">
                <div className="table-section-title">વિભાગ મુજબ માસિક વિગત</div>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>વિભાગ (ધોરણ)</th>
                      <th>માસિક હાજરી</th>
                      <th>માસિક લાભાર્થી (ભોજન)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>બાલવાટીકા</td>
                      <td>{summaryData.balvatikaTotal}</td>
                      <td>{summaryData.balvatikaMeals}</td>
                    </tr>
                    <tr>
                      <td>ધોરણ ૧ થી ૫</td>
                      <td>{summaryData.primaryTotal}</td>
                      <td>{summaryData.primaryMeals}</td>
                    </tr>
                    <tr>
                      <td>ધોરણ ૬ થી ૮</td>
                      <td>{summaryData.upperPrimaryTotal}</td>
                      <td>{summaryData.upperPrimaryMeals}</td>
                    </tr>
                    <tr style={{background: '#f8fafc'}}>
                      <td style={{fontWeight: '900'}}>અલ્પાહાર</td>
                      <td style={{color: '#0369a1'}}>{summaryData.alpaharTotal}</td>
                      <td style={{color: '#0369a1'}}>{summaryData.alpaharMeals}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ℹ️ Info Footer (Bottom of Data Column) */}
              <div className="info-footer">
                <MdOfflinePin size={18} color="#94a3b8" />
                <p className="info-text">આ ડેટા લોકલ ડેટાબેઝ મુજબ છે. કોઈ ફેરફાર ના દેખાય તો "રીફ્રેશ ડેટા" પર ક્લિક કરો.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}