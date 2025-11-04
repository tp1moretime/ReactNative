import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  name: string; // nhận props tên
};

export default function HelloUser({ name }: Props) {
  const [age, setAge] = useState('');

  return (
    <View style={styles.container}>
      {/* Hiển thị Hello + tên */}
      <Text style={styles.text}>Hello {name}</Text>

      {/* Ô nhập tuổi */}
      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi của bạn"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      {/* Nút bấm */}
      <Button
        title="Say Hello"
        onPress={() => Alert.alert(`Hello ${name}, bạn ${age} tuổi!`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // căn giữa dọc
    alignItems: 'center', // căn giữa ngang
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    width: '80%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
});
