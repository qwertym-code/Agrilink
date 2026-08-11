import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

/**
 * Labelled text input with optional fixed prefix (used for +91) and either an
 * error or a hint underneath — the error wins when both are present.
 */
export default function Field({ label, error, hint, prefix, style, ...inputProps }) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputRow, error && styles.inputRowError]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          {...inputProps}
        />
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs + 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: '#fff',
  },
  inputRowError: { borderColor: colors.danger },
  prefix: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 12,
    color: colors.muted,
    backgroundColor: '#f1f3ef',
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    overflow: 'hidden',
  },
  input: { flex: 1, paddingHorizontal: spacing.sm + 4, paddingVertical: 12, fontSize: 16, color: colors.text },
  error: { marginTop: spacing.xs, fontSize: 13, color: colors.danger },
  hint: { marginTop: spacing.xs, fontSize: 13, color: colors.muted },
});
