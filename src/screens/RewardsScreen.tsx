import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../hooks/useTasks';
import { useRewards } from '../hooks/useRewards';
import { redeemReward } from '../services/rewardService';
import { Reward } from '../types/reward';
import { POINTS_PER_TASK } from '../constants/points';
import RewardCard from '../components/RewardCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Rewards'>;

export default function RewardsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { tasks, loading: tasksLoading } = useTasks();
  const { rewards, loading: rewardsLoading, error } = useRewards();

  const earnedPoints = tasks.filter((t) => t.completed).length * POINTS_PER_TASK;
  const spentPoints = rewards.filter((r) => r.redeemed).reduce((sum, r) => sum + r.cost, 0);
  const availablePoints = earnedPoints - spentPoints;

  const loading = tasksLoading || rewardsLoading;

  async function handleRedeem(reward: Reward) {
    if (reward.cost > availablePoints) return; // shouldn't be reachable, RewardCard disables it
    Alert.alert('Redeem reward?', `Spend ${reward.cost} points on "${reward.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem',
        onPress: async () => {
          const { error: redeemError } = await redeemReward(reward.id);
          if (redeemError) Alert.alert('Error', redeemError);
        },
      },
    ]);
  }

  function handlePress(reward: Reward) {
    navigation.navigate('AddEditReward', { rewardId: reward.id });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.primary }}>← Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.text }]}>Rewards</Text>

      <View style={[styles.balanceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Available Points</Text>
        <Text style={[styles.balance, { color: theme.primary }]}>{availablePoints}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
          {POINTS_PER_TASK} pts per completed task
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: '#EF4444', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <RewardCard
              reward={item}
              affordable={item.cost <= availablePoints}
              onPress={handlePress}
              onRedeem={handleRedeem}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Tap + to create your first reward.
            </Text>
          }
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddEditReward')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  balanceCard: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 20, alignItems: 'center' },
  balance: { fontSize: 36, fontWeight: '800', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});