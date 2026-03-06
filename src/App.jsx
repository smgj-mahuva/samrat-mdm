import React, { useState, useEffect } from 'react';
// વેબ માટેના આઇકોન્સ (react-icons માંથી)
import { MdAdminPanelSettings, MdLogout, MdDeleteOutline, MdAdd, MdClose, MdPerson, MdToday, MdInsertChartOutlined, MdInventory2, MdSync, MdChevronRight, MdMenu, MdCloudDownload } from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';

// --- Screens (આ કોમ્પોનેન્ટ્સ તમારી પાસે હોવા જોઈએ) ---
import DailyReport from './DailyReport';
import MonthlySummary from './MonthlySummary';
import StockRegister from './StockRegister';
import LoginScreen from './LoginScreen';

// --- Config & Services ---
import { SyncService } from './SyncService'; 
import { GOOGLE_SCRIPT_URL } from './Config'; 

const AUTH_KEY = '@mdm_auth_session';
const THEME_COLOR = '#ea580c'; 

// વેબ માટે AsyncStorage નું રિપ્લેસમેન્ટ (localStorage નો ઉપયોગ)
const AsyncStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
  multiSet: async (pairs) => {
    pairs.forEach(([key, value]) => localStorage.setItem(key, value));
  }
};

// વેબ માટે લોડિંગ સ્પિનર
const ActivityIndicator = ({ color = THEME_COLOR, size = "24px", style }) => (
  <div style={{ ...style, width: size, height: size, border: `3px solid #f3f3f3`, borderTop: `3px solid ${color}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// =========================================================
// 👑 ADMIN DASHBOARD COMPONENT
// =========================================================
const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [newKendra, setNewKendra] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUsers`);
      const data = await response.json();
      if (data.users) setUsers(data.users);
    } catch (e) { window.alert("Error: ડેટા લાવવામાં ભૂલ થઈ છે."); }
    setLoading(false);
  };

  const handleAddUser = async () => {
    if (!newKendra || !newPin || !newName) return window.alert("ભૂલ: બધી વિગતો ભરો.");
    setLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addUser', kendra: newKendra, pin: newPin, name: newName })
      });
      const result = await response.json();
      if (result.result === 'success') {
        window.alert("સફળ: નવું કેન્દ્ર ઉમેરવામાં આવ્યું છે.");
        setModalVisible(false);
        setNewKendra(''); setNewPin(''); setNewName('');
        fetchUsers(); 
      } else { window.alert("નિષ્ફળ: " + (result.message || "યુઝર ઉમેરી શકાયો નથી.")); }
    } catch (e) { window.alert("Error: કનેક્શન એરર."); }
    setLoading(false);
  };

  const handleDeleteUser = async (kendraToDelete) => {
    if(window.confirm(`ચેતવણી: શું તમે કેન્દ્ર નં ${kendraToDelete} ડિલીટ કરવા માંગો છો?`)) {
      setLoading(true);
      try {
          await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'deleteUser', kendra: kendraToDelete })
          });
          fetchUsers(); 
      } catch(e) { console.log(e); }
      setLoading(false);
    }
  };

  const renderUserItem = (item) => (
    <div key={item.kendra} style={adminStyles.userCard}>
        <div style={adminStyles.cardLeft}>
            <div style={adminStyles.userIcon}>
                <span style={adminStyles.userIconText}>{item.name.charAt(0).toUpperCase()}</span>
            </div>
            <div style={adminStyles.cardTextContainer}>
                <span style={adminStyles.cardTitle}>{item.name}</span>
                <div style={adminStyles.cardBadgeRow}>
                    <div style={adminStyles.kendraBadge}>
                        <span style={adminStyles.kendraBadgeText}>{item.kendra}</span>
                    </div>
                    <span style={adminStyles.pinText}>PIN: {item.pin}</span>
                </div>
            </div>
        </div>
        <button onClick={() => handleDeleteUser(item.kendra)} style={{...adminStyles.deleteBtn, border: 'none', cursor: 'pointer'}}>
            <MdDeleteOutline size={24} color="#ef4444" />
        </button>
    </div>
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc'}}>
        <div style={{backgroundColor: THEME_COLOR}}>
            <div style={adminStyles.header}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <MdAdminPanelSettings size={28} color="#FFF" style={{marginRight: 10}} />
                    <span style={adminStyles.headerTitle}>Admin Dashboard</span>
                </div>
                <button onClick={onLogout} style={{...adminStyles.logoutBtn, background:'none', border:'none', cursor:'pointer'}}>
                    <MdLogout size={24} color="#FFF" />
                </button>
            </div>
        </div>

        <div style={{flex: 1, padding: '10px 16px', overflowY: 'auto'}}>
            <div style={adminStyles.sectionHeader}>નોંધાયેલ કેન્દ્રો ({users.length})</div>
            
            {loading && users.length === 0 ? (
                <ActivityIndicator size="40px" style={{margin: '50px auto'}} />
            ) : users.length === 0 ? (
                <div style={adminStyles.emptyState}>
                    <FaUsers size={50} color="#cbd5e1" />
                    <div style={adminStyles.emptyText}>કોઈ ડેટા નથી</div>
                </div>
            ) : (
                <div style={{paddingBottom: 100}}>
                    {users.map(renderUserItem)}
                </div>
            )}
        </div>

        <button style={{...adminStyles.fab, border:'none', cursor:'pointer'}} onClick={() => setModalVisible(true)}>
            <MdAdd size={32} color="#FFF" />
        </button>

        {modalVisible && (
            <div style={adminStyles.modalOverlay}>
                <div style={adminStyles.modalContent}>
                    <div style={adminStyles.modalHeader}>
                        <span style={adminStyles.modalTitle}>નવું કેન્દ્ર ઉમેરો</span>
                        <button onClick={() => setModalVisible(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
                            <MdClose size={24} color="#64748b" />
                        </button>
                    </div>
                    
                    <span style={adminStyles.label}>કેન્દ્ર નંબર</span>
                    <input style={adminStyles.input} placeholder="Ex. 241501001" type="number" value={newKendra} onChange={(e) => setNewKendra(e.target.value)} />
                    
                    <span style={adminStyles.label}>કેન્દ્ર/સ્કૂલનું નામ</span>
                    <input style={adminStyles.input} placeholder="School Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    
                    <span style={adminStyles.label}>પાસવર્ડ (PIN)</span>
                    <input style={adminStyles.input} placeholder="4 Digit PIN" type="number" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value)} />

                    <button style={{...adminStyles.saveBtn, border:'none', cursor:'pointer'}} onClick={handleAddUser}>
                        {loading ? <ActivityIndicator color="#FFF" size="20px"/> : <span style={adminStyles.saveBtnText}>સેવ કરો</span>}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

// =========================================================
// 🔥 CUSTOM SIDEBAR COMPONENT
// =========================================================
const CustomSidebar = ({ visible, onClose, activeTab, onTabChange, onLogout, onSync, userData, isSyncing }) => {
  if (!visible) return null;

  return (
      <div style={styles.modalOverlay}>
        <div style={styles.backdrop} onClick={onClose} />
        <div style={styles.sidebarContainer}>
          <div style={styles.sidebarHeader}>
            <div style={styles.headerTopRow}>
              <div style={styles.profileIcon}>
                <span style={styles.profileInitial}>
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div style={styles.kendraContainer}>
                 <span style={styles.kendraLabel}>કેન્દ્ર નં.</span>
                 <div style={styles.kendraBadgeSide}>
                    <span style={styles.userKendra}>{userData.kendra || '---'}</span>
                 </div>
              </div>
            </div>
            <div style={styles.headerInfo}>
               <div style={styles.detailRow}>
                  <MdPerson size={18} color="#fed7aa" />
                  <span style={{...styles.userNameText, fontSize: 18, marginLeft: 8 }}>
                    {userData.name || "વપરાશકર્તા"}
                  </span>
               </div>
               <div style={styles.extraInfoRow}>
                  {userData.diseCode && (
                    <span style={styles.detailText}>DISE: {userData.diseCode}</span>
                  )}
                  {userData.village && (
                    <>
                      <span style={styles.bulletPoint}>•</span>
                      <span style={styles.detailText}>{userData.village}</span>
                    </>
                  )}
               </div>
            </div>
          </div>

          <div style={styles.menuContainer}>
            <div style={styles.sectionTitle}>મેનુ</div>
            <SidebarItem icon={MdToday} label="દૈનિક રિપોર્ટ" active={activeTab === 'Daily'} onPress={() => { onTabChange('Daily'); onClose(); }} />
            <SidebarItem icon={MdInsertChartOutlined} label="માસિક સમરી" active={activeTab === 'Monthly'} onPress={() => { onTabChange('Monthly'); onClose(); }} />
            <SidebarItem icon={MdInventory2} label="સ્ટોક રજીસ્ટર" active={activeTab === 'Stock'} onPress={() => { onTabChange('Stock'); onClose(); }} />
            <div style={styles.divider} />
            <div style={styles.sectionTitle}>ડેટા મેનેજમેન્ટ</div>
            <SidebarItem icon={MdSync} label={isSyncing ? "અપડેટ ચાલુ છે..." : "ડેટા રિફ્રેશ કરો"} onPress={() => { onSync(); onClose(); }} color={isSyncing ? "#9ca3af" : "#2563eb"} />
          </div>

          <div style={styles.sidebarFooter}>
            <button style={{...styles.logoutBtnSide, border:'none', cursor:'pointer', width: '100%'}} onClick={onLogout}>
              <div style={styles.iconContainer}>
                <MdLogout size={22} color="#dc2626" />
              </div>
              <span style={styles.logoutText}>લોગ આઉટ</span>
            </button>
            <div style={styles.versionText}>SAMRAT_MDM _App v1.0 (Web)</div>
          </div>
        </div>
      </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onPress, color }) => (
  <div style={{...styles.menuItem, ...(active ? styles.activeMenuItem : {}), cursor: 'pointer'}} onClick={onPress}>
    <div style={styles.iconContainer}>
      <Icon size={24} color={color ? color : (active ? THEME_COLOR : '#64748b')} />
    </div>
    <span style={{...styles.menuLabel, ...(active ? styles.activeMenuLabel : {}), color: color || (active ? THEME_COLOR : '#334155')}}>{label}</span>
    {active && <MdChevronRight size={20} color={THEME_COLOR} style={{marginLeft: 'auto'}}/>}
  </div>
);

// =========================================================
// 🚀 MAIN APP COMPONENT
// =========================================================

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Daily'); 
  const [userData, setUserData] = useState({ kendra: '', name: '', schoolName: '', diseCode: '', village: '', role: 'user' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [isInitialDownloading, setIsInitialDownloading] = useState(false); 
  const [downloadProgress, setDownloadProgress] = useState("તમારો જૂનો ડેટા ડાઉનલોડ થઈ રહ્યો છે...");

  useEffect(() => { checkLogin(); }, []);

  useEffect(() => {
    if (isLoggedIn && userData.kendra && userData.role !== 'admin' && !isInitialDownloading) { 
      runBackgroundSync(); 
    }
  }, [isLoggedIn, userData, isInitialDownloading]);

  const checkLogin = async () => {
    try {
      const session = await AsyncStorage.getItem(AUTH_KEY);
      if (session) { 
        setUserData(JSON.parse(session)); 
        setIsLoggedIn(true); 
      }
    } catch (e) { console.log(e); }
  };

  const downloadAllPastData = async (kendraNumber) => {
    setIsInitialDownloading(true); 
    setDownloadProgress("સર્વર સાથે કનેક્ટ થઈ રહ્યું છે...");

    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData&kendra=${encodeURIComponent(kendraNumber)}`);
      const result = await response.json();

      if (result && result.success && result.data) {
        setDownloadProgress("ડેટા સેવ થઈ રહ્યો છે...");
        const pairsToSave = [];
        
        Object.keys(result.data).forEach(dateStr => {
          const localKey = `@mdm_daily_data_${kendraNumber}_${dateStr}`;
          pairsToSave.push([localKey, JSON.stringify(result.data[dateStr])]);
        });

        if (pairsToSave.length > 0) {
          await AsyncStorage.multiSet(pairsToSave);
        }
      }
    } catch (error) {
      console.log("Bulk Download Error: ", error);
    } finally {
      setDownloadProgress("ડેટા રિસ્ટોર થઈ ગયો!");
      setTimeout(() => {
        setIsInitialDownloading(false); 
        setIsLoggedIn(true); 
      }, 1000);
    }
  };

  const handleLoginSuccess = async (data) => {
    setUserData(data);
    if (data.role !== 'admin') {
      await downloadAllPastData(data.kendra);
    } else {
      setIsLoggedIn(true);
    }
  };

  const runBackgroundSync = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      try {
          await SyncService.processQueue(userData.kendra);
          const fetchUrl = `${GOOGLE_SCRIPT_URL}?action=getLatestData&kendra=${userData.kendra}`;
          const response = await fetch(fetchUrl);
          const serverData = await response.json();
          if (serverData && serverData.status === 'success') {
              const updates = serverData.data; 
              if (updates) {
                 const pairs = [];
                 Object.keys(updates).forEach(key => { pairs.push([key, JSON.stringify(updates[key])]); });
                 if (pairs.length > 0) await AsyncStorage.multiSet(pairs);
              }
          }
      } catch (e) { console.log(e); } finally { setIsSyncing(false); }
  };

  const handleLogout = () => {
    setSidebarOpen(false); 
    if(window.confirm("લોગ આઉટ: શું તમે એપ્લિકેશનમાંથી બહાર નીકળવા માંગો છો?")) {
        AsyncStorage.removeItem(AUTH_KEY).then(() => {
            setIsLoggedIn(false); 
            setUserData({ kendra: '', name: '', role: 'user' }); 
        });
    }
  };

  const handleManualSync = () => { 
    runBackgroundSync(); 
    window.alert("રીફ્રેશ: ડેટા અપડેટ થઈ રહ્યો છે..."); 
  };

  // ------------------------------------------------------------------
  // UI RENDER
  // ------------------------------------------------------------------

  if (isInitialDownloading) {
    return (
      <div style={styles.downloadingContainer}>
        <div style={styles.cloudIconContainer}>
           <MdCloudDownload size={80} color={THEME_COLOR} />
        </div>
        <div style={styles.downloadTitle}>ડેટા રિસ્ટોર થઈ રહ્યો છે</div>
        <div style={styles.downloadSubText}>{downloadProgress}</div>
        <ActivityIndicator size="40px" style={{marginTop: 30}} />
        <div style={styles.waitText}>કૃપા કરીને રાહ જુઓ, એપ બંધ કરશો નહીં...</div>
      </div>
    );
  }

  if (!isLoggedIn) { 
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />; 
  }

  if (userData.role === 'admin') { 
    return <AdminDashboard onLogout={handleLogout} />; 
  }

  return (
      <div style={styles.container}>
        <div style={styles.headerSafeArea}>
          <div style={styles.header}>
            <button onClick={() => setSidebarOpen(true)} style={{...styles.menuBtn, background:'none', border:'none', cursor:'pointer'}}>
               <MdMenu size={28} color="#FFF" />
            </button>
            <div style={styles.headerTitleContainer}>
              <span style={styles.headerTitle}>MDM Reporting</span>
              {isSyncing && <ActivityIndicator size="16px" color="#FFF" style={{marginLeft: 10}} />}
            </div>
            <div style={styles.kendraBadgeMain}>
                <span style={styles.kendraText}>{userData.kendra}</span>
            </div>
          </div>
        </div>
        
        <div style={styles.mainContent}>
          {activeTab === 'Daily' && <DailyReport kendraNumber={userData.kendra} />}
          {activeTab === 'Monthly' && <MonthlySummary kendraNumber={userData.kendra} />}
          {activeTab === 'Stock' && <StockRegister kendraNumber={userData.kendra} />}
        </div>
        
        <CustomSidebar visible={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} onSync={handleManualSync} userData={userData} isSyncing={isSyncing} />
      </div>
  );
}

// =========================================================
// 🎨 WEB STYLES (Converted from StyleSheet)
// =========================================================

const adminStyles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    logoutBtn: { padding: 5 },
    sectionHeader: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    
    userCard: { display: 'flex', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    cardLeft: { display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 },
    userIcon: { backgroundColor: '#fff7ed', width: 45, height: 45, borderRadius: 23, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 12, border: '1px solid #ffedd5' },
    userIconText: { fontSize: 20, fontWeight: 'bold', color: THEME_COLOR },
    cardTextContainer: { flex: 1, display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    cardBadgeRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    kendraBadge: { backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4, marginRight: 8 },
    kendraBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
    pinText: { fontSize: 12, color: '#94a3b8' },
    deleteBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 },

    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#cbd5e1', fontSize: 16, fontWeight: 'bold', marginTop: 10 },

    fab: { position: 'fixed', bottom: 30, right: 20, backgroundColor: THEME_COLOR, width: 64, height: 64, borderRadius: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    label: { fontSize: 14, color: '#475569', fontWeight: '600', marginBottom: 6, marginLeft: 2 },
    input: { border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: '#f8fafc', color: '#1e293b', outline: 'none' },
    saveBtn: { backgroundColor: THEME_COLOR, padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10, boxShadow: '0 4px 5px rgba(234, 88, 12, 0.2)' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc' },
  headerSafeArea: { backgroundColor: THEME_COLOR, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' },
  menuBtn: { padding: 4 },
  headerTitleContainer: { flex: 1, marginLeft: 16, display: 'flex', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  kendraBadgeMain: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 6 },
  kendraText: { color: '#FFF', fontWeight: 'bold' },
  mainContent: { flex: 1, overflowY: 'auto' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex' },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sidebarContainer: { position: 'relative', width: '82%', maxWidth: 320, backgroundColor: '#FFF', height: '100%', boxShadow: '5px 0 15px rgba(0,0,0,0.2)', borderTopRightRadius: 16, borderBottomRightRadius: 16, display: 'flex', flexDirection: 'column' },
  sidebarHeader: { backgroundColor: THEME_COLOR, padding: '45px 20px 20px 20px', borderTopRightRadius: 16 },
  headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  profileIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(255,255,255,0.3)' },
  profileInitial: { fontSize: 24, fontWeight: 'bold', color: THEME_COLOR },
  kendraContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  kendraLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginBottom: 2 },
  kendraBadgeSide: { backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' },
  userKendra: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  headerInfo: { marginTop: 5, display: 'flex', flexDirection: 'column' },
  detailRow: { display: 'flex', alignItems: 'center', marginBottom: 4 },
  userNameText: { color: '#fff7ed', fontWeight: '500' },
  extraInfoRow: { display: 'flex', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  detailText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  bulletPoint: { color: 'rgba(255,255,255,0.5)', margin: '0 6px', fontSize: 10 },
  
  menuContainer: { flex: 1, paddingTop: 20, padding: '0 12px', overflowY: 'auto' },
  sectionTitle: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold', marginLeft: 16, marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
  menuItem: { display: 'flex', alignItems: 'center', padding: '12px', marginBottom: 4, borderRadius: 10 },
  activeMenuItem: { backgroundColor: '#fff7ed' }, 
  iconContainer: { width: 40, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }, 
  menuLabel: { fontSize: 16, fontWeight: '500', flex: 1 },
  activeMenuLabel: { fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f1f5f9', margin: '15px 10px' },
  
  sidebarFooter: { padding: 24, borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', borderBottomRightRadius: 16 },
  logoutBtnSide: { display: 'flex', alignItems: 'center', backgroundColor: '#fee2e2', padding: 12, borderRadius: 10 },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: 'bold' },
  versionText: { color: '#cbd5e1', fontSize: 12, textAlign: 'center', marginTop: 15 },
  
  downloadingContainer: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cloudIconContainer: { backgroundColor: '#FFF', padding: 25, borderRadius: 50, boxShadow: '0 5px 10px rgba(234, 88, 12, 0.2)', marginBottom: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  downloadTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
  downloadSubText: { fontSize: 16, color: THEME_COLOR, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  waitText: { fontSize: 12, color: '#64748b', marginTop: 15, fontWeight: 'bold' }
};