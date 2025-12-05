import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { deleteUser, fetchUsers, updateUserRole, User } from '../../database';
import Header from '../Header';
import { HomeStackParamList } from '../types';

type UserManagementProps = NativeStackScreenProps<HomeStackParamList, 'UserManagement'>;

const UserManagement = ({ navigation }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách user:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Cập nhật vai trò',
      `Bạn có muốn đổi vai trò của ${user.username} thành ${newRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await updateUserRole(user.id, newRole);
              Alert.alert('Thành công', 'Đã cập nhật vai trò thành công');
              loadUsers();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể cập nhật vai trò');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = (user: User) => {
    if (user.username === 'admin') {
      Alert.alert('Lỗi', 'Không thể xóa tài khoản admin');
      return;
    }

    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Thành công', 'Đã xóa người dùng thành công');
              loadUsers();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa người dùng');
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={[styles.role, item.role === 'admin' && styles.adminRole]}>
            {item.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.roleButton]}
          onPress={() => handleUpdateRole(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.role === 'admin' ? '→ User' : '→ Admin'}
          </Text>
        </TouchableOpacity>
        {item.username !== 'admin' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BB86FC" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Người Dùng</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có người dùng nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212' // Nền Tối
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E', // Header nền tối
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center'
  },
  listContainer: {
    padding: 15
  },
  userCard: {
    backgroundColor: '#1E1E1E', // Card nền tối
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#BB86FC', // Màu Nhấn Tím
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#121212' // Chữ tối
  },
  userDetails: {
    flex: 1
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5
  },
  role: {
    fontSize: 14,
    color: '#B3B3B3'
  },
  adminRole: {
    color: '#03DAC6', // Màu Teal cho Admin
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 15,
    marginTop: 5,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8
  },
  roleButton: {
    backgroundColor: '#BB86FC' // Màu Nhấn Tím
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CF6679' // Viền Đỏ Cảnh báo
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121212' // Chữ tối (trừ nút xóa)
  },
  deleteButtonText: {
    color: '#CF6679' // Chữ Đỏ Cảnh báo
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#B3B3B3'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#B3B3B3'
  }
});

export default UserManagement;