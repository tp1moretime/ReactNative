import React, { useState, useRef } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const BMICalculator = () => {
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [bMI, setBMI] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const inputA = useRef<TextInput>(null);
  const inputB = useRef<TextInput>(null);

  const Calculator = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;

    if (isNaN(w) || w <= 0) {
      setStatus("⚠️ Vui lòng nhập lại cân nặng hợp lệ!");
      inputA.current?.focus();
      setWeight("");
      return;
    }

    if (isNaN(h) || h <= 0) {
      setStatus("⚠️ Vui lòng nhập lại chiều cao hợp lệ!");
      inputB.current?.focus();
      setHeight("");
      return;
    }

    const bmiValue = parseFloat((w / (h * h)).toFixed(2));
    setBMI(bmiValue);

    if (bmiValue < 18.5) setStatus("Gầy (Thiếu cân)");
    else if (bmiValue >= 18.5 && bmiValue <= 24.9) setStatus("Bình thường");
    else if (bmiValue >= 25 && bmiValue <= 29.9) setStatus("Thừa cân");
    else if (bMI >= 30 && bmiValue <= 34.9) setStatus("Béo phì độ I");
    else if (bmiValue >= 35 && bmiValue <= 39.9) setStatus("Béo phì độ II");
    else setStatus("Nguy hiểm (Béo phì độ III)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💪 BMI Calculator</Text>

      <TextInput
        ref={inputA}
        placeholder="Nhập cân nặng (kg)"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        style={styles.input}
      />

      <TextInput
        ref={inputB}
        placeholder="Nhập chiều cao (cm)"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Tính BMI" onPress={Calculator} color="#3fa34d" />
      </View>

      {bMI && (
        <View
          style={[
            styles.resultBox,
            bMI < 18.5
              ? styles.underweight
              : bMI < 25
              ? styles.normal
              : bMI < 30
              ? styles.overweight
              : styles.obese,
          ]}
        >
          <Text style={styles.resultText}>BMI: {bMI}</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e", // Nền VS Code
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ffffff",
    
  },
  input: {
    width: "90%",
    height: 50,
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 16,
    color: "#fff",
  },
  buttonContainer: {
    width: "90%",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  resultBox: {
    marginTop: 25,
    padding: 20,
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  resultText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  statusText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 5,
  },
  underweight: { backgroundColor: "#0288D1" },
  normal: { backgroundColor: "#43A047" },
  overweight: { backgroundColor: "#FFA000" },
  obese: { backgroundColor: "#E53935" },
});

export default BMICalculator;

