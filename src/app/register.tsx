import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AuthInput from '../components/auth-input';
import Logo from '../components/logo';
import { auth } from '../../firebaseConfig';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setMessage('');
    if (!fullName.trim()) {
      setMessageIsError(true);
      setMessage('Escribe tu nombre completo.');
      return;
    }

    setIsLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      try {
        await updateProfile(credential.user, { displayName: fullName.trim() });
      } catch (error) {
        setMessageIsError(true);
        setMessage(`La cuenta se creó, pero no se pudo guardar tu nombre: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
      setMessageIsError(false);
      setMessage('Cuenta creada correctamente.');
    } catch (error) {
      setMessageIsError(true);
      setMessage(`Error al registrarse: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Logo width={250} height={80} />
        <Text style={styles.title}>Crear cuenta</Text>
        <View style={styles.form}>
          <AuthInput
            placeholder="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
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
          {message ? (
            <Text style={[styles.message, messageIsError && styles.errorMessage]}>{message}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={isLoading ? undefined : handleRegister}
            style={[styles.submitButton, isLoading && styles.disabledButton]}
          >
            <Text style={styles.submitButtonText}>{isLoading ? 'Creando cuenta...' : 'Registrarse'}</Text>
          </Pressable>
        </View>
        <View style={styles.prompt}>
          <Text style={styles.promptText}>¿Ya tienes cuenta? </Text>
          <Link href="/" style={styles.link}>Inicia sesión</Link>
        </View>
      </ScrollView>
    </View>
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
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 27,
    marginTop: 25,
    textAlign: 'center'
  },
  form: { maxWidth: 360, width: '100%' },
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
