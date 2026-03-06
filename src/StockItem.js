import React from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export const StockItem = ({ item, onUpdate }) => {
  
  // ડેટા પાર્સિંગ
  const opening = parseFloat(item.opening) || 0;
  const incoming = parseFloat(item.incoming) || 0;
  const vaprashBhojan = parseFloat(item.used_bhojan) || 0;
  const vaprashSukhdi = parseFloat(item.used_sukhdi) || 0;
  
  // ગણતરીઓ
  const total = (opening + incoming).toFixed(3);
  const totalUsed = vaprashBhojan + vaprashSukhdi;
  const bachat = (parseFloat(total) - totalUsed).toFixed(3);

  // જો બચત માઈનસમાં જાય તો લાલ કલર બતાવવા માટે
  const isNegative = parseFloat(bachat) < 0;

  return (
    <View style={[styles.stockCard, isNegative && styles.errorCard]}>
      
      {/* ૧. હેડર: નામ અને યુનિટ */}
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <FontAwesome5 
            name={item.name.includes('તેલ') ? "tint" : "seedling"} 
            size={14} 
            color="#ea580c" 
          />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.unitBadge}>
          <Text style={styles.unitText}>{item.unit.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ૨. સ્ટોક ગણતરી સેક્શન (Row 1) */}
      <View style={styles.inputGrid}>
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>૧. ઉઘડતો</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{opening.toFixed(3)}</Text>
          </View>
        </View>
        
        <View style={styles.inputCol}>
          <Text style={[styles.inputLabel, {color: '#ea580c'}]}>૨. આવક (+)</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="decimal-pad" 
            placeholder="0.000"
            placeholderTextColor="#cbd5e1"
            value={item.incoming?.toString()}
            onChangeText={(v) => onUpdate(item.id, 'incoming', v)}
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>૩. કુલ જથ્થો</Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>{total}</Text>
          </View>
        </View>
      </View>

      {/* ૩. વપરાશ સેક્શન (Row 2) */}
      <View style={[styles.inputGrid, { marginTop: 15 }]}>
        <View style={styles.inputColLarge}>
          <Text style={[styles.inputLabel, {color: '#3b82f6'}]}>૪. વપરાશ (ભોજન)</Text>
          <TextInput 
            style={[styles.input, styles.bhojanInput]} 
            keyboardType="decimal-pad" 
            placeholder="0.000"
            value={item.used_bhojan?.toString()}
            onChangeText={(v) => onUpdate(item.id, 'used_bhojan', v)}
          />
        </View>

        <View style={styles.inputColLarge}>
          <Text style={[styles.inputLabel, {color: '#8b5cf6'}]}>૫. વપરાશ (સુખડી)</Text>
          <TextInput 
            style={[styles.input, styles.sukhdiInput]} 
            keyboardType="decimal-pad" 
            placeholder="0.000"
            value={item.used_sukhdi?.toString()}
            onChangeText={(v) => onUpdate(item.id, 'used_sukhdi', v)}
          />
        </View>
      </View>

      {/* ૪. ફૂટર: ફાઇનલ બચત */}
      <View style={[styles.closingRow, isNegative && styles.errorClosing]}>
        <View>
          <Text style={styles.closingLabel}>૬. આખર સ્ટોક (બચત)</Text>
          {isNegative && <Text style={styles.errorHint}>સ્ટોક ખૂટે છે!</Text>}
        </View>
        <View style={styles.resultContainer}>
          <Text style={[styles.closingValue, isNegative && styles.errorText]}>
            {bachat}
          </Text>
          <Text style={[styles.resultUnit, isNegative && styles.errorText]}> {item.unit}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stockCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1, 
    borderColor: '#f1f5f9' 
  },
  errorCard: { borderColor: '#fee2e2', backgroundColor: '#fffafb' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconCircle: { backgroundColor: '#fff7ed', padding: 8, borderRadius: 10 },
  itemName: { fontSize: 17, fontWeight: '700', marginLeft: 12, flex: 1, color: '#1e293b' },
  unitBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  unitText: { color: '#64748b', fontWeight: '800', fontSize: 10 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 15 },
  inputGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  inputCol: { width: '31%' },
  inputColLarge: { width: '48%' },
  inputLabel: { fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: '700' },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    paddingVertical: 10, 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#334155' 
  },
  bhojanInput: { borderColor: '#dbeafe', color: '#1d4ed8' },
  sukhdiInput: { borderColor: '#f3e8ff', color: '#7e22ce' },
  readOnlyBox: { 
    backgroundColor: '#f8fafc', 
    borderRadius: 12, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: '#f1f5f9',
    alignItems: 'center'
  },
  readOnlyText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  totalBox: { 
    backgroundColor: '#f0fdf4', 
    borderRadius: 12, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: '#dcfce7',
    alignItems: 'center'
  },
  totalText: { fontSize: 16, color: '#15803d', fontWeight: '800' },
  closingRow: { 
    marginTop: 18, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  closingLabel: { fontSize: 13, color: '#475569', fontWeight: '700' },
  resultContainer: { flexDirection: 'row', alignItems: 'baseline' },
  closingValue: { fontSize: 22, fontWeight: '900', color: '#059669' },
  resultUnit: { fontSize: 12, color: '#059669', fontWeight: '600' },
  errorText: { color: '#dc2626' },
  errorHint: { fontSize: 10, color: '#ef4444', fontWeight: '600' },
  errorClosing: { borderTopColor: '#fee2e2' }
});