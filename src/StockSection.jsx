import React from 'react';

// વજનનું કન્ફિગરેશન એમ જ રહેશે
export const WEIGHT_CONFIG = {
  'બાલવાટીકા': {
    'ઘઉં': { Tuesday: 0.100, Thursday: 0.080, Friday: 0.100 },
    'ચોખા': { Monday: 0.100, Wednesday: 0.100, Saturday: 0.100 },
    'તુવેર દાળ': { Tuesday: 0.020, Wednesday: 0.020, Thursday: 0.020, Saturday: 0.020 },
    'ચણા': { Monday: 0.020, Friday: 0.020 },
    'તેલ': { all: 0.010 }
  },
  'ધોરણ ૧ થી ૫': {
    'ઘઉં': { Tuesday: 0.100, Thursday: 0.080, Friday: 0.100 },
    'ચોખા': { Monday: 0.100, Wednesday: 0.100, Saturday: 0.100 },
    'તુવેર દાળ': { Tuesday: 0.020, Wednesday: 0.020, Thursday: 0.020, Saturday: 0.020 },
    'ચણા': { Monday: 0.020, Friday: 0.020 },
    'તેલ': { all: 0.010 }
  },
  'ધોરણ ૬ થી ૮': {
    'ઘઉં': { Tuesday: 0.150, Thursday: 0.120, Friday: 0.150 },
    'ચોખા': { Monday: 0.150, Wednesday: 0.150, Saturday: 0.150 },
    'તુવેર દાળ': { Tuesday: 0.030, Wednesday: 0.030, Thursday: 0.030, Saturday: 0.030 },
    'ચણા': { Monday: 0.030, Friday: 0.030 },
    'તેલ': { all: 0.010 }
  }
};

export const getEnglishDay = (dateObj) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dateObj.getDay()];
};

// વેબ માટે કન્વર્ટ કરેલો કમ્પોનન્ટ
export const StockSection = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <>
      <style>{`
        /* 📊 Web Table Layout for Stock */
        .stock-table-wrapper { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-top: 15px; }
        
        .stock-web-table { width: 100%; border-collapse: collapse; text-align: center; }
        .stock-web-table th { background: #f8fafc; color: #475569; font-size: 13px; font-weight: bold; text-transform: uppercase; padding: 16px 10px; border-bottom: 2px solid #e2e8f0; }
        .stock-web-table th:first-child { text-align: left; padding-left: 25px; }
        
        .stock-web-row { border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
        .stock-web-row:hover { background: #f8fafc; }
        .stock-web-row:last-child { border-bottom: none; }
        
        .stock-web-td { padding: 15px 10px; font-size: 16px; font-weight: bold; color: #334155; }
        .stock-web-td:first-child { text-align: left; padding-left: 25px; }
        
        /* 📝 Name & Unit */
        .item-name-group { display: flex; align-items: center; gap: 8px; }
        .item-name-text { font-size: 18px; font-weight: 900; color: #1e293b; }
        .item-unit-text { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-weight: bold; }
        
        /* 🍩 Sukhdi Badge */
        .sukhdi-pill { display: inline-flex; background: #ffedd5; color: #c2410c; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 4px; border: 1px solid #fdba74; }
        
        /* 🔢 Numbers Highlight */
        .val-total { color: #2563eb; background: #eff6ff; padding: 6px 12px; border-radius: 8px; }
        .val-used { color: #dc2626; }
        .val-closing { color: #16a34a; font-weight: 900; font-size: 18px; }
        
        /* 📱 Responsive (મોબાઈલમાં આ ટેબલ આડું સ્ક્રોલ થશે) */
        @media (max-width: 768px) {
          .stock-table-wrapper { overflow-x: auto; }
          .stock-web-table { min-width: 600px; }
        }
      `}</style>

      <div className="stock-table-wrapper">
        <table className="stock-web-table">
          <thead>
            <tr>
              <th>વસ્તુનું નામ</th>
              <th>ઓપનિંગ (KG)</th>
              <th>આવક (KG)</th>
              <th>કુલ (KG)</th>
              <th>વપરાશ (KG)</th>
              <th>બચત (KG)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const totalStock = (parseFloat(item.opening || 0) + parseFloat(item.incoming || 0)).toFixed(3);
              const sukhdiVal = parseFloat(item.used_sukhdi || 0);

              return (
                <tr key={item.id} className="stock-web-row">
                  
                  {/* 1. Name & Sukhdi Info */}
                  <td className="stock-web-td">
                    <div className="item-name-group">
                      <span className="item-name-text">{item.name}</span>
                      <span className="item-unit-text">KG</span>
                    </div>
                    {sukhdiVal > 0 && (
                      <div className="sukhdi-pill">
                        સુખડી: {sukhdiVal.toFixed(3)}
                      </div>
                    )}
                  </td>

                  {/* 2. Opening */}
                  <td className="stock-web-td" style={{ color: '#64748b' }}>
                    {item.opening?.toString() || '0.000'}
                  </td>

                  {/* 3. Incoming */}
                  <td className="stock-web-td" style={{ color: '#64748b' }}>
                    {item.incoming?.toString() || '0.000'}
                  </td>

                  {/* 4. Total Stock */}
                  <td className="stock-web-td">
                    <span className="val-total">{totalStock}</span>
                  </td>

                  {/* 5. Used Bhojan */}
                  <td className="stock-web-td">
                    <span className="val-used">{item.used_bhojan?.toString() || '0.000'}</span>
                  </td>

                  {/* 6. Closing (Balance) */}
                  <td className="stock-web-td">
                    <span className="val-closing">{item.closing?.toString() || '0.000'}</span>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};