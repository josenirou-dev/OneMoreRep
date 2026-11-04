import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setMessage('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Cuenta creada. Ya puedes iniciar sesión.');
    } catch (error) {
      setMessage(`Error al registrar: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLogin = async () => {
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Iniciaste sesión correctamente.');
      // Aquí agregaremos la navegación a tus rutinas más adelante
    } catch (error) {
      setMessage(`Error al entrar: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>One More Rep</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.buttonContainer}>
        <Button title="Iniciar Sesión" onPress={handleLogin} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Registrarse" onPress={handleRegister} color="#555" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 8 },
  buttonContainer: { marginBottom: 12 },
  message: { marginBottom: 16, textAlign: 'center', color: '#333' }
});