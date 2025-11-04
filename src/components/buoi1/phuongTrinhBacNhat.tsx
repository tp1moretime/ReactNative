import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import React, { useState } from 'react';

const PhuongTrinhBacNhac = () => {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [x, setX] = useState<string | null>(null);

  const handleSolve = () => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (isNaN(aNum) || isNaN(bNum)) {
      alert('Vui lòng nhập số hợp lệ cho a và b');
      return;
    }
    if (aNum === 0) {
      if (bNum === 0) {
        alert('Phương trình có vô số nghiệm');
        setX(null);
      } else {
        alert('Phương trình vô nghiệm');
        setX(null);
      }
    } else {
      const result = (-bNum / aNum).toFixed(2);
      setX(`X = ${result}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giải phương trình bậc nhất: ax + b = 0</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập a"
        value={a}
        onChangeText={setA}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập b"
        value={b}
        onChangeText={setB}
        keyboardType="numeric"
      />
      <Button title="Giải" onPress={handleSolve} />
      {x && <Text style={styles.result}>{x}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#007AFF",
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  result: {
    marginTop: 24,
    fontSize: 20,
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PhuongTrinhBacNhac;