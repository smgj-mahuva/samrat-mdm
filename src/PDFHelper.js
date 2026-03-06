import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const toGuj = (n) => {
  if (n === undefined || n === null || n === '') return '-';
  const digits = { '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪', '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯', '.': '.' };
  return n.toString().split('').map(d => digits[d] || d).join('');
};

export const generateMonthlyPDF = async (fullData, activeTab, currentDate, profile) => {
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

    // --- Auto Calculation Variables ---
    let workingDaysCount = 0;

    let rowsHTML = '';

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

        // Grand Total Calculation
        totalReg.sc += parseInt(r.sc)||0; totalReg.st += parseInt(r.st)||0; totalReg.obc += parseInt(r.obc)||0; totalReg.other += parseInt(r.other)||0; totalReg.total += rT; totalReg.b += parseInt(r.boys)||0; totalReg.g += parseInt(r.girls)||0;
        totalPres.sc += parseInt(p.sc)||0; totalPres.st += parseInt(p.st)||0; totalPres.obc += parseInt(p.obc)||0; totalPres.other += parseInt(p.other)||0; totalPres.total += pT; totalPres.b += parseInt(p.boys)||0; totalPres.g += parseInt(p.girls)||0;
        totalMeal.sc += parseInt(m.sc)||0; totalMeal.st += parseInt(m.st)||0; totalMeal.obc += parseInt(m.obc)||0; totalMeal.other += parseInt(m.other)||0; totalMeal.total += mT; totalMeal.b += parseInt(m.boys)||0; totalMeal.g += parseInt(m.girls)||0;
      }

      // [CHANGED] Check if it is Sunday OR a Manual Holiday ('રજા')
      const isHoliday = dataForDay?.menu === 'રજા';
      const rowStyle = (isSunday || isHoliday) ? 'background-color: #f2f2f2; color: #333;' : '';
      
      const menuStyle = isSunday ? 'font-size: 9px; font-weight: bold; letter-spacing: 0.5px;' : 'font-size: 7px;';

      rowsHTML += `
        <tr style="${rowStyle}">
          <td style="font-weight:bold;">${dateGuj}</td>
          <td>${dayName}</td>
          <td>-</td> <td>-</td> 
          
          <td>${isSunday ? '-' : toGuj(r.sc||0)}</td><td>${isSunday ? '-' : toGuj(r.st||0)}</td><td>${isSunday ? '-' : toGuj(r.obc||0)}</td><td>${isSunday ? '-' : toGuj(r.other||0)}</td>
          <td style="font-weight:bold;">${isSunday ? '-' : toGuj(rT)}</td><td>${isSunday ? '-' : toGuj(r.boys||0)}</td><td>${isSunday ? '-' : toGuj(r.girls||0)}</td>

          <td>${isSunday ? '-' : toGuj(p.sc||0)}</td><td>${isSunday ? '-' : toGuj(p.st||0)}</td><td>${isSunday ? '-' : toGuj(p.obc||0)}</td><td>${isSunday ? '-' : toGuj(p.other||0)}</td>
          <td style="font-weight:bold;">${isSunday ? '-' : toGuj(pT)}</td><td>${isSunday ? '-' : toGuj(p.boys||0)}</td><td>${isSunday ? '-' : toGuj(p.girls||0)}</td>

          <td>${isSunday ? '-' : toGuj(m.sc||0)}</td><td>${isSunday ? '-' : toGuj(m.st||0)}</td><td>${isSunday ? '-' : toGuj(m.obc||0)}</td><td>${isSunday ? '-' : toGuj(m.other||0)}</td>
          <td style="font-weight:bold;">${isSunday ? '-' : toGuj(mT)}</td><td>${isSunday ? '-' : toGuj(m.boys||0)}</td><td>${isSunday ? '-' : toGuj(m.girls||0)}</td>

          <td style="${menuStyle}">${menu}</td>
          <td></td><td></td>
        </tr>`;
    }

    // --- Footer Auto Logic ---
    let stdCount = '9';
    let classCount = '9';

    if (activeTab.includes('૧ થી ૫')) {
        stdCount = '5'; classCount = '5';
    } else if (activeTab.includes('૬ થી ૮')) {
        stdCount = '3'; classCount = '3';
    } else if (activeTab.includes('બાલવાટીકા')) {
        stdCount = '1'; classCount = '1';
    }

    let averageBeneficiaries = 0;
    if (workingDaysCount > 0) {
        averageBeneficiaries = (totalMeal.total / workingDaysCount).toFixed(2);
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            @page { size: landscape; margin: 3mm; }
            body { font-family: 'Helvetica'; margin: 0; padding: 0; text-align: center; font-size: 8px; width: 100%; }
            
            .top-bar { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 5px; margin-bottom: 2px; }
            .form-no { font-weight: bold; font-size: 10px; }
            .main-heading { font-size: 14px; font-weight: bold; }
            .sub-heading { font-size: 10px; font-weight: bold; }
            .center-title { font-size: 11px; font-weight: bold; margin: 1px 0; }
            .info-bar { display: flex; justify-content: space-between; font-weight: bold; font-size: 9px; border-bottom: 1px solid #000; padding: 1px 5px; margin-bottom: 2px;}
            
            table { width: 100%; border-collapse: collapse; border: 1px solid #000; table-layout: fixed; }
            th, td { border: 1px solid #000; padding: 0; text-align: center; vertical-align: middle; font-size: 8px; height: 18px; overflow: hidden; white-space: nowrap; }
            .bg-head { background-color: #f0f0f0; font-weight: bold; }
            
            .w-date { width: 3.3%; } .w-day { width: 3.3%; } .w-std { width: 3.3%; }
            .col-data { width: 3.3%; } 
            .col-menu { width: 7%; } .col-sign { width: 7%; }

            .vertical-text { 
                writing-mode: horizontal-tb;
                transform: none;
                font-size: 8px; 
                line-height: 1.2; 
                white-space: normal;
            }

            .footer-wrapper { display: flex; justify-content: space-between; margin-top: 30px; font-size: 9px; font-weight: bold; padding: 0 10px; }
            .footer-left { text-align: left; line-height: 1.3; width: 30%; }
            .footer-center { text-align: center; width: 30%; padding-top: 10px; }
            .footer-right { text-align: right; width: 35%; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
            .sign-box { text-align: center; }
          </style>
        </head>
        <body>
          
          <div class="top-bar">
            <div class="form-no">ફોર્મ નં. - ૪</div>
            <div class="main-heading">દૈનિક હાજરી પત્રક</div>
            <div class="sub-heading">${activeTab}</div>
          </div>
          
          <div class="center-title">જેને ભોજન આપવાનું છે તે વિદ્યાર્થીઓની સંખ્યા માટેનું પત્રક</div>

          <div class="info-bar">
            <span>તાલુકાનું નામ: ${profile?.taluka || '________________'}</span>
            <span>ગામનું નામ: ${profile?.village || '________________'}</span>
            <span>શાળાનું નામ: ${profile?.schoolName || '________________'}</span>
            <span>માહે: ${monthName} - ${yearName}</span>
          </div>

          <table>
            <colgroup>
               <col class="col-sm" /><col class="col-sm" /><col class="col-sm" /><col class="col-sm" />
               <col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/>
               <col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/>
               <col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/><col class="col-data"/>
               <col class="col-menu"/><col class="col-sign"/><col class="col-sign"/>
            </colgroup>
            <thead>
              <tr class="bg-head">
                <th rowspan="2">તારીખ</th>
                <th rowspan="2">વાર</th>
                <th rowspan="2">કુલ<br/>ધોરણ</th>
                <th rowspan="2">કુલ<br/>વર્ગો</th>
                <th colspan="7">તમામ ધોરણમાં નોંધાયેલ કુલ (વિદ્યાર્થીઓની) સંખ્યા</th>
                <th colspan="7">અહેવાલની તારીખે કુલ (વિદ્યાર્થીઓની) સંખ્યા</th>
                <th colspan="7">અહેવાલની તારીખે ભોજન લેનાર (વિદ્યાર્થીઓની) સંખ્યા</th>
                <th rowspan="2" class="vertical-text">
                  આપવામાં<br/>આવેલ<br/>વાનગીનું<br/>નામ
                </th>
                <th rowspan="2" class="vertical-text">
                  વ્યવસ્થાપકની<br/>સહી
                </th>
                <th rowspan="2" class="vertical-text">
                  આચાર્યની<br/>સહી
                </th>
              </tr>
              <tr class="bg-head">
                <th>અ.જા.</th><th>અ.જ.જા.</th><th>સા.શૈ.પ.</th><th>અન્ય</th><th>કુલ</th><th>કુમાર</th><th>કન્યા</th>
                <th>અ.જા.</th><th>અ.જ.જા.</th><th>સા.શૈ.પ.</th><th>અન્ય</th><th>કુલ</th><th>કુમાર</th><th>કન્યા</th>
                <th>અ.જા.</th><th>અ.જ.જા.</th><th>સા.શૈ.પ.</th><th>અન્ય</th><th>કુલ</th><th>કુમાર</th><th>કન્યા</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
              <tr style="font-weight: bold; background-color: #e0e0e0;">
                <td colspan="2">કુલ</td> <td>-</td><td>-</td>
                <td>${toGuj(totalReg.sc)}</td><td>${toGuj(totalReg.st)}</td><td>${toGuj(totalReg.obc)}</td><td>${toGuj(totalReg.other)}</td>
                <td>${toGuj(totalReg.total)}</td><td>${toGuj(totalReg.b)}</td><td>${toGuj(totalReg.g)}</td>
                <td>${toGuj(totalPres.sc)}</td><td>${toGuj(totalPres.st)}</td><td>${toGuj(totalPres.obc)}</td><td>${toGuj(totalPres.other)}</td>
                <td>${toGuj(totalPres.total)}</td><td>${toGuj(totalPres.b)}</td><td>${toGuj(totalPres.g)}</td>
                <td>${toGuj(totalMeal.sc)}</td><td>${toGuj(totalMeal.st)}</td><td>${toGuj(totalMeal.obc)}</td><td>${toGuj(totalMeal.other)}</td>
                <td>${toGuj(totalMeal.total)}</td><td>${toGuj(totalMeal.b)}</td><td>${toGuj(totalMeal.g)}</td>
                <td>-</td><td>-</td><td>-</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-wrapper">
            <div class="footer-left">
              <div>(૧) શાળા ચાલુ હોય તે દિવસની સંખ્યા: :- ${toGuj(workingDaysCount)}</div>
              <div>(૨) ભોજન આપેલ દિવસની સંખ્યા: :- ${toGuj(workingDaysCount)}</div>
              <div>(૩) કુલ ધોરણ: :- ${toGuj(stdCount)}</div>
              <div>(૪) કુલ વર્ગો: :- ${toGuj(classCount)}</div>
              <div>(૫) લાભાર્થી સરેરાશ સંખ્યા (કો. ૨૧ % ભોજનના દિવસો): :- ${toGuj(averageBeneficiaries)}</div>
            </div>

            <div class="footer-center">
              <div>રજૂ કરેલ હિસાબો સાથે ખરાઈ કરી.</div>
              <br/>
              <div style="font-weight:bold;">નાયબ મામલતદાર</div>
            </div>

            <div class="footer-right">
              <div class="sign-box">વ્યવસ્થાપકની સહી..........................</div>
              <div style="display:flex; justify-content:space-between; width:100%;">
                <div class="sign-box">આચાર્ય<br/>પ્રાથમિક શાળા</div>
                <div style="text-align:right;">
                  <div>નામ :- ${profile?.principalName || '_________'}</div>
                  <div>કેન્દ્ર નં. :- ${profile?.centerNo || '_________'}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent, orientation: Print.Orientation.landscape });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};