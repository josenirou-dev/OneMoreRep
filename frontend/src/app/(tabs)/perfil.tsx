import { signOut } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../../firebaseConfig';

export default function ProfileScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const user = auth.currentUser;

  const handleSignOut = async () => {
    setErrorMessage('');
    setIsSigningOut(true);

    try {
      await signOut(auth);
    } catch (error) {
      setErrorMessage(
        `No se pudo cerrar la sesión: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.displayName || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={isSigningOut}
        onPress={handleSignOut}
        style={[styles.signOutButton, isSigningOut && styles.disabledButton]}
      >
        <Text style={styles.signOutText}>
          {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000000',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72
  },
  title: {
    color: '#F4F4F4',
    fontFamily: 'BarlowCondensed_600SemiBold_Italic',
    fontSize: 38
  },
  card: {
    backgroundColor: '#171717',
    borderColor: '#2B2B2B',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 28,
    padding: 20
  },
  name: {
    color: '#F4F4F4',
    fontSize: 18,
    fontWeight: '700'
  },
  email: {
    color: '#A0A0A0',
    fontSize: 15,
    marginTop: 8
  },
  error: {
    color: '#FF8A76',
    fontSize: 14,
    marginTop: 16
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: '#FF5A36',
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
    paddingHorizontal: 16
  },
  signOutText: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '700'
  },
  disabledButton: {
    opacity: 0.6
  }
});
