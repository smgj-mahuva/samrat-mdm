import { Alert } from 'react-native';

// તમારી નવી Web App URL અહી મૂકો
const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE'; 

const toGuj = (n) => {
  if (n === undefined || n === null || n === '') return '-';
  const digits = { '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪', '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯', '.': '.' };
  return n.toString().split('').map(d => digits[d] || d).join('');
};

export const uploadMonthDataToSheet = async (fullData, activeTab, currentDate, profile) => {
  try {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthNames = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન", "જુલાઈ", "ઓગસ્ટ", "સપ્ટેમ્બર", "ઓક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
    const monthName = monthNames[currentMonth];
    const yearName = toGuj(currentYear);

    // Totals Setup
    let totalReg = { sc:0, st:0, obc:0, other:0, total:0, b:0, g:0 };
    let totalPres = { sc:0, st:0, obc:0, other:0, total:0, b:0, g:0 };
    let totalMeal = { sc:0, st:0, obc:0, other:0, total:0, b:0, g:0 };
    let workingDaysCount = 0;

    // --- 1. HEADERS (PDF જેવા જ) ---
    // આ લિસ્ટમાં આપણે બધા ડેટા ભેગા કરીશું.
    let sheetData = [];

    // Title Row (Optional - જો તમારે શીટમાં ઉપર ટાઈટલ જોતું હોય તો)
    sheetData.push([`માહે: ${monthName} - ${yearName}`, `ધોરણ: ${activeTab}`, `શાળા: ${profile?.schoolName || ''}`]);
    
    // Column Headers
    sheetData.push([
        "તારીખ", "વાર", "ધોરણ", "વર્ગો",
        "રજિ. SC", "રજિ. ST", "રજિ. OBC", "રજિ. Other", "રજિ. કુલ", "રજિ. કુમાર", "રજિ. કન્યા",
        "હાજર SC", "હાજર ST", "હાજર OBC", "હાજર Other", "હાજર કુલ", "હાજર કુમાર", "હાજર કન્યા",
        "લાભાર્થી SC", "લાભાર્થી ST", "લાભાર્થી OBC", "લાભાર્થી Other", "લાભાર્થી કુલ", "લાભાર્થી કુમાર", "લાભાર્થી કન્યા",
        "મેનુ", "વ્યવસ્થાપક સહી", "આચાર્ય સહી"
    ]);

    // --- 2. DAILY LOOP (તમારા PDF કોડ મુજબ) ---
    for (let i = 1; i <= daysInMonth; i++) {
      const dObj = new Date(currentYear, currentMonth, i);
      const dateKey = dObj.toLocaleDateString('en-GB'); 
      const weekdayNames = ["રવિ", "સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"];
      const dayName = weekdayNames[dObj.getDay()];
      const dateGuj = toGuj(i);
      const isSunday = dObj.getDay() === 0;

      const dataForDay = fullData[dateKey] ? fullData[dateKey][activeTab] : null;
      const r = dataForDay?.register || {};
      const p = dataForDay?.present || {};
      const m = dataForDay?.meals || {};
      
      // Menu Logic
      let menu = '';
      if (isSunday) {
          menu = 'રવિવારની રજા';
      } else {
          if (dataForDay?.menu === 'રજા') {
              menu = dataForDay?.holidayReason || 'રજા';
          } else {
              menu = dataForDay?.menu || '-';
          }
      }

      // Calculation
      const rT = (parseInt(r.sc)||0)+(parseInt(r.st)||0)+(parseInt(r.obc)||0)+(parseInt(r.other)||0);
      const pT = (parseInt(p.sc)||0)+(parseInt(p.st)||0)+(parseInt(p.obc)||0)+(parseInt(p.other)||0);
      const mT = (parseInt(m.sc)||0)+(parseInt(m.st)||0)+(parseInt(m.obc)||0)+(parseInt(m.other)||0);

      if (!isSunday && mT > 0) {
        workingDaysCount++; 
        totalReg.sc += parseInt(r.sc)||0; totalReg.st += parseInt(r.st)||0; totalReg.obc += parseInt(r.obc)||0; totalReg.other += parseInt(r.other)||0; totalReg.total += rT; totalReg.b += parseInt(r.boys)||0; totalReg.g += parseInt(r.girls)||0;
        totalPres.sc += parseInt(p.sc)||0; totalPres.st += parseInt(p.st)||0; totalPres.obc += parseInt(p.obc)||0; totalPres.other += parseInt(p.other)||0; totalPres.total += pT; totalPres.b += parseInt(p.boys)||0; totalPres.g += parseInt(p.girls)||0;
        totalMeal.sc += parseInt(m.sc)||0; totalMeal.st += parseInt(m.st)||0; totalMeal.obc += parseInt(m.obc)||0; totalMeal.other += parseInt(m.other)||0; totalMeal.total += mT; totalMeal.b += parseInt(m.boys)||0; totalMeal.g += parseInt(m.girls)||0;
      }

      // ROW PREPARATION (Line to Line mapping with Headers)
      let row = [];

      // 1. Basic Info
      row.push(dateGuj);
      row.push(dayName);
      row.push("-"); // ધોરણ (Daily ખાલી હોય છે)
      row.push("-"); // વર્ગો (Daily ખાલી હોય છે)

      if (isSunday) {
          // રવિવાર હોય તો બધે ડેશ "-"
          for(let k=0; k<21; k++) row.push("-");
      } else {
          // 2. Register
          row.push(toGuj(r.sc||0), toGuj(r.st||0), toGuj(r.obc||0), toGuj(r.other||0), toGuj(rT), toGuj(r.boys||0), toGuj(r.girls||0));
          // 3. Present
          row.push(toGuj(p.sc||0), toGuj(p.st||0), toGuj(p.obc||0), toGuj(p.other||0), toGuj(pT), toGuj(p.boys||0), toGuj(p.girls||0));
          // 4. Meal
          row.push(toGuj(m.sc||0), toGuj(m.st||0), toGuj(m.obc||0), toGuj(m.other||0), toGuj(mT), toGuj(m.boys||0), toGuj(m.girls||0));
      }

      // Menu & Sign
      row.push(menu);
      row.push(""); // વ્યવસ્થાપક સહી
      row.push(""); // આચાર્ય સહી

      sheetData.push(row);
    }

    // --- 3. TOTAL ROW ---
    let totalRow = [
        "કુલ", "-", "-", "-",
        toGuj(totalReg.sc), toGuj(totalReg.st), toGuj(totalReg.obc), toGuj(totalReg.other), toGuj(totalReg.total), toGuj(totalReg.b), toGuj(totalReg.g),
        toGuj(totalPres.sc), toGuj(totalPres.st), toGuj(totalPres.obc), toGuj(totalPres.other), toGuj(totalPres.total), toGuj(totalPres.b), toGuj(totalPres.g),
        toGuj(totalMeal.sc), toGuj(totalMeal.st), toGuj(totalMeal.obc), toGuj(totalMeal.other), toGuj(totalMeal.total), toGuj(totalMeal.b), toGuj(totalMeal.g),
        "-", "-", "-"
    ];
    sheetData.push(totalRow);

    // --- 4. FOOTER INFO (Summary) ---
    // એક લાઈન છોડીને
    sheetData.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    
    sheetData.push(["સારાંશ:", `શાળા ચાલુ દિવસ: ${toGuj(workingDaysCount)}`, `ભોજન દિવસ: ${toGuj(workingDaysCount)}`, ""]);
    
    // Average Calculation logic
    let averageBeneficiaries = 0;
    if (workingDaysCount > 0) {
        averageBeneficiaries = (totalMeal.total / workingDaysCount).toFixed(2);
    }
    sheetData.push(["સરેરાશ લાભાર્થી:", toGuj(averageBeneficiaries), "", ""]);

    // --- 5. SEND TO GOOGLE SHEET ---
    console.log("Sending Data...");
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ rows: sheetData })
    });

    const result = await response.json();
    
    if (result.result === 'success') {
        Alert.alert("સફળ", "આખા મહિનાનો ડેટા Google Sheet માં સેવ થઈ ગયો છે.");
    } else {
        Alert.alert("ભૂલ", "ડેટા સેવ કરવામાં સમસ્યા આવી છે.");
    }

  } catch (error) {
    Alert.alert("Error", error.message);
    console.log(error);
  }
};