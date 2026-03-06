const PENDING_SYNC_KEY = '@mdm_pending_sync';

export const SyncService = {
  // 📥 ડેટાને ઓફલાઇન ક્યુમાં સેવ કરવા માટે (Web localStorage)
  saveOffline: async (payload) => {
    try {
      const existing = localStorage.getItem(PENDING_SYNC_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      
      queue.push({ ...payload, id: Date.now() });
      
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
      return true;
    } catch (e) { 
      console.error("ઓફલાઇન સેવ કરવામાં ભૂલ:", e);
      return false; 
    }
  },

  // 🚀 ઇન્ટરનેટ હોય ત્યારે બેકગ્રાઉન્ડમાં સર્વર પર સિંક કરવા માટે
  processQueue: async (apiUrl) => {
    try {
      const existing = localStorage.getItem(PENDING_SYNC_KEY);
      if (!existing) return;
      
      let queue = JSON.parse(existing);
      if (queue.length === 0) return;

      const failedItems = []; // જે ડેટા સેવ ન થાય તેને ફરીથી ક્યુમાં રાખવા માટે

      for (const item of queue) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            // 🟢 અહીં પણ text/plain કરી દો
            headers: { 
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(item)
          });
          
          const res = await response.json();
          
          // જો સર્વર પર સેવ ન થાય, તો તેને ફરીથી failedItems માં નાખો
          if (res.result !== 'success') {
             failedItems.push(item);
          }
        } catch (fetchError) {
          // જો નેટવર્ક એરર આવે (ઇન્ટરનેટ ન હોય), તો ડેટા ક્યુમાં જ રહેવા દો
          failedItems.push(item);
        }
      }
      
      // જે ડેટા સેવ થઈ ગયો હશે તે નીકળી જશે, અને બાકીનો ફરીથી સેવ થશે
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(failedItems));
      
    } catch (e) { 
      console.log("Sync failed, will retry later.", e); 
    }
  }
};