import React, { useMemo } from 'react';
import { MdFace, MdErrorOutline } from 'react-icons/md';
import { FaFemale, FaAddressBook, FaUserCheck, FaUtensils } from 'react-icons/fa';

const calculateTotal = (d) => (parseInt(d.sc) || 0) + (parseInt(d.st) || 0) + (parseInt(d.obc) || 0) + (parseInt(d.other) || 0);

// 🗜️ Compact Table Component (આ ખાનાઓને નાનાં અને બાજુ-બાજુમાં સેટ કરશે)
const CompactTable = ({ title, icon: Icon, data, type, setData, colorTheme, schoolType }) => {
    const total = useMemo(() => calculateTotal(data), [data]);
    const isError = (parseInt(data.boys) || 0) > total; 

    const casteLabels = { sc: 'SC', st: 'ST', obc: 'OBC', other: 'અન્ય' };

    const handleChange = (field, val) => {
        let numericValue = val.replace(/[^0-9]/g, ''); 
        numericValue = numericValue === '' ? '0' : parseInt(numericValue, 10).toString();
        setData(type, field, numericValue);
    };

    return (
        <div className="compact-card" style={{ borderTop: `4px solid ${colorTheme}` }}>
            <div className="card-head" style={{ color: colorTheme }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} /> <span>{title}</span>
                </div>
                <span className="total-pill" style={{ backgroundColor: colorTheme }}>{total}</span>
            </div>
            
            {/* Caste Inputs: 4 ખાના એક જ લાઈનમાં */}
            <div className="caste-grid">
                {['sc', 'st', 'obc', 'other'].map((f) => (
                    <div key={f} className="input-cell">
                        <label>{casteLabels[f]}</label>
                        <input 
                            type="text" 
                            value={(data[f] || '0').toString()} 
                            onChange={(e) => handleChange(f, e.target.value)} 
                            onFocus={(e) => e.target.select()} 
                            maxLength={3} 
                        />
                    </div>
                ))}
            </div>

            {/* Gender Inputs: 2 ખાના નીચેની લાઈનમાં */}
            <div className="gender-grid">
                <div className={`gender-cell ${isError ? 'error' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MdFace size={18} color="#3b82f6" /> <label>કુમાર</label>
                    </div>
                    <input 
                        type="text" 
                        value={(data.boys || '0').toString()} 
                        onChange={(e) => handleChange('boys', e.target.value)} 
                        onFocus={(e) => e.target.select()} 
                        disabled={schoolType !== 'મિશ્ર'} 
                        maxLength={3} 
                    />
                </div>
                <div className="gender-cell read-only-gender">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaFemale size={16} color="#ec4899" /> <label>કન્યા</label>
                    </div>
                    <input 
                        type="text" 
                        value={(data.girls || '0').toString()} 
                        disabled 
                    />
                </div>
            </div>
            
            {isError && schoolType === 'મિશ્ર' && (
                <div className="compact-error">⚠️ ભૂલ: કુમારની સંખ્યા વધારે છે!</div>
            )}
        </div>
    );
};

// --- ૨. મુખ્ય કમ્પોનન્ટ ---
export default function MDMCategory({ title, data, setData, schoolType }) {
    // અહી હવે આપણે "રજા" કે "મેનુ" વાળું લોજીક નથી રાખ્યું, કારણ કે તે DailyReport.jsx ના હેડરમાં જતું રહ્યું છે.

    return (
        <>
            <style>{`
                /* 🗜️ 3-Column Layout (Zero Scrolling) */
                .category-wrapper { padding: 10px; height: 100%; display: flex; flex-direction: column; }
                
                .three-col-layout { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 20px; 
                    flex: 1; 
                }
                
                .compact-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 18px; border: 1px solid #e2e8f0; }
                .card-head { font-size: 16px; font-weight: 900; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; }
                .total-pill { color: white; padding: 4px 12px; border-radius: 12px; font-size: 15px; }

                /* Caste Grid (4 columns) */
                .caste-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .input-cell { display: flex; flex-direction: column; align-items: center; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
                .input-cell label { font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
                .input-cell input { width: 100%; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b; border: none; border-bottom: 2px solid #cbd5e1; outline: none; padding-bottom: 4px; background: transparent; transition: 0.2s; }
                .input-cell input:focus { border-bottom-color: #ea580c; transform: scale(1.05); }

                /* Gender Grid (2 columns) */
                .gender-grid { display: flex; gap: 15px; }
                .gender-cell { flex: 1; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                .gender-cell label { font-size: 14px; font-weight: bold; color: #475569; }
                .gender-cell input { width: 45px; text-align: right; font-size: 20px; font-weight: bold; border: none; border-bottom: 2px solid #cbd5e1; outline: none; background: transparent; transition: 0.2s; }
                .gender-cell input:focus { border-bottom-color: #ea580c; }
                
                .read-only-gender input { border-bottom: none; color: #94a3b8; }
                
                .gender-cell.error { border-color: #ef4444; background: #fef2f2; }
                .gender-cell.error input { color: #ef4444; border-bottom-color: #ef4444; }
                .compact-error { color: #ef4444; font-size: 12px; font-weight: bold; text-align: center; margin-top: -5px; }

                /* ⚙️ Extra Details Row */
                .extra-row { display: flex; gap: 20px; margin-top: 20px; background: white; padding: 15px 25px; border-radius: 12px; justify-content: flex-end; align-items: center; border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .extra-item { display: flex; align-items: center; gap: 12px; }
                .extra-item label { font-size: 15px; font-weight: bold; color: #475569; }
                .extra-item input { width: 60px; text-align: center; font-size: 18px; font-weight: bold; padding: 6px; border: 2px solid #cbd5e1; border-radius: 8px; outline: none; color: #1e293b; transition: 0.2s; }
                .extra-item input:focus { border-color: #ea580c; }

                /* Responsive */
                @media (max-width: 1024px) {
                    .three-col-layout { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="category-wrapper">
                
                {/* 📊 3 Columns Layout */}
                <div className="three-col-layout">
                    <CompactTable 
                        title="૧. રજિસ્ટર્ડ" 
                        icon={FaAddressBook} 
                        data={data.register} 
                        type="register" 
                        setData={setData} 
                        colorTheme="#ea580c" 
                        schoolType={schoolType} 
                    />
                    <CompactTable 
                        title="૨. હાજર" 
                        icon={FaUserCheck} 
                        data={data.present} 
                        type="present" 
                        setData={setData} 
                        colorTheme="#16a34a" 
                        schoolType={schoolType} 
                    />
                    <CompactTable 
                        title="૩. ભોજન" 
                        icon={FaUtensils} 
                        data={data.meals} 
                        type="meals" 
                        setData={setData} 
                        colorTheme="#0891b2" 
                        schoolType={schoolType} 
                    />
                </div>

                {/* ⚙️ Extra (Class/Std) */}
                <div className="extra-row">
                    <div className="extra-item">
                        <label>કુલ ધોરણ:</label>
                        <input 
                            type="text" 
                            value={(data.stdCount || '0').toString()} 
                            onChange={(e) => setData('extra', 'stdCount', e.target.value.replace(/[^0-9]/g, ''))} 
                            onFocus={(e) => e.target.select()} 
                        />
                    </div>
                    <div className="extra-item">
                        <label>કુલ વર્ગો:</label>
                        <input 
                            type="text" 
                            value={(data.classCount || '0').toString()} 
                            onChange={(e) => setData('extra', 'classCount', e.target.value.replace(/[^0-9]/g, ''))} 
                            onFocus={(e) => e.target.select()} 
                        />
                    </div>
                </div>

            </div>
        </>
    );
}