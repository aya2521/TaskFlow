import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useRewards } from '../hooks/useRewards';
import { getCompletionRate, getCurrentStreak, getLongestStreak, getTotalCompleted } from '../utils/stats';
import { getAchievements } from '../utils/achievements';
import { POINTS_PER_TASK } from '../constants/points';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Account'>;

export default function AccountScreen({ navigation }: Props) {
  const { theme, mode } = useTheme();
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { rewards } = useRewards();

  const totalCompleted = getTotalCompleted(tasks);
  const completionRate = getCompletionRate(tasks);
  const currentStreak = getCurrentStreak(tasks);
  const longestStreak = getLongestStreak(tasks);
  const rewardsRedeemed = rewards.filter((r) => r.redeemed).length;
  const earnedPoints = totalCompleted * POINTS_PER_TASK;
  const level = 1 + Math.floor(earnedPoints / 100);
  const pointsIntoLevel = earnedPoints % 100;

  const achievements = getAchievements(totalCompleted, longestStreak, rewardsRedeemed);
  const initials = (user?.displayName || user?.email || '?').charAt(0).toUpperCase();
  const story = buildStory(totalCompleted, longestStreak, rewardsRedeemed);
  const favoriteTheme = mode === 'system' ? 'System default' : mode.charAt(0).toUpperCase() + mode.slice(1);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.primary }}>← Back</Text>
      </Pressable>

      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{user?.displayName || 'Task Flow user'}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{user?.email}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Favorite theme: {favoriteTheme}</Text>
        </View>
      </View>

      <View style={[styles.levelCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Level</Text>
        <Text style={[styles.levelValue, { color: theme.primary }]}>{level}</Text>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${pointsIntoLevel}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>{pointsIntoLevel}/100 pts to next level</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistics</Text>
      <View style={styles.statsRow}>
        <StatBox theme={theme} label="Completed" value={String(totalCompleted)} />
        <StatBox theme={theme} label="Completion Rate" value={`${completionRate}%`} />
        <StatBox theme={theme} label="Current Streak" value={`${currentStreak}d`} />
        <StatBox theme={theme} label="Best Streak" value={`${longestStreak}d`} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Achievements & Milestones</Text>
      <View style={styles.achievementsGrid}>
        {achievements.map((a) => (
          <View key={a.id} style={[styles.achievementCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: a.unlocked ? 1 : 0.4 }]}>
            <Text style={{ fontSize: 24 }}>{a.icon}</Text>
            <Text style={[styles.achievementTitle, { color: theme.text }]}>{a.title}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center' }}>{a.description}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Story</Text>
      <View style={[styles.storyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.text, lineHeight: 20 }}>{story}</Text>
      </View>
    </ScrollView>
  );
}

function StatBox({ theme, label, value }: { theme: any; label: string; value: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

function buildStory(totalCompleted: number, longestStreak: number, rewardsRedeemed: number): string {
  if (totalCompleted === 0) return "You're just getting started — complete your first task to begin your story.";
  const parts = [`You've completed ${totalCompleted} task${totalCompleted === 1 ? '' : 's'} so far.`];
  if (longestStreak >= 2) parts.push(`Your best streak is ${longestStreak} day${longestStreak === 1 ? '' : 's'} in a row.`);
  parts.push(
    rewardsRedeemed > 0
      ? `You've treated yourself to ${rewardsRedeemed} reward${rewardsRedeemed === 1 ? '' : 's'} along the way.`
      : "You haven't redeemed a reward yet — your points are ready whenever you are."
  );
  return parts.join(' ');
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 60 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
  levelCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24 },
  levelValue: { fontSize: 32, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statBox: { width: '47%', borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  achievementCard: { width: '30%', borderWidth: 1, borderRadius: 14, padding: 10, alignItems: 'center' },
  achievementTitle: { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  storyCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
});