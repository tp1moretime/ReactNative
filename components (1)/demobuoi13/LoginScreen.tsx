import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './AppTabs';
import { initDatabase, getUserByCredentials } from '../../database/database';
import { useUser } from './UserContext';

type LoginScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setCurrentUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Validation
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      // Khởi tạo database nếu chưa có
      await initDatabase();

      // Trim whitespace
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      console.log('🔍 Attempting login with:', { username: trimmedUsername, passwordLength: trimmedPassword.length });

      // Kiểm tra thông tin đăng nhập
      const user = await getUserByCredentials(trimmedUsername, trimmedPassword);

      console.log('🔍 Login result:', user ? 'User found' : 'User not found');

      if (user) {
        // Lưu thông tin user vào context
        setCurrentUser(user);
        
        // Reset form
        setUsername('');
        setPassword('');
        
        // Hiển thị thông báo thành công
        const roleText = user.role === 'admin' ? 'Quản trị viên' : 'Người dùng';
        const destinationText = user.role === 'admin' ? 'trang chủ quản trị' : 'trang chủ';
        
        Alert.alert(
          '✅ Đăng nhập thành công!',
          `Xin chào ${user.username}!\nVai trò: ${roleText}\n\nĐang chuyển đến ${destinationText}...`,
          [
            {
              text: `Đến ${destinationText}`,
              onPress: () => {
                // Điều hướng theo role
                if (user.role === 'admin') {
                  // Admin đi đến tab AdminDashboard
                  navigation.navigate('AdminDashboard');
                } else {
                  // User đi đến trang chủ
                  navigation.navigate('HomeTab');
                }
              },
            },
          ]
        );
        
        // Tự động điều hướng sau 2 giây (nếu người dùng không bấm nút)
        setTimeout(() => {
          if (user.role === 'admin') {
            // Admin đi đến tab AdminDashboard
            navigation.navigate('AdminDashboard');
          } else {
            // User đi đến trang chủ
            navigation.navigate('HomeTab');
          }
        }, 2000);
      } else {
        // Debug: Kiểm tra xem username có tồn tại không
        const { fetchUsers } = await import('../../database/database');
        const allUsers = await fetchUsers();
        const userExists = allUsers.some(u => u.username === trimmedUsername);
        
        if (userExists) {
          Alert.alert(
            'Lỗi đăng nhập', 
            'Mật khẩu không đúng!\n\nVui lòng kiểm tra lại mật khẩu của bạn.',
            [
              {
                text: 'OK',
                onPress: () => setPassword('')
              }
            ]
          );
        } else {
          Alert.alert(
            'Lỗi đăng nhập', 
            'Tên đăng nhập không tồn tại!\n\nVui lòng kiểm tra lại hoặc đăng ký tài khoản mới.',
            [
              {
                text: 'Đăng ký',
                onPress: () => navigation.navigate('Signup')
              },
              {
                text: 'OK',
                style: 'cancel'
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>🔐 Đăng Nhập</Text>
        <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng Nhập</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Tài khoản mặc định:{'\n'}
            Username: admin{'\n'}
            Password: 123456
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 13,
    color: '#D97706',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default LoginScreen;

