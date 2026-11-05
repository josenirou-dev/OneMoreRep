import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

type LogoProps = {
  height?: number;
  style?: StyleProp<ImageStyle>;
  width?: number;
};

export default function Logo({ width = 250, height = 80, style }: LogoProps) {
  return (
    <Image
      accessibilityLabel="One More Rep"
      contentFit="cover"
      source={require('../../assets/images/onemore-rep-logo.png')}
      style={[{ width, height }, style]}
    />
  );
}
