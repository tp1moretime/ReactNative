import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import Child from './conn';

const Parent = () => {
  const [info, setInfo] = useState({
    name: '',
    age: '',
    phone: '',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}> Nhập thông tin cá nhân</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#aaa"
          value={info.name}
          onChangeText={text => setInfo({ ...info, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Tuổi"
          placeholderTextColor="#aaa"
          value={info.age}
          onChangeText={text => setInfo({ ...info, age: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          placeholderTextColor="#aaa"
          value={info.phone}
          onChangeText={text => setInfo({ ...info, phone: text })}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Lưu thông tin</Text>
        </TouchableOpacity>

        <Text style={styles.result}>
           Parent nhận: <Text style={{ color: '#007AFF' }}>{info.name}</Text> - {info.age} - {info.phone}
        </Text>
      </View>

      {/* Gọi component con */}
      <Child info={info} setInfo={setInfo} />
    </KeyboardAvoidingView>
  );
};  

export default Parent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  result: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#444',
  },
});
