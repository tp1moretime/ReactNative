import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  addCategory,
  Category,
  deleteCategory,
  fetchCategories,
  updateCategory
} from '../../database';
import Header from '../Header';
import { HomeStackParamList } from '../types';

type CategoryManagementProps = NativeStackScreenProps<HomeStackParamList, 'CategoryManagement'>;

const CategoryManagement = ({ navigation }: CategoryManagementProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách category:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName.trim());
        Alert.alert('Thành công', 'Đã cập nhật danh mục thành công');
      } else {
        await addCategory(categoryName.trim());
        Alert.alert('Thành công', 'Đã thêm danh mục thành công');
      }
      setModalVisible(false);
      setCategoryName('');
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu danh mục');
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Xóa danh mục',
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?\nTất cả sản phẩm trong danh mục này cũng sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert('Thành công', 'Đã xóa danh mục thành công');
              loadCategories();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa danh mục');
            }
          }
        }
      ]
    );
  };

  const handleAddProduct = (categoryId: number) => {
    navigation.navigate('ProductManagement', { categoryId });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryId}>ID: {item.id}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addProductButton]}
          onPress={() => handleAddProduct(item.id)}
        >
          <Text style={styles.actionButtonText}>+ Sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Quản Lý Danh Mục</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
          </View>
        }
      />

      {/* Modal Add/Edit Category */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập tên danh mục"
              value={categoryName}
              onChangeText={setCategoryName}
              placeholderTextColor="#B3B3B3"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setCategoryName('');
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#1E1E1E', // Header nền tối hơn
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
    fontSize: 20, // Tăng kích thước
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center'
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#BB86FC', // Màu Nhấn Tím
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 24,
    color: '#121212', // Chữ tối trên nền tím
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 15
  },
  categoryCard: {
    backgroundColor: '#1E1E1E', // Card nền tối hơn
    borderRadius: 16, // Bo góc lớn hơn
    padding: 20, // Padding lớn hơn
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 12, // Icon box bo góc
    backgroundColor: '#BB86FC', // Màu Nhấn Tím
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  categoryIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#121212'
  },
  categoryDetails: {
    flex: 1
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Chữ trắng
    marginBottom: 5
  },
  categoryId: {
    fontSize: 14,
    color: '#B3B3B3' // Chữ xám nhạt
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 15,
    marginTop: 5,
  },
  actionButton: {
    paddingHorizontal: 15, // Padding lớn hơn
    paddingVertical: 10, // Padding lớn hơn
    borderRadius: 10,
    marginLeft: 8
  },
  addProductButton: {
    backgroundColor: '#03DAC6' // Màu Teal phụ
  },
  editButton: {
    backgroundColor: '#BB86FC' // Màu Nhấn Tím
  },
  deleteButton: {
    backgroundColor: 'transparent', // Nút xóa trong suốt
    borderWidth: 1,
    borderColor: '#CF6679' // Viền màu cảnh báo
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121212' // Chữ tối trên nền sáng (trừ nút xóa)
  },
  deleteButtonText: {
    color: '#CF6679' // Chữ màu cảnh báo
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1E1E1E', // Modal nền tối
    borderRadius: 16,
    padding: 25,
    width: '90%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#2C2C2C', // Input nền tối hơn
    color: '#FFFFFF'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#333333',
    borderWidth: 0,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B3B3B3'
  },
  saveButton: {
    backgroundColor: '#BB86FC'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212' // Chữ tối trên nền tím
  }
});

export default CategoryManagement;