import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type AuthInputProps = Pick<TextInputProps, 'autoCapitalize' | 'keyboardType'> & {
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

export default function AuthInput({
  autoCapitalize = 'none',
  keyboardType = 'default',
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value
}: AuthInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.field}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#858585"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={isPassword && !passwordVisible}
        autoCorrect={false}
      />
      {isPassword ? (
        <Pressable
          accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => setPasswordVisible((visible) => !visible)}
          style={styles.visibilityButton}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"
              stroke="#929292"
              strokeWidth={1.5}
            />
            <Circle cx={12} cy={12} r={3} stroke="#929292" strokeWidth={1.5} />
            {passwordVisible ? <Path d="m4 4 16 16" stroke="#929292" strokeWidth={1.5} /> : null}
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderColor: '#B65C3F',
    borderRadius: 13,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 58,
    marginBottom: 15,
    paddingHorizontal: 15
  },
  input: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0
  },
  visibilityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  }
});
