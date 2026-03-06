import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, FlatList, TouchableOpacity, Alert, SafeAreaView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SavedDataList = ({ visible, onClose, onSelectDate, storageKey }) => {
  const [dataList, setDataList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (visible) {
      loadSavedData();
    }
  }, [visible]);

  const loadSavedData = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        const keys = Object.keys(parsedData);

        const formattedList = keys.map((key) => {
          const dayData = parsedData[key];
          
          // Date Parsing (Robust)
          const parts = key.split('/');
          const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
          
          // Weekday in Gujarati
          const weekday = dateObj.toLocaleDateString('gu-IN', { weekday: 'long' });

          // Calculate Total Meals across all tabs
          let grandTotalMeal = 0;
          Object.keys(dayData).forEach(tab => {
             const m = dayData[tab]?.meals || {};
             grandTotalMeal += (parseInt(m.sc)||0) + (parseInt(m.st)||0) + (parseInt(m.obc)||0) + (parseInt(m.other)||0);
          });

          return {
            id: key,
            dateObj: dateObj,
            day: weekday,
            total: grandTotalMeal,
            fullData: dayData 
          };
        });

        // Sort by Date Descending (Latest First)
        formattedList.sort((a, b) => b.dateObj - a.dateObj);
        setDataList(formattedList);
      }
    } catch (e) {
      console.error("Load Error:", e);
    }
  };

  const deleteEntry = async (dateKey) => {
    Alert.alert(
      "ડેટા ડિલીટ",
      `${dateKey} નો ડેટા કાયમ માટે ડિલીટ કરવો છે?`,
      [
        { text: "ના", style: "cancel" },
        { 
          text: "હા, ડિલીટ કરો", style: 'destructive',
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem(storageKey);
              let parsedData = JSON.parse(stored);
              delete parsedData[dateKey];
              await AsyncStorage.setItem(storageKey, JSON.stringify(parsedData));
              // Remove from list immediately
              setDataList(prev => prev.filter(item => item.id !== dateKey));
            } catch (e) { Alert.alert("Error", "ડિલીટ નિષ્ફળ!"); }
          }
        }
      ]
    );
  };

  const getCounts = (sectionData) => {
    if (!sectionData) return '-';
    const total = (parseInt(sectionData.sc)||0) + (parseInt(sectionData.st)||0) + (parseInt(sectionData.obc)||0) + (parseInt(sectionData.other)||0);
    return total || '-';
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Smooth Animation
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => toggleExpand(item.id)} activeOpacity={0.9}>
          
          {/* Left: Date Info */}
          <View style={styles.cardLeft}>
            <Text style={styles.dateText}>{item.id}</Text>
            <Text style={styles.dayText}>{item.day}</Text>
          </View>
          
          {/* Middle: Total Meals */}
          <View style={styles.cardMid}>
            <Text style={styles.label}>કુલ ભોજન</Text>
            <Text style={styles.count}>{item.total}</Text>
          </View>

          {/* Right: Actions */}
          <View style={styles.cardRight}>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#3B82F6'}]} onPress={() => { onSelectDate(item.id); onClose(); }}>
                <MaterialIcons name="edit" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#EF4444'}]} onPress={() => deleteEntry(item.id)}>
                <MaterialIcons name="delete" size={18} color="#FFF" />
            </TouchableOpacity>
            <MaterialIcons name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Expanded View */}
        {isExpanded && (
          <View style={styles.detailsBox}>
            <View style={styles.detailHeader}>
                <Text style={[styles.dHeadText, {flex: 2, textAlign:'left'}]}>વિભાગ</Text>
                <Text style={styles.dHeadText}>રજિ.</Text>
                <Text style={styles.dHeadText}>હાજર</Text>
                <Text style={styles.dHeadText}>ભોજન</Text>
            </View>
            
            {Object.keys(item.fullData).map((tab, index) => {
                const d = item.fullData[tab];
                return (
                    <View key={index} style={[styles.detailRow, index % 2 !== 0 && styles.zebraRow]}>
                        <Text style={[styles.dText, {flex: 2, textAlign:'left', fontWeight:'600', color:'#374151'}]}>{tab}</Text>
                        <Text style={styles.dText}>{getCounts(d.register)}</Text>
                        <Text style={styles.dText}>{getCounts(d.present)}</Text>
                        <Text style={[styles.dText, {color:'#4F46E5', fontWeight:'bold'}]}>{getCounts(d.meals)}</Text>
                    </View>
                );
            })}
            
            {/* Show Menu if any holiday or special item */}
            <View style={styles.menuFooter}>
                 <Text style={styles.menuText}>મેનુ: {item.fullData['ધો. ૧ થી ૫']?.menu || 'નથી'}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>સેવ કરેલ ડેટા ({dataList.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={26} color="#1F2937" />
            </TouchableOpacity>
        </View>

        <FlatList
            data={dataList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="history" size={60} color="#D1D5DB" />
                    <Text style={styles.emptyText}>હજુ સુધી કોઈ ડેટા સેવ નથી કર્યો.</Text>
                </View>
            }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  closeBtn: { padding: 4, borderRadius: 20, backgroundColor: '#F3F4F6' },
  
  cardContainer: { marginBottom: 12, borderRadius: 12, backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2, overflow: 'hidden' },
  
  // Card Main
  card: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  cardLeft: { flex: 2 },
  dateText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  dayText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  cardMid: { flex: 1.5, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F3F4F6', paddingHorizontal: 5 },
  label: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase' },
  count: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },

  cardRight: { flex: 2, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  actionBtn: { padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  // Details
  detailsBox: { backgroundColor: '#F9FAFB', padding: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  detailHeader: { flexDirection: 'row', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  dHeadText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#9CA3AF', textAlign: 'center' },
  
  detailRow: { flexDirection: 'row', paddingVertical: 8, alignItems:'center' },
  zebraRow: { backgroundColor: '#F3F4F6', borderRadius: 6 },
  dText: { flex: 1, fontSize: 13, color: '#4B5563', textAlign: 'center' },
  
  menuFooter: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  menuText: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#9CA3AF' }
});

export default SavedDataList;