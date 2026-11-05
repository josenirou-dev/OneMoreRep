import { Stack } from "expo-router";
import { BarlowCondensed_600SemiBold_Italic } from '@expo-google-fonts/barlow-condensed';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ BarlowCondensed_600SemiBold_Italic });

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
