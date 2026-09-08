import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Haptics } from '../utils/haptics';

interface CalendarModalProps {
  visible: boolean;
  selectedDate: string; // YYYY-MM-DD
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
}) => {
  const { theme } = useTheme();

  // Parse current selected or fallback to today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const [currentYear, setCurrentYear] = useState(validInitialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validInitialDate.getMonth());
  const [tempSelectedDate, setTempSelectedDate] = useState<string>(
    validInitialDate.toISOString().split('T')[0]
  );

  const handlePrevMonth = () => {
    Haptics.selection();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.selection();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const todayStr = new Date().toISOString().split('T')[0];

  const calendarDays = [];
  // Empty slots before first day of month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDayPress = (day: number) => {
    Haptics.selection();
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    setTempSelectedDate(dateStr);
  };

  const handleConfirm = () => {
    Haptics.success();
    onSelectDate(tempSelectedDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <CalendarIcon size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Select Target Release Date
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthRow}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.7}>
                  <ChevronLeft size={22} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: theme.colors.text }]}>
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.7}>
                  <ChevronRight size={22} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Day of Week Header */}
              <View style={styles.weekHeader}>
                {DAYS_OF_WEEK.map((d) => (
                  <Text key={d} style={[styles.weekDayText, { color: theme.colors.textSecondary }]}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.grid}>
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.daySlot} />;
                  }

                  const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                  const formattedDay = String(day).padStart(2, '0');
                  const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

                  const isSelected = dateStr === tempSelectedDate;
                  const isToday = dateStr === todayStr;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      onPress={() => handleDayPress(day)}
                      style={[
                        styles.daySlot,
                        isSelected && { backgroundColor: theme.colors.primary },
                        !isSelected && isToday && { borderWidth: 1.5, borderColor: theme.colors.primary },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: theme.colors.text },
                          isSelected && { color: '#FFFFFF', fontWeight: '700' },
                          !isSelected && isToday && { color: theme.colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Summary & Confirm Bar */}
              <View style={styles.footerBar}>
                <View>
                  <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Selected Date</Text>
                  <Text style={[styles.footerDateText, { color: theme.colors.text }]}>
                    {tempSelectedDate || 'None'}
                  </Text>
                </View>

                <View style={styles.footerActions}>
                  <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                    <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn} activeOpacity={0.85}>
                    <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.confirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  daySlot: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerDateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
