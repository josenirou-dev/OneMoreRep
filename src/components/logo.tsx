import Svg, { G, Text as SvgText } from 'react-native-svg';

export default function Logo({ width = 250, height = 80 }) {
  return (
    <Svg height={height} width={width} viewBox="0 0 250 80">
      <G x="10" y="60">
        {/* El +1 en naranja */}
        <SvgText fill="#FF4500" fontSize="65" fontWeight="900" fontStyle="italic">
          +1
        </SvgText>
        {/* Textos en blanco puro */}
        <SvgText x="100" y="-28" fill="#FFFFFF" fontSize="26" fontWeight="bold" fontStyle="italic">
          ONE MORE
        </SvgText>
        <SvgText x="100" y="5" fill="#FFFFFF" fontSize="26" fontWeight="bold" fontStyle="italic">
          REP
        </SvgText>
      </G>
    </Svg>
  );
}