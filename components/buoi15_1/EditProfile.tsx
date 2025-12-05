import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "./AuthContext";
import { updateUserProfile } from "../database";
import { Ionicons, Feather } from '@expo/vector-icons';

const EditProfile = ({ navigation }: any) => {
  const { user, setUser } = useAuth();

  // HOOKS LUÔN Ở ĐÂY (KHÔNG ĐẶT TRONG IF)
  const [username, setUsername] = useState(user?.username ?? ""); 
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null); 

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      base64: true,
    });

    if (!res.canceled) {
      setAvatar(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Giữ Logic code gốc
    await updateUserProfile(user.id, username, avatar); 

    setUser({
      ...user,
      username,
      avatar,
    });

    Alert.alert("✓ Thành công", "Cập nhật thông tin thành công!");
    navigation.goBack();
  };

  // ----- RENDER UI -----
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Không tìm thấy user</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh Sửa Thông Tin</Text>
      </View>

      <View style={styles.formContainer}>
        
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.editIcon}>
            <Feather name="camera" size={18} color="#121212" />
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tài khoản</Text>
          <TextInput
            placeholder="Username"
            style={styles.input}
            placeholderTextColor="#B3B3B3"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>LƯU THAY ĐỔI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },

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

  formContainer: {
    padding: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
  },

  avatarContainer: {
    alignSelf: "center",
    marginBottom: 30,
    position: 'relative',
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#BB86FC',
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: '#BB86FC',
  },

  avatarText: {
    color: "#BB86FC",
    fontSize: 40,
    fontWeight: "700",
  },

  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#03DAC6',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#121212',
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