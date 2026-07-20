import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  size?: number;
}

export default function Logo({ size = 96 }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '800' },
});