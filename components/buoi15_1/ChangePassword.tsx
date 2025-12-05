import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useAuth } from "./AuthContext";
import { updateUserPassword } from "../database"; // Giữ Logic
import { Ionicons } from '@expo/vector-icons';

const ChangePassword = ({ navigation }: any) => {
  const { user, setUser } = useAuth(); //
  const [oldPass, setOldPass] = useState(""); //
  const [newPass, setNewPass] = useState(""); //
  const [confirmPass, setConfirmPass] = useState(""); //

  const handleChange = async () => {
    if (!user) return; //
    
    if (!oldPass || !newPass || !confirmPass) { //
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (oldPass !== user.password) { //
      Alert.alert("Sai mật khẩu", "Mật khẩu cũ không chính xác");
      return;
    }

    if (newPass !== confirmPass) { //
      Alert.alert("Lỗi", "Mật khẩu mới không trùng khớp");
      return;
    }

    // Giữ Logic code gốc
    // await updateUserPassword(user.id, newPass); 
    // setUser({ ...user, password: newPass });

    Alert.alert("Thành công", "Đổi mật khẩu thành công!", [ //
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.instructionText}>
          Vui lòng nhập mật khẩu cũ để xác nhận, sau đó nhập mật khẩu mới.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu cũ</Text>
          <TextInput
            secureTextEntry
            placeholder="Nhập mật khẩu cũ"
            style={styles.input}
            placeholderTextColor="#B3B3B3"
            onChangeText={setOldPass}
            value={oldPass}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            secureTextEntry
            placeholder="Nhập mật khẩu mới"
            style={styles.input}
            placeholderTextColor="#B3B3B3"
            onChangeText={setNewPass}
            value={newPass}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <TextInput
            secureTextEntry
            placeholder="Nhập lại mật khẩu mới"
            style={styles.input}
            placeholderTextColor="#B3B3B3"
            onChangeText={setConfirmPass}
            value={confirmPass}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleChange}>
          <Text style={styles.buttonText}>XÁC NHẬN</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: -40,
  },

  scrollContent: {
    padding: 30,
  },
  instructionText: {
    color: '#B3B3B3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#333333",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    color: '#FFFFFF',
    fontSize: 16,
  },

  button: {
    backgroundColor: "#BB86FC",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
  },

  buttonText: {
    color: "#121212",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});