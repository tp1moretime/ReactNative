import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const Child = ({ info, setInfo }) => {
  return (
    <View style={styles.childContainer}>
      <Text style={styles.title}> Component Con</Text>
      <Text style={styles.text}>Tên: {info.name}</Text>
      <Text style={styles.text}>Tuổi: {info.age}</Text>
      <Text style={styles.text}>Số điện thoại: {info.phone}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setInfo({ name: '', age: '', phone: '' })}
      >
        <Text style={styles.buttonText}>Xóa thông tin</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Child;

const styles = StyleSheet.create({
  childContainer: {
    marginTop: 30,
    backgroundColor: '#E8F0FE',
    padding: 16,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
