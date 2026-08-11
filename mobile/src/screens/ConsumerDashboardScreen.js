import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { colors, spacing, radius } from '../theme';

export default function ConsumerDashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hello, {user.name}</Text>
      <Text style={styles.subtitle}>Browse fresh produce from farmers near you.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your account</Text>
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={`+91 ${user.phone}`} />
        <Row label="Account type" value={user.role} />
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>Produce listings, cart, and orders land here next.</Text>
      </View>

      <Button title="Log out" variant="ghost" onPress={logout} />
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },
  title: { fontSize: 22, fontWeight: '700', color: colors.green },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  row: { flexDirection: 'row', paddingVertical: spacing.xs + 2 },
  rowLabel: { width: 110, color: colors.muted, fontSize: 14 },
  rowValue: { flex: 1, color: colors.text, fontSize: 14, textTransform: 'capitalize' },
  notice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: { color: colors.muted, fontSize: 14 },
});
