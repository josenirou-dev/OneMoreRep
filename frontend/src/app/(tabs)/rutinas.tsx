import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { auth } from '../../../firebaseConfig';
import { createRoutine, getRoutines, type Routine } from '../../lib/api';

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRoutines = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('Inicia sesión para ver tus rutinas.');
      setIsLoading(false);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      const idToken = await user.getIdToken();
      setRoutines(await getRoutines(idToken));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, () => {
      void loadRoutines();
    });
  }, [loadRoutines]);

  const handleCreateRoutine = async () => {
    const routineName = name.trim();
    const user = auth.currentUser;

    if (!routineName) {
      setErrorMessage('Escribe un nombre para la rutina.');
      return;
    }
    if (!user) {
      setErrorMessage('Inicia sesión para crear una rutina.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    try {
      const idToken = await user.getIdToken();
      const routine = await createRoutine(idToken, routineName);
      setRoutines((currentRoutines) => [routine, ...currentRoutines]);
      setName('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={loadRoutines}
          tintColor="#FF5A36"
        />
      }
    >
      <StatusBar style="light" />
      <Text style={styles.eyebrow}>ONEMOREREP</Text>
      <Text style={styles.title}>Tus rutinas</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Crear rutina</Text>
        <TextInput
          accessibilityLabel="Nombre de la rutina"
          autoCapitalize="sentences"
          maxLength={80}
          onChangeText={setName}
          onSubmitEditing={handleCreateRoutine}
          placeholder="Ej. Tren superior"
          placeholderTextColor="#777777"
          returnKeyType="done"
          style={styles.input}
          value={name}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={handleCreateRoutine}
          style={[styles.button, isSaving && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>
            {isSaving ? 'Guardando...' : 'Guardar rutina'}
          </Text>
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Text style={styles.sectionTitle}>Tus entrenamientos</Text>

      {isLoading ? (
        <ActivityIndicator color="#FF5A36" style={styles.loader} />
      ) : routines.length ? (
        routines.map((routine) => (
          <View key={routine._id} style={styles.routineCard}>
            <Text style={styles.cardTitle}>{routine.name}</Text>
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aún no tienes rutinas</Text>
          <Text style={styles.description}>
            Crea una rutina arriba y aparecerá aquí.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#000000',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32
  },
  eyebrow: {
    color: '#FF5A36',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2
  },
  title: {
    color: '#F4F4F4',
    fontFamily: 'BarlowCondensed_600SemiBold_Italic',
    fontSize: 38,
    marginTop: 8
  },
  card: {
    backgroundColor: '#171717',
    borderColor: '#2B2B2B',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    padding: 20
  },
  cardTitle: {
    color: '#F4F4F4',
    fontSize: 18,
    fontWeight: '700'
  },
  input: {
    backgroundColor: '#222222',
    borderColor: '#3A3A3A',
    borderRadius: 10,
    borderWidth: 1,
    color: '#F4F4F4',
    fontSize: 16,
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 14
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#FF5A36',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 50
  },
  buttonText: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '700'
  },
  disabledButton: {
    opacity: 0.6
  },
  sectionTitle: {
    color: '#F4F4F4',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 32
  },
  routineCard: {
    backgroundColor: '#171717',
    borderColor: '#2B2B2B',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 20
  },
  description: {
    color: '#A0A0A0',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  error: {
    color: '#FF8A76',
    fontSize: 14,
    marginTop: 16
  },
  loader: {
    marginTop: 24
  }
});
