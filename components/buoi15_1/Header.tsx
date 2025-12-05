import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { Feather } from '@expo/vector-icons'; // Thêm icon

const Header = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  if (!user) {
    return null; // Không hiển thị header nếu chưa đăng nhập
  }

  return (
    
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.userInfoWrapper}>
        <View style={styles.avatar}>
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 45, height: 45, borderRadius: 10 }} // Avatar vuông bo góc
            />
          ) : (
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={20} color="#CF6679" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1E1E", // Nền tối
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333333", // Viền tối
  },

  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 10, // Vuông bo góc
    backgroundColor: "#BB86FC", // Màu nhấn
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#121212", // Chữ tối trên nền tím
  },

  userDetails: {
    justifyContent: 'center',
  },

  welcomeText: {
    fontSize: 12,
    color: "#B3B3B3", // Chữ phụ xám
  },

  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF", // Chữ trắng
  },

  logoutButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#CF6679", // Viền đỏ cảnh báo
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CF6679",
  },
});

export default Header;