import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../hooks/useTasks';
import { getCompletionRate, getWeeklyCompletions, getPriorityBreakdown, getCurrentStreak } from '../utils/stats';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Statistics'>;

const screenWidth = Dimensions.get('window').width;

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function StatisticsScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { tasks, loading } = useTasks();

  const completionRate = getCompletionRate(tasks);
  const weekly = getWeeklyCompletions(tasks);
  const priorityBreakdown = getPriorityBreakdown(tasks).filter((p) => p.count > 0);
  const streak = getCurrentStreak(tasks);

  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: () => theme.primary,
    labelColor: () => theme.textSecondary,
    barPercentage: 0.6,
    decimalPlaces: 0,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.primary }}>← Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>

      {tasks.length === 0 ? (
        <Text style={{ color: theme.textSecondary, marginTop: 40, textAlign: 'center' }}>
          Complete some tasks to see your stats here.
        </Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>{completionRate}%</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Completion Rate</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Current Streak</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
          <BarChart
            data={{
              labels: weekly.map((d) => d.label),
              datasets: [{ data: weekly.map((d) => d.count) }],
            }}
            width={screenWidth - 40}
            height={200}
            fromZero
            showValuesOnTopOfBars
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />

          {priorityBreakdown.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>By Priority</Text>
              <PieChart
                data={priorityBreakdown.map((p) => ({
                  name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
                  population: p.count,
                  color: PRIORITY_COLORS[p.priority],
                  legendFontColor: theme.textSecondary,
                  legendFontSize: 13,
                }))}
                width={screenWidth - 40}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="8"
              />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 60 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  chart: { borderRadius: 16, marginBottom: 24 },
});