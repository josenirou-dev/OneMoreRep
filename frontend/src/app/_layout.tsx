import { BarlowCondensed_600SemiBold_Italic } from '@expo-google-fonts/barlow-condensed';
import { useFonts } from 'expo-font';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ BarlowCondensed_600SemiBold_Italic });
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const segments = useSegments();
  const inTabs = segments[0] === '(tabs)';
  const inAuthScreens = !inTabs && segments[0] !== 'register';

  useEffect(() => onAuthStateChanged(
    auth,
    (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    },
    (error) => {
      setAuthError(error);
      setAuthReady(true);
    }
  ), []);

  useEffect(() => {
    if (!authReady || authError) {
      return;
    }

    if (!user && inTabs) {
      router.replace('/');
    } else if (user && inAuthScreens) {
      router.replace('/(tabs)/rutinas');
    }
  }, [authError, authReady, inAuthScreens, inTabs, user]);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded || !authReady) {
    return null;
  }

  if (authError) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorText}>
          No se pudo comprobar tu sesión: {authError.message}
        </Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  errorScreen: {
    alignItems: 'center',
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  errorText: {
    color: '#FF8A76',
    fontSize: 16,
    textAlign: 'center'
  }
});
