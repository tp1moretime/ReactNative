import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { Picker } from '@react-native-picker/picker';
import {
  initDatabase,
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  User,
} from '../../database/database';
import { useUser } from './UserContext';
import Header from './Header';

type UserManagementNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'UserManagement'>;

const UserManagementScreen = () => {
  const navigation = useNavigation<UserManagementNavigationProp>();
  const { currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    const userList = await fetchUsers();
    setUsers(userList);
  };

  const handleAddOrUpdate = async () => {
    if (!username) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập!');
      return;
    }

    // Khi thêm mới, cần password
    if (editingId === null && !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu!');
      return;
    }

    // Khi thêm mới, password phải >= 6 ký tự
    if (editingId === null && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Khi cập nhật, nếu có password mới thì phải >= 6 ký tự
    if (editingId !== null && password && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      if (editingId !== null) {
        // Lấy user hiện tại để giữ password cũ nếu không nhập password mới
        const currentUser = users.find(u => u.id === editingId);
        const passwordToUpdate = password.trim() !== '' ? password : (currentUser?.password || '');
        
        const success = await updateUser({ 
          id: editingId, 
          username, 
          password: passwordToUpdate, 
          role 
        });
        if (success) {
          Alert.alert('Thành công', 'Cập nhật người dùng thành công!');
          setEditingId(null);
        } else {
          Alert.alert('Lỗi', 'Không thể cập nhật người dùng!');
        }
      } else {
        const success = await addUser(username, password, role);
        if (success) {
          Alert.alert('Thành công', 'Thêm người dùng thành công!');
        } else {
          Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại!');
        }
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi!');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: 'admin' | 'user') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn đổi vai trò của "${user.username}" thành "${newRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const success = await updateUser({
              id: userId,
              username: user.username,
              password: user.password,
              role: newRole,
            });
            if (success) {
              Alert.alert('Thành công', 'Đã cập nhật vai trò thành công!');
              loadData();
            } else {
              Alert.alert('Lỗi', 'Không thể cập nhật vai trò!');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (user: User) => {
    setUsername(user.username);
    setPassword(user.password);
    setRole(user.role as 'admin' | 'user');
    setEditingId(user.id);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa người dùng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(id);
            if (success) {
              Alert.alert('Thành công', 'Đã xóa người dùng!');
              loadData();
            } else {
              Alert.alert('Lỗi', 'Không thể xóa người dùng!');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('user');
    setEditingId(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Bạn không có quyền truy cập trang này!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👥 Quản lý User</Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingId ? '✏️ Sửa người dùng' : '➕ Thêm người dùng mới'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            editable={editingId === null}
          />

          <TextInput
            style={styles.input}
            placeholder={editingId ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Vai trò:</Text>
            <Picker selectedValue={role} onValueChange={(value) => setRole(value)} style={styles.picker}>
              <Picker.Item label="Người dùng" value="user" />
              <Picker.Item label="Quản trị viên" value="admin" />
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddOrUpdate}>
              <Text style={styles.saveButtonText}>
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* DANH SÁCH USER */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Danh sách người dùng ({users.length})</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.username}</Text>
                  <View style={styles.roleSection}>
                    <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#F43F5E' : '#10B981' }]}>
                      <Text style={styles.roleText}>
                        {item.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.changeRoleButton}
                      onPress={() => handleUpdateRole(item.id, item.role === 'admin' ? 'user' : 'admin')}
                    >
                      <Text style={styles.changeRoleText}>
                        {item.role === 'admin' ? '→ User' : '→ Admin'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
  listContainer: {
    margin: 15,
    marginTop: 0,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  roleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  changeRoleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  changeRoleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
});

export default UserManagementScreen;

