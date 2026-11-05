import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function RoutinesScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Text style={styles.eyebrow}>ONEMOREREP</Text>
      <Text style={styles.title}>Tus rutinas</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aún no tienes rutinas</Text>
        <Text style={styles.description}>
          Cuando crees una rutina de entrenamiento, aparecerá aquí.
        </Text>
      </View>
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
    marginTop: 28,
    padding: 20
  },
  cardTitle: {
    color: '#F4F4F4',
    fontSize: 18,
    fontWeight: '700'
  },
  description: {
    color: '#A0A0A0',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  }
});
