import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

export default function Button({ title, onPress, loading, disabled, variant = 'primary', style }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.green} />
      ) : (
        <Text style={variant === 'primary' ? styles.primaryText : styles.ghostText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  primary: { backgroundColor: colors.green },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ghostText: { color: colors.green, fontSize: 15, fontWeight: '600' },
});
