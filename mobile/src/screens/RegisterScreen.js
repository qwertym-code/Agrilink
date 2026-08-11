import { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../api/client';
import Field from '../components/Field';
import Button from '../components/Button';
import { colors, spacing, radius } from '../theme';

const EMPTY = {
  name: '', email: '', phone: '', password: '',
  role: 'consumer', farmName: '', location: '',
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isRetailer = form.role === 'retailer';
  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    // Consumers never send shop details.
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      ...(isRetailer ? { farmName: form.farmName.trim(), location: form.location.trim() } : {}),
    };

    try {
      await register(payload);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Join Agrilink</Text>
          <Text style={styles.subtitle}>Buy fresh produce, or sell what you grow.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Role decides which fields matter, so it comes first. */}
          <Text style={styles.label}>I am a</Text>
          <View style={styles.toggleRow}>
            {[
              { value: 'consumer', label: 'Consumer' },
              { value: 'retailer', label: 'Retailer / Farmer' },
            ].map((option, index) => {
              const active = form.role === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setForm((prev) => ({ ...prev, role: option.value }))}
                  style={[
                    styles.toggle,
                    index === 0 ? styles.toggleLeft : styles.toggleRight,
                    active && styles.toggleActive,
                  ]}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Full name"
            value={form.name}
            onChangeText={update('name')}
            error={fieldErrors.name}
            autoCapitalize="words"
          />

          <Field
            label="Email"
            value={form.email}
            onChangeText={update('email')}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Field
            label="Phone number"
            prefix="+91"
            placeholder="9876543210"
            value={form.phone}
            onChangeText={update('phone')}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
            maxLength={13}
            hint="You can log in with this number or your email."
          />

          <Field
            label="Password"
            value={form.password}
            onChangeText={update('password')}
            error={fieldErrors.password}
            secureTextEntry
            autoCapitalize="none"
            hint="At least 6 characters."
          />

          {isRetailer && (
            <>
              <Field
                label="Farm / shop name"
                value={form.farmName}
                onChangeText={update('farmName')}
                error={fieldErrors.farmName}
              />
              <Field
                label="Location"
                placeholder="Village / town, district"
                value={form.location}
                onChangeText={update('location')}
                error={fieldErrors.location}
              />
            </>
          )}

          <Button title="Create account" onPress={handleSubmit} loading={submitting} />

          <Button
            title="Already have an account? Log in"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.green },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.lg },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs + 2 },
  toggleRow: { flexDirection: 'row', marginBottom: spacing.md },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.green,
  },
  toggleLeft: { borderTopLeftRadius: radius.sm, borderBottomLeftRadius: radius.sm },
  toggleRight: { borderTopRightRadius: radius.sm, borderBottomRightRadius: radius.sm, borderLeftWidth: 0 },
  toggleActive: { backgroundColor: colors.green },
  toggleText: { color: colors.green, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
});
