import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './UserContext';

const Header = () => {
  const navigation = useNavigation<any>();
  const { currentUser, logout } = useUser();

  // Debug: Log để kiểm tra
  console.log('Header - currentUser:', currentUser);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Thành công', 'Đã đăng xuất thành công!');
            // Điều hướng đến tab Login
            navigation.getParent()?.navigate('Login') ?? navigation.navigate('Login');
          },
        },
      ]
    );
  };

  // Hiển thị header cho cả trường hợp đã đăng nhập và chưa đăng nhập
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: '#94A3B8' }]}>
            <Text style={styles.avatarText}>?</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>Chưa đăng nhập</Text>
            <Text style={styles.notLoggedInText}>Vui lòng đăng nhập để tiếp tục</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#3B82F6' }]} 
          onPress={() => navigation.getParent()?.navigate('Login') ?? navigation.navigate('Login')}
        >
          <Text style={styles.logoutText}>🔐 Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roleText = currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng';
  const roleColor = currentUser.role === 'admin' ? '#F43F5E' : '#10B981';

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {currentUser.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{currentUser.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
            <Text style={styles.roleText}>{roleText}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  notLoggedInText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default Header;

