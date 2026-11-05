import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../../firebaseConfig';
import AuthInput from '../components/auth-input';
import Logo from '../components/logo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    setMessage('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setMessageIsError(true);
      setMessage(`Error al entrar: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setMessage('');
    if (!email.trim()) {
      setMessageIsError(true);
      setMessage('Escribe tu correo para enviarte el enlace de recuperación.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessageIsError(false);
      setMessage('Te enviamos un enlace para restablecer tu contraseña.');
    } catch (error) {
      setMessageIsError(true);
      setMessage(`Error al recuperar la contraseña: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Logo width={250} height={80} />
        <Text numberOfLines={1} style={styles.title}>
          Bienvenido de vuelta
        </Text>
        <View style={styles.form}>
          <AuthInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <AuthInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable
            accessibilityRole="button"
            onPress={handlePasswordReset}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
          {message ? (
            <Text style={[styles.message, messageIsError && styles.errorMessage]}>{message}</Text>
          ) : null}
          <PressableButton
            label={isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            onPress={handleLogin}
            disabled={isLoading}
          />
        </View>
        <View style={styles.prompt}>
          <Text style={styles.promptText}>¿No tienes cuenta? </Text>
          <Link href="/register" style={styles.link}>Regístrate</Link>
        </View>
      </ScrollView>
    </View>
  );
}

function PressableButton({
  disabled,
  label,
  onPress
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={[styles.submitButton, disabled && styles.disabledButton]}
    >
      <Text style={styles.submitButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#000000', flex: 1 },
  container: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 32
  },
  title: {
    color: '#F4F4F4',
    fontFamily: 'BarlowCondensed_600SemiBold_Italic',
    fontSize: 28,
    marginBottom: 27,
    marginTop: 25,
    textAlign: 'center'
  },
  form: { maxWidth: 360, width: '100%' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#C66B59', fontSize: 14 },
  message: { color: '#FFFFFF', fontSize: 14, marginBottom: 14, textAlign: 'center' },
  errorMessage: { color: '#FF8A76' },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#FF4500',
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 55,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  submitButtonText: { color: '#171717', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  disabledButton: { opacity: 0.6 },
  prompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  promptText: { color: '#F4F4F4', fontSize: 15 },
  link: { color: '#F15A37', fontSize: 15, fontWeight: 'bold' }
});