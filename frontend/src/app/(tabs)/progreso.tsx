import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function ProgressScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Text style={styles.title}>Tu progreso</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cada repetición cuenta</Text>
        <Text style={styles.description}>
          Tu progreso aparecerá aquí cuando registres tus entrenamientos.
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
