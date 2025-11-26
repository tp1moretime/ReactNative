import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { useUser } from './UserContext';
import Header from './Header';

type AdminDashboardNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'AdminDashboard'>;

const AdminDashboard = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { currentUser } = useUser();

  // Chỉ admin mới được truy cập
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>🛡️ Trang Chủ Quản Trị</Text>
          <Text style={styles.subtitle}>Chào mừng, {currentUser.username}!</Text>
        </View>

        <View style={styles.menuContainer}>
          {/* Quản lý User */}
          <TouchableOpacity
            style={[styles.menuCard, styles.userCard]}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👥</Text>
            </View>
            <Text style={styles.menuTitle}>Quản lý User</Text>
            <Text style={styles.menuDescription}>
              Thêm, sửa, xóa người dùng trong hệ thống
            </Text>
          </TouchableOpacity>

          {/* Quản lý Loại Sản Phẩm */}
          <TouchableOpacity
            style={[styles.menuCard, styles.categoryCard]}
            onPress={() => navigation.navigate('CategoryManagement')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📁</Text>
            </View>
            <Text style={styles.menuTitle}>Quản lý Loại Sản Phẩm</Text>
            <Text style={styles.menuDescription}>
              Quản lý các danh mục sản phẩm
            </Text>
          </TouchableOpacity>

          {/* Quản lý Sản Phẩm */}
          <TouchableOpacity
            style={[styles.menuCard, styles.productCard]}
            onPress={() => navigation.navigate('ProductManagement')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🛍️</Text>
            </View>
            <Text style={styles.menuTitle}>Quản lý Sản Phẩm</Text>
            <Text style={styles.menuDescription}>
              Thêm, sửa, xóa sản phẩm trong cửa hàng
            </Text>
          </TouchableOpacity>

          {/* Quản lý Đơn hàng */}
          <TouchableOpacity
            style={[styles.menuCard, styles.orderCard]}
            onPress={() => navigation.navigate('OrderManagement')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📦</Text>
            </View>
            <Text style={styles.menuTitle}>Quản lý Đơn hàng</Text>
            <Text style={styles.menuDescription}>
              Theo dõi và cập nhật trạng thái các đơn hàng
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  menuContainer: {
    gap: 20,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  userCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  categoryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  productCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  orderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
});

export default AdminDashboard;


