import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ConsumerDashboardScreen from '../screens/ConsumerDashboardScreen';
import RetailerDashboardScreen from '../screens/RetailerDashboardScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

/**
 * The mobile equivalent of the web's ProtectedRoute, but stronger: signed-out
 * users have no dashboard route registered at all, so there is nothing to
 * navigate to and no back-stack entry to return to after logging out.
 */
export default function RootNavigator() {
  const { user, loading } = useAuth();

  // Wait for the stored token to be checked, or the login screen flashes on
  // every cold start for an already-signed-in user.
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.green },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {user ? (
        user.role === 'retailer' ? (
          <Stack.Screen name="Retailer" component={RetailerDashboardScreen} options={{ title: 'Agrilink' }} />
        ) : (
          <Stack.Screen name="Consumer" component={ConsumerDashboardScreen} options={{ title: 'Agrilink' }} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Agrilink' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
