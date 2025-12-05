import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { updateUser } from '../../database/database';
import Header from './Header';
import { useUser } from './UserContext';

const UserProfileScreen = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    if (!currentUser) return;

    if (!username.trim()) {
      Alert.alert('Lỗi', 'Tên đăng nhập không được để trống.');
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const success = await updateUser({
        id: currentUser.id,
        username: username.trim(),
        password: newPassword ? newPassword : currentUser.password,
        role: currentUser.role,
      });

      if (success) {
        const updated = {
          ...currentUser,
          username: username.trim(),
          password: newPassword ? newPassword : currentUser.password,
        };
        setCurrentUser(updated);
        Alert.alert('Thành công', 'Cập nhật thông tin người dùng thành công!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.centerText}>Vui lòng đăng nhập để cập nhật thông tin.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        <Text style={styles.title}>👤 Hồ sơ người dùng</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Để trống nếu không đổi"
          />

          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Để trống nếu không đổi"
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vai trò:</Text>
            <Text style={styles.infoValue}>
              {currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isSaving && styles.disabled]}
            onPress={handleUpdate}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>{isSaving ? 'Đang lưu...' : 'Cập nhật'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { color: '#475569', fontSize: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  infoLabel: { color: '#475569', fontSize: 14 },
  infoValue: { fontWeight: '700', color: '#0F172A', fontSize: 14 },
  button: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default UserProfileScreen;

