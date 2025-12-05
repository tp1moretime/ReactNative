import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../AuthContext';
import Header from '../Header';
import { HomeStackParamList } from '../types';

const AdminDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'category',
      title: 'Quản lý Danh mục',
      icon: 'folder-open-outline',
      screen: 'CategoryManagement' as keyof HomeStackParamList,
      description: 'Thêm, sửa, xóa danh mục sản phẩm'
    },
    {
      id: 'product',
      title: 'Quản lý Sản phẩm',
      icon: 'cube-outline',
      screen: 'ProductManagement' as keyof HomeStackParamList,
      description: 'Quản lý sản phẩm theo danh mục',
      params: { categoryId: 0 }
    },
    {
      id: 'user',
      title: 'Quản lý Người dùng',
      icon: 'people-outline',
      screen: 'UserManagement' as keyof HomeStackParamList,
      description: 'Xem, thêm, sửa, xóa người dùng'
    },
    {
      id: 'orders',
      title: 'Quản lý Đơn hàng',
      icon: 'receipt-outline',
      screen: 'OrderManagement' as keyof HomeStackParamList,
      description: 'Xem danh sách và cập nhật trạng thái đơn hàng'
    }
  ];

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.params) {
      navigation.navigate(item.screen as any, item.params as any);
    } else {
      navigation.navigate(item.screen as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Trang Quản Trị</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Xin chào, {user?.username}!</Text>
          <Text style={styles.welcomeSubtext}>Quản trị viên</Text>
        </View>

        {/* Menu Items (Vertical List Layout) */}
        <View style={styles.menuList}>
          <Text style={styles.sectionTitle}>Các Chức Năng Chính</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuListItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={28} color="#121212" />
                </View>
                <View style={styles.menuTextContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#BB86FC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212' // Nền Tối
  },
  pageHeader: {
    backgroundColor: '#BB86FC', // Màu Nhấn Tím
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 0,
  },
  pageHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#121212', // Chữ tối trên nền sáng
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  
  // --- Welcome Section ---
  welcomeSection: {
    backgroundColor: '#1E1E1E', 
    padding: 20,
    borderRadius: 16, 
    marginBottom: 30, // Tăng khoảng cách
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333'
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', 
    marginBottom: 5
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#B3B3B3' 
  },
  
  // --- Menu List (New Layout) ---
  menuList: {
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03DAC6', // Màu Teal cho tiêu đề phần
    marginBottom: 15,
  },
  menuListItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333333',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 55, // Icon lớn hơn
    height: 55,
    borderRadius: 12, 
    backgroundColor: '#BB86FC', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', 
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#B3B3B3', 
    lineHeight: 16
  },
  
  // --- Info Section ---
  infoSection: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333'
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333' 
  },
  infoLabel: {
    fontSize: 14,
    color: '#B3B3B3'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default AdminDashboard;