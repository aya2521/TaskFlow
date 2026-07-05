import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Reward } from '../types/reward';

interface Props {
  reward: Reward;
  affordable: boolean;
  onPress: (reward: Reward) => void;
  onRedeem: (reward: Reward) => void;
}

export default function RewardCard({ reward, affordable, onPress, onRedeem }: Props) {
  const { theme } = useTheme();
  const locked = !reward.redeemed && !affordable;

  return (
    <Pressable
      onPress={() => onPress(reward)}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: reward.redeemed ? 0.6 : locked ? 0.7 : 1 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {reward.title}
        </Text>
        {!!reward.description && (
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={2}>
            {reward.description}
          </Text>
        )}
        <Text style={[styles.cost, { color: theme.primary }]}>{reward.cost} pts</Text>
      </View>

      {reward.redeemed ? (
        <View style={[styles.badge, { backgroundColor: theme.border }]}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Redeemed</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => onRedeem(reward)}
          disabled={locked}
          style={[styles.redeemButton, { backgroundColor: locked ? theme.border : theme.primary }]}
        >
          <Text style={{ color: locked ? theme.textSecondary : '#fff', fontSize: 13, fontWeight: '600' }}>
            {locked ? 'Locked' : 'Redeem'}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  title: { fontSize: 15, fontWeight: '600' },
  cost: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  redeemButton: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginLeft: 10 },
  badge: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 10 },
});