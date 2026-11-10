import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Alert,
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
import {
  createRoutine,
  deleteRoutine,
  getRoutines,
  type Routine,
  type RoutineExercise,
  updateRoutine
} from '../../lib/api';

type CreationStep = 'name' | 'exercises' | null;
type LoadType = 'bodyweight' | 'weighted' | 'both' | null;

function getLoadType(usesBodyweight: boolean, usesWeights: boolean): LoadType {
  if (usesBodyweight && usesWeights) return 'both';
  if (usesBodyweight) return 'bodyweight';
  if (usesWeights) return 'weighted';
  return null;
}

function getLoadTypeLabel(
  loadType: LoadType | undefined,
  weightKg: number | null | undefined
) {
  switch (loadType) {
    case 'bodyweight':
      return 'PC';
    case 'weighted':
      return weightKg != null ? `${weightKg} kg` : 'Kg sin cantidad';
    case 'both':
      return weightKg != null ? `PC + ${weightKg} kg` : 'PC + Kg sin cantidad';
    default:
      return 'Sin especificar';
  }
}

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [creationStep, setCreationStep] = useState<CreationStep>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseSets, setExerciseSets] = useState('3');
  const [exerciseWeightKg, setExerciseWeightKg] = useState('');
  const [exerciseUsesBodyweight, setExerciseUsesBodyweight] = useState(false);
  const [exerciseUsesWeights, setExerciseUsesWeights] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editedExerciseName, setEditedExerciseName] = useState('');
  const [editedExerciseSets, setEditedExerciseSets] = useState('');
  const [editedExerciseWeightKg, setEditedExerciseWeightKg] = useState('');
  const [editedExerciseUsesBodyweight, setEditedExerciseUsesBodyweight] = useState(false);
  const [editedExerciseUsesWeights, setEditedExerciseUsesWeights] = useState(false);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);

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

  const resetCreation = () => {
    setCreationStep(null);
    setEditingRoutineId(null);
    setName('');
    setExerciseName('');
    setExerciseSets('3');
    setExerciseWeightKg('');
    setExerciseUsesBodyweight(false);
    setExerciseUsesWeights(false);
    setEditingExerciseIndex(null);
    setEditedExerciseName('');
    setEditedExerciseSets('');
    setEditedExerciseWeightKg('');
    setEditedExerciseUsesBodyweight(false);
    setEditedExerciseUsesWeights(false);
    setExercises([]);
    setErrorMessage('');
  };

  const handleStartCreation = () => {
    setEditingRoutineId(null);
    setName('');
    setEditingExerciseIndex(null);
    setExercises([]);
    setErrorMessage('');
    setCreationStep('name');
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutineId(routine._id);
    setName(routine.name);
    setExercises(routine.exercises ?? []);
    setExerciseName('');
    setExerciseSets('3');
    setExerciseWeightKg('');
    setExerciseUsesBodyweight(false);
    setExerciseUsesWeights(false);
    setEditingExerciseIndex(null);
    setErrorMessage('');
    setCreationStep('name');
  };

  const handleContinueToExercises = () => {
    if (!name.trim()) {
      setErrorMessage('Escribe un nombre para la rutina.');
      return;
    }
    setErrorMessage('');
    setCreationStep('exercises');
  };

  const handleAddExercise = () => {
    const trimmedName = exerciseName.trim();
    const sets = Number(exerciseSets);
    const weightKg = Number(exerciseWeightKg.replace(',', '.'));
    if (!trimmedName || trimmedName.length > 80) {
      setErrorMessage('Escribe un nombre de ejercicio de hasta 80 caracteres.');
      return;
    }
    if (!Number.isInteger(sets) || sets < 1 || sets > 30) {
      setErrorMessage('Cada ejercicio debe tener entre 1 y 30 series.');
      return;
    }
    if (exercises.length >= 20) {
      setErrorMessage('Puedes agregar hasta 20 ejercicios por rutina.');
      return;
    }
    if (
      exerciseUsesWeights &&
      (!exerciseWeightKg.trim() ||
        !Number.isFinite(weightKg) ||
        weightKg <= 0 ||
        weightKg > 9999)
    ) {
      setErrorMessage('Indica una carga mayor que 0 y hasta 9999 kg.');
      return;
    }

    setExercises((currentExercises) => [
      ...currentExercises,
      {
        name: trimmedName,
        sets,
        imageKey: null,
        loadType: getLoadType(exerciseUsesBodyweight, exerciseUsesWeights),
        weightKg: exerciseUsesWeights ? weightKg : null
      }
    ]);
    setExerciseName('');
    setExerciseSets('3');
    setExerciseWeightKg('');
    setExerciseUsesBodyweight(false);
    setExerciseUsesWeights(false);
    setErrorMessage('');
  };

  const handleEditExercise = (index: number) => {
    const exercise = exercises[index];
    setEditingExerciseIndex(index);
    setEditedExerciseName(exercise.name);
    setEditedExerciseSets(String(exercise.sets));
    setEditedExerciseWeightKg(
      exercise.weightKg != null ? String(exercise.weightKg) : ''
    );
    setEditedExerciseUsesBodyweight(
      exercise.loadType === 'bodyweight' || exercise.loadType === 'both'
    );
    setEditedExerciseUsesWeights(
      exercise.loadType === 'weighted' || exercise.loadType === 'both'
    );
    setErrorMessage('');
  };

  const handleSaveExerciseEdit = (index: number) => {
    const trimmedName = editedExerciseName.trim();
    const sets = Number(editedExerciseSets);
    const weightKg = Number(editedExerciseWeightKg.replace(',', '.'));
    if (!trimmedName || trimmedName.length > 80) {
      setErrorMessage('Escribe un nombre de ejercicio de hasta 80 caracteres.');
      return;
    }
    if (!Number.isInteger(sets) || sets < 1 || sets > 30) {
      setErrorMessage('Cada ejercicio debe tener entre 1 y 30 series.');
      return;
    }
    if (
      editedExerciseUsesWeights &&
      (!editedExerciseWeightKg.trim() ||
        !Number.isFinite(weightKg) ||
        weightKg <= 0 ||
        weightKg > 9999)
    ) {
      setErrorMessage('Indica una carga mayor que 0 y hasta 9999 kg.');
      return;
    }

    setExercises((currentExercises) =>
      currentExercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index
          ? {
              ...exercise,
              name: trimmedName,
              sets,
              loadType: getLoadType(
                editedExerciseUsesBodyweight,
                editedExerciseUsesWeights
              ),
              weightKg: editedExerciseUsesWeights ? weightKg : null
            }
          : exercise
      )
    );
    setEditingExerciseIndex(null);
    setErrorMessage('');
  };

  const handleCancelExerciseEdit = () => {
    setEditingExerciseIndex(null);
    setErrorMessage('');
  };

  const handleSaveRoutine = async () => {
    const routineName = name.trim();
    const user = auth.currentUser;

    if (!routineName) {
      setCreationStep('name');
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
      if (editingRoutineId) {
        const updatedRoutine = await updateRoutine(
          idToken,
          editingRoutineId,
          routineName,
          exercises
        );
        setRoutines((currentRoutines) =>
          currentRoutines.map((routine) =>
            routine._id === updatedRoutine._id ? updatedRoutine : routine
          )
        );
      } else {
        const routine = await createRoutine(idToken, routineName, exercises);
        setRoutines((currentRoutines) => [routine, ...currentRoutines]);
      }
      resetCreation();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoutine = async (routine: Routine) => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('Inicia sesión para eliminar una rutina.');
      return;
    }

    setErrorMessage('');
    setDeletingRoutineId(routine._id);
    try {
      const idToken = await user.getIdToken();
      await deleteRoutine(idToken, routine._id);
      setRoutines((currentRoutines) =>
        currentRoutines.filter((currentRoutine) => currentRoutine._id !== routine._id)
      );
      if (editingRoutineId === routine._id) {
        resetCreation();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingRoutineId(null);
    }
  };

  const confirmDeleteRoutine = (routine: Routine) => {
    Alert.alert(
      'Eliminar rutina',
      `¿Quieres eliminar "${routine.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void handleDeleteRoutine(routine);
          }
        }
      ]
    );
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

      {creationStep === null ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleStartCreation}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Crear rutina</Text>
        </Pressable>
      ) : creationStep === 'name' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingRoutineId ? 'Editar rutina' : 'Crear rutina'}
          </Text>
          <Text style={styles.description}>
            {editingRoutineId ? 'Modifica el nombre de la rutina.' : 'Primero, elige un nombre.'}
          </Text>
          <TextInput
            accessibilityLabel="Nombre de la rutina"
            autoCapitalize="sentences"
            maxLength={80}
            onChangeText={setName}
            onSubmitEditing={handleContinueToExercises}
            placeholder="Ej. Tren superior"
            placeholderTextColor="#777777"
            returnKeyType="next"
            style={styles.input}
            value={name}
          />
          <Pressable
            accessibilityRole="button"
            onPress={handleContinueToExercises}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={resetCreation}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {editingRoutineId ? 'Cancelar edición' : 'Descartar rutina'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{name.trim()}</Text>
          <Text style={styles.description}>
            {editingRoutineId
              ? 'Edita los ejercicios y las series de esta rutina.'
              : 'Agrega ejercicios y la cantidad de series para cada uno. También puedes guardar la rutina solo con su nombre.'}
          </Text>

          {exercises.map((exercise, index) => (
            <View key={`${exercise.name}-${index}`} style={styles.exerciseItem}>
              {editingExerciseIndex === index ? (
                <>
                  <TextInput
                    accessibilityLabel={`Editar nombre de ${exercise.name}`}
                    autoCapitalize="sentences"
                    maxLength={80}
                    onChangeText={setEditedExerciseName}
                    placeholder="Nombre del ejercicio"
                    placeholderTextColor="#777777"
                    style={styles.input}
                    value={editedExerciseName}
                  />
                  <View style={styles.setsRow}>
                    <Text style={styles.setsLabel}>Series</Text>
                    <TextInput
                      accessibilityLabel={`Editar series de ${exercise.name}`}
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={setEditedExerciseSets}
                      selectTextOnFocus
                      style={styles.setsInput}
                      value={editedExerciseSets}
                    />
                  </View>
                  <Text style={styles.loadTypeLabel}>Tipo de carga (opcional)</Text>
                  <View style={styles.loadTypeOptions}>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: editedExerciseUsesBodyweight }}
                      onPress={() =>
                        setEditedExerciseUsesBodyweight((selected) => !selected)
                      }
                      style={[
                        styles.loadTypeOption,
                        editedExerciseUsesBodyweight && styles.loadTypeOptionSelected
                      ]}
                    >
                      <Text
                        style={[
                          styles.loadTypeOptionText,
                          editedExerciseUsesBodyweight && styles.loadTypeOptionTextSelected
                        ]}
                      >
                        PC
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: editedExerciseUsesWeights }}
                      onPress={() => setEditedExerciseUsesWeights((selected) => !selected)}
                      style={[
                        styles.loadTypeOption,
                        editedExerciseUsesWeights && styles.loadTypeOptionSelected
                      ]}
                    >
                      <Text
                        style={[
                          styles.loadTypeOptionText,
                          editedExerciseUsesWeights && styles.loadTypeOptionTextSelected
                        ]}
                      >
                        Kg
                      </Text>
                    </Pressable>
                  </View>
                  {editedExerciseUsesWeights ? (
                    <View style={styles.weightRow}>
                      <Text style={styles.setsLabel}>
                        {editedExerciseUsesBodyweight ? 'Kg añadidos' : 'Peso'}
                      </Text>
                      <TextInput
                        accessibilityLabel="Cantidad de carga en kilogramos"
                        keyboardType="decimal-pad"
                        maxLength={7}
                        onChangeText={setEditedExerciseWeightKg}
                        placeholder="Ej. 7,5"
                        placeholderTextColor="#777777"
                        selectTextOnFocus
                        style={styles.setsInput}
                        value={editedExerciseWeightKg}
                      />
                      <Text style={styles.kgSuffix}>kg</Text>
                    </View>
                  ) : null}
                  <View style={styles.exerciseActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleSaveExerciseEdit(index)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Guardar cambios</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleCancelExerciseEdit}
                      style={styles.removeButton}
                    >
                      <Text style={styles.secondaryButtonText}>Cancelar</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseSets}>
                      {exercise.sets} {exercise.sets === 1 ? 'serie' : 'series'} ·{' '}
                      {getLoadTypeLabel(exercise.loadType, exercise.weightKg)}
                    </Text>
                  </View>
                  <View style={styles.exerciseActions}>
                    <Pressable
                      accessibilityLabel={`Editar ${exercise.name}`}
                      accessibilityRole="button"
                      onPress={() => handleEditExercise(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Quitar ${exercise.name}`}
                      accessibilityRole="button"
                      onPress={() => {
                        setExercises((currentExercises) =>
                          currentExercises.filter(
                            (_, exerciseIndex) => exerciseIndex !== index
                          )
                        );
                        if (editingExerciseIndex === index) {
                          handleCancelExerciseEdit();
                        } else if (
                          editingExerciseIndex !== null &&
                          editingExerciseIndex > index
                        ) {
                          setEditingExerciseIndex(editingExerciseIndex - 1);
                        }
                        setErrorMessage('');
                      }}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Quitar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ))}

          {exercises.length < 20 && editingExerciseIndex === null ? (
            <>
              <TextInput
                accessibilityLabel="Nombre del ejercicio"
                autoCapitalize="sentences"
                maxLength={80}
                onChangeText={setExerciseName}
                onSubmitEditing={handleAddExercise}
                placeholder="Ej. Sentadillas"
                placeholderTextColor="#777777"
                returnKeyType="done"
                style={styles.input}
                value={exerciseName}
              />
              <View style={styles.setsRow}>
                <Text style={styles.setsLabel}>Series</Text>
                <TextInput
                  accessibilityLabel="Cantidad de series"
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={setExerciseSets}
                  placeholder="3"
                  placeholderTextColor="#777777"
                  selectTextOnFocus
                  style={styles.setsInput}
                  value={exerciseSets}
                />
              </View>
              <Text style={styles.loadTypeLabel}>Tipo de carga (opcional)</Text>
              <View style={styles.loadTypeOptions}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: exerciseUsesBodyweight }}
                  onPress={() => setExerciseUsesBodyweight((selected) => !selected)}
                  style={[
                    styles.loadTypeOption,
                    exerciseUsesBodyweight && styles.loadTypeOptionSelected
                  ]}
                >
                  <Text
                    style={[
                      styles.loadTypeOptionText,
                      exerciseUsesBodyweight && styles.loadTypeOptionTextSelected
                    ]}
                  >
                    PC
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: exerciseUsesWeights }}
                  onPress={() => setExerciseUsesWeights((selected) => !selected)}
                  style={[
                    styles.loadTypeOption,
                    exerciseUsesWeights && styles.loadTypeOptionSelected
                  ]}
                >
                  <Text
                    style={[
                      styles.loadTypeOptionText,
                      exerciseUsesWeights && styles.loadTypeOptionTextSelected
                    ]}
                  >
                    Kg
                  </Text>
                </Pressable>
              </View>
              {exerciseUsesWeights ? (
                <View style={styles.weightRow}>
                  <Text style={styles.setsLabel}>
                    {exerciseUsesBodyweight ? 'Kg añadidos' : 'Peso'}
                  </Text>
                  <TextInput
                    accessibilityLabel="Cantidad de carga en kilogramos"
                    keyboardType="decimal-pad"
                    maxLength={7}
                    onChangeText={setExerciseWeightKg}
                    placeholder="Ej. 7,5"
                    placeholderTextColor="#777777"
                    selectTextOnFocus
                    style={styles.setsInput}
                    value={exerciseWeightKg}
                  />
                  <Text style={styles.kgSuffix}>kg</Text>
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={handleAddExercise}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>Agregar ejercicio</Text>
              </Pressable>
            </>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSaving || editingExerciseIndex !== null}
            onPress={handleSaveRoutine}
            style={[
              styles.button,
              (isSaving || editingExerciseIndex !== null) && styles.disabledButton
            ]}
          >
            <Text style={styles.buttonText}>
              {isSaving
                ? 'Guardando...'
                : editingRoutineId
                  ? 'Guardar cambios'
                  : 'Guardar rutina'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => {
              setErrorMessage('');
              setCreationStep('name');
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Volver al nombre</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={resetCreation}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {editingRoutineId ? 'Cancelar edición' : 'Descartar rutina'}
            </Text>
          </Pressable>
        </View>
      )}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Text style={styles.sectionTitle}>Tus entrenamientos</Text>

      {isLoading ? (
        <ActivityIndicator color="#FF5A36" style={styles.loader} />
      ) : routines.length ? (
        routines.map((routine) => {
          const exerciseCount = routine.exercises?.length ?? 0;
          return (
            <View key={routine._id} style={styles.routineCard}>
              <Text style={styles.cardTitle}>{routine.name}</Text>
              <Text style={styles.description}>
                {exerciseCount
                  ? `${exerciseCount} ${
                      exerciseCount === 1 ? 'ejercicio' : 'ejercicios'
                    }`
                  : 'Sin ejercicios'}
              </Text>
              <View style={styles.routineActions}>
                <Pressable
                  accessibilityLabel={`Editar rutina ${routine.name}`}
                  accessibilityRole="button"
                  disabled={
                    deletingRoutineId !== null ||
                    isSaving ||
                    creationStep !== null
                  }
                  onPress={() => handleEditRoutine(routine)}
                  style={[
                    styles.routineActionButton,
                    (deletingRoutineId !== null ||
                      isSaving ||
                      creationStep !== null) &&
                      styles.disabledButton
                  ]}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Eliminar rutina ${routine.name}`}
                  accessibilityRole="button"
                  disabled={
                    deletingRoutineId !== null ||
                    isSaving ||
                    creationStep !== null
                  }
                  onPress={() => confirmDeleteRoutine(routine)}
                  style={[
                    styles.routineActionButton,
                    (deletingRoutineId !== null ||
                      isSaving ||
                      creationStep !== null) &&
                      styles.disabledButton
                  ]}
                >
                  <Text style={styles.removeButtonText}>
                    {deletingRoutineId === routine._id ? 'Eliminando...' : 'Eliminar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
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
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 44
  },
  secondaryButtonText: {
    color: '#C4C4C4',
    fontSize: 15,
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.6
  },
  outlineButton: {
    alignItems: 'center',
    borderColor: '#FF5A36',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 46
  },
  outlineButtonText: {
    color: '#FF5A36',
    fontSize: 15,
    fontWeight: '700'
  },
  setsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14
  },
  weightRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14
  },
  setsLabel: {
    color: '#F4F4F4',
    fontSize: 15,
    fontWeight: '600'
  },
  kgSuffix: {
    color: '#A0A0A0',
    fontSize: 15,
    marginLeft: 8
  },
  setsInput: {
    backgroundColor: '#222222',
    borderColor: '#3A3A3A',
    borderRadius: 10,
    borderWidth: 1,
    color: '#F4F4F4',
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 14,
    textAlign: 'center',
    width: 88
  },
  loadTypeLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 16
  },
  loadTypeOptions: {
    flexDirection: 'row',
    marginTop: 8
  },
  loadTypeOption: {
    alignItems: 'center',
    borderColor: '#555555',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 10,
    minHeight: 40,
    minWidth: 72,
    paddingHorizontal: 14
  },
  loadTypeOptionSelected: {
    backgroundColor: '#FF5A36',
    borderColor: '#FF5A36'
  },
  loadTypeOptionText: {
    color: '#D0D0D0',
    fontSize: 14,
    fontWeight: '600'
  },
  loadTypeOptionTextSelected: {
    color: '#171717'
  },
  exerciseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseItem: {
    borderBottomColor: '#303030',
    borderBottomWidth: 1,
    paddingVertical: 14
  },
  exerciseDetails: {
    flex: 1
  },
  exerciseActions: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  exerciseName: {
    color: '#F4F4F4',
    fontSize: 16,
    fontWeight: '600'
  },
  exerciseSets: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 4
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  removeButtonText: {
    color: '#FF8A76',
    fontSize: 14,
    fontWeight: '600'
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  editButtonText: {
    color: '#FF5A36',
    fontSize: 14,
    fontWeight: '600'
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
  routineActions: {
    flexDirection: 'row',
    marginTop: 10
  },
  routineActionButton: {
    marginRight: 20,
    minHeight: 40,
    justifyContent: 'center'
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
