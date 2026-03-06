import React, { useState, useEffect } from 'react';
import { MdClose, MdInfo, MdCheck, MdFastfood } from 'react-icons/md';

const AsyncStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
};

export default function MonthlySetupModal({ visible, onClose, onSaveSuccess, selectedDate }) {
  const [loading, setLoading] = useState(false);

  // બધી જ કેટેગરીનો ડેટા એક જ State માં
  const getDefaultItems = () => [
    { id: 1, name: 'ઘઉં', opening: '', incoming: '' },
    { id: 2, name: 'ચોખા', opening: '', incoming: '' },
    { id: 3, name: 'તુવેર દાળ', opening: '', incoming: '' },
    { id: 4, name: 'ચણા', opening: '', incoming: '' },
    { id: 5, name: 'તેલ', opening: '', incoming: '' },
  ];

  const [monthlyData, setMonthlyData] = useState({
    'બાલવાટીકા': getDefaultItems(),
    'ધોરણ ૧ થી ૫': getDefaultItems(),
    'ધોરણ ૬ થી ૮': getDefaultItems()
  });

  const safeDate = selectedDate || new Date();
  const currentMonth = safeDate.getMonth(); 
  const currentYear = safeDate.getFullYear();
  const monthNames = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન", "જુલાઈ", "ઓગસ્ટ", "સપ્ટેમ્બર", "ઓક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
  const displayDate = `${monthNames[currentMonth]} ${currentYear}`;
  
  const storageKey = `@mdm_monthly_setup_${currentMonth}_${currentYear}`;

  useEffect(() => {
    if (visible) { loadData(); }
  }, [visible, safeDate]); 

  const loadData = async () => {
    setLoading(true);
    try {
      const savedData = await AsyncStorage.getItem(storageKey);
      if (savedData) {
        setMonthlyData(JSON.parse(savedData));
      } else {
         setMonthlyData({ 'બાલવાટીકા': getDefaultItems(), 'ધોરણ ૧ થી ૫': getDefaultItems(), 'ધોરણ ૬ થી ૮': getDefaultItems() });
      }
    } catch (e) { console.log("Load Monthly Data Error", e); }
    setLoading(false);
  };

  const updateItem = (category, index, field, value) => {
    const newData = JSON.parse(JSON.stringify(monthlyData));
    newData[category][index][field] = value.replace(/[^0-9.]/g, ''); // માત્ર આંકડા
    setMonthlyData(newData);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(monthlyData));
      onSaveSuccess(monthlyData);
      window.alert(`✅ સેવ સફળ: ત્રણેય વિભાગની નવી આવક એકસાથે સેવ થઈ ગઈ છે.`);
      onClose();
    } catch (e) {
      window.alert("ભૂલ: ડેટા સેવ કરવામાં સમસ્યા આવી.");
    }
  };

  if (!visible) return null;

  // ટેબલ માટેની બેઝિક આઈટમ્સ (ઘઉં, ચોખા વગેરે)
  const baseItems = getDefaultItems();

  return (
    <>
      <style>{`
        /* 🌑 Modal Overlay */
        .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
        
        /* 💻 Wide Modal for Matrix Table */
        .modal-box { background: #f8fafc; width: 100%; max-width: 1050px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); animation: slideUp 0.3s ease-out; overflow: hidden; border: 1px solid #e2e8f0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* 🏆 Header */
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: white; border-bottom: 1px solid #e2e8f0; }
        .header-title { font-size: 24px; font-weight: 900; color: #1e293b; margin: 0; }
        .header-sub { font-size: 14px; color: #64748b; font-weight: bold; background: #f1f5f9; padding: 4px 10px; border-radius: 8px; margin-left: 15px; }
        .close-btn { background: #fee2e2; color: #dc2626; border: none; padding: 8px; border-radius: 50%; cursor: pointer; transition: 0.2s; display: flex; align-items: center; }
        .close-btn:hover { background: #fca5a5; transform: scale(1.1); }

        /* 📢 Info Banner */
        .info-banner { display: flex; align-items: center; background: #e0f2fe; margin: 15px 30px; padding: 12px 20px; border-radius: 10px; border-left: 4px solid #0284c7; }
        .info-text { color: #0369a1; font-size: 14px; font-weight: 600; margin-left: 10px; }

        /* 📊 Matrix Table Layout */
        .table-container { padding: 0 30px 20px 30px; overflow-y: auto; flex: 1; }
        
        .matrix-table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; }
        .matrix-table th, .matrix-table td { border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 12px 10px; text-align: center; }
        .matrix-table th:last-child, .matrix-table td:last-child { border-right: none; }
        .matrix-table tr:last-child td { border-bottom: none; }
        
        /* Table Headers */
        .matrix-table thead tr:first-child th { font-size: 15px; font-weight: 900; letter-spacing: 0.5px; padding: 15px; }
        .matrix-table thead tr:nth-child(2) th { font-size: 12px; color: #64748b; background: #f8fafc; padding: 8px; text-transform: uppercase; }
        
        .th-item { background: #f1f5f9; color: #1e293b; text-align: left !important; padding-left: 20px !important; }
        .th-bal { background: #fef3c7; color: #b45309; }  /* Yellowish */
        .th-pri { background: #dcfce7; color: #15803d; }  /* Greenish */
        .th-upri { background: #e0f2fe; color: #0369a1; } /* Blueish */

        /* Item Name Cell */
        .item-name-box { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: bold; color: #334155; }
        .item-icon { background: #ffedd5; color: #ea580c; width: 35px; height: 35px; border-radius: 8px; display: flex; justify-content: center; align-items: center; }

        /* Inputs & Text */
        .op-text { font-size: 15px; font-weight: bold; color: #94a3b8; background: #f8fafc; padding: 6px 12px; border-radius: 6px; display: inline-block; min-width: 60px; border: 1px dashed #cbd5e1; }
        
        .inc-input { width: 75px; padding: 8px; border: 2px solid #cbd5e1; border-radius: 8px; text-align: center; font-size: 16px; font-weight: 900; color: #ea580c; outline: none; transition: 0.2s; background: #fff7ed; }
        .inc-input:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15); transform: scale(1.05); }

        /* 🏁 Footer */
        .modal-footer { padding: 20px 30px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
        .save-btn { background: #16a34a; color: white; border: none; padding: 15px 40px; border-radius: 12px; font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3); }
        .save-btn:hover { background: #15803d; transform: translateY(-2px); }

        /* Row Hover Effect */
        .matrix-table tbody tr:hover { background-color: #f1f5f9; }
      `}</style>

      <div className="modal-backdrop">
        <div className="modal-box">
          
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="header-title">માસ્ટર સ્ટોક સેટઅપ</h2>
              <span className="header-sub">{displayDate}</span>
            </div>
            <button className="close-btn" onClick={onClose}><MdClose size={24} /></button>
          </div>

          <div className="info-banner">
            <MdInfo size={24} color="#0369a1" />
            <span className="info-text">
              ઓપનિંગ સ્ટોક ઑટોમૅટિક સેટ થયેલો છે. <strong>તમારે માત્ર જે વિભાગમાં નવો સ્ટોક આવ્યો હોય તેના "નવી આવક" ખાનામાં આંકડો નાખવાનો છે.</strong>
            </span>
          </div>

          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>લોડ થઈ રહ્યું છે...</div>
            ) : (
              <table className="matrix-table">
                <thead>
                  {/* Main Category Headers */}
                  <tr>
                    <th rowSpan={2} className="th-item">વસ્તુનું નામ</th>
                    <th colSpan={2} className="th-bal">બાલવાટીકા</th>
                    <th colSpan={2} className="th-pri">ધોરણ ૧ થી ૫</th>
                    <th colSpan={2} className="th-upri">ધોરણ ૬ થી ૮</th>
                  </tr>
                  {/* Sub Headers (Opening / Incoming) */}
                  <tr>
                    <th>ઓપનિંગ</th><th>નવી આવક</th>
                    <th>ઓપનિંગ</th><th>નવી આવક</th>
                    <th>ઓપનિંગ</th><th>નવી આવક</th>
                  </tr>
                </thead>
                <tbody>
                  {baseItems.map((baseItem, index) => (
                    <tr key={baseItem.id}>
                      {/* Item Name */}
                      <td style={{ textAlign: 'left', paddingLeft: '20px' }}>
                        <div className="item-name-box">
                          <div className="item-icon"><MdFastfood size={20} /></div>
                          {baseItem.name}
                        </div>
                      </td>

                      {/* --------- બાલવાટીકા --------- */}
                      <td>
                        <span className="op-text">{monthlyData['બાલવાટીકા'][index].opening || '0.0'}</span>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="inc-input" 
                          placeholder="0.0" 
                          value={monthlyData['બાલવાટીકા'][index].incoming} 
                          onChange={(e) => updateItem('બાલવાટીકા', index, 'incoming', e.target.value)} 
                          onFocus={(e) => e.target.select()}
                        />
                      </td>

                      {/* --------- ધોરણ ૧ થી ૫ --------- */}
                      <td>
                        <span className="op-text">{monthlyData['ધોરણ ૧ થી ૫'][index].opening || '0.0'}</span>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="inc-input" 
                          placeholder="0.0" 
                          value={monthlyData['ધોરણ ૧ થી ૫'][index].incoming} 
                          onChange={(e) => updateItem('ધોરણ ૧ થી ૫', index, 'incoming', e.target.value)} 
                          onFocus={(e) => e.target.select()}
                        />
                      </td>

                      {/* --------- ધોરણ ૬ થી ૮ --------- */}
                      <td>
                        <span className="op-text">{monthlyData['ધોરણ ૬ થી ૮'][index].opening || '0.0'}</span>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="inc-input" 
                          placeholder="0.0" 
                          value={monthlyData['ધોરણ ૬ થી ૮'][index].incoming} 
                          onChange={(e) => updateItem('ધોરણ ૬ થી ૮', index, 'incoming', e.target.value)} 
                          onFocus={(e) => e.target.select()}
                        />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="modal-footer">
            <button className="save-btn" onClick={handleSave}>
              બધા વિભાગનો ડેટા એકસાથે સેવ કરો <MdCheck size={24} />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}