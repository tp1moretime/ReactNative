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
import {
  initDatabase,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  fetchProductsByCategory,
  Category,
  Product,
} from '../../database/database';
import { useUser } from './UserContext';
import Header from './Header';

type CategoryManagementNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CategoryManagement'>;

const CategoryManagementScreen = () => {
  const navigation = useNavigation<CategoryManagementNavigationProp>();
  const { currentUser } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: number]: Product[] }>({});

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    await initDatabase();
    const cats = await fetchCategories();
    setCategories(cats);
    
    // Load số lượng sản phẩm cho mỗi category
    const productsMap: { [key: number]: Product[] } = {};
    for (const cat of cats) {
      const products = await fetchProductsByCategory(cat.id);
      productsMap[cat.id] = products;
    }
    setProductsByCategory(productsMap);
  };

  const handleAddOrUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      if (editingId !== null) {
        const success = await updateCategory({ id: editingId, name: name.trim() });
        if (success) {
          Alert.alert('Thành công', 'Cập nhật danh mục thành công!');
          setEditingId(null);
        } else {
          Alert.alert('Lỗi', 'Không thể cập nhật danh mục!');
        }
      } else {
        const success = await addCategory(name.trim());
        if (success) {
          Alert.alert('Thành công', 'Thêm danh mục thành công!');
        } else {
          Alert.alert('Lỗi', 'Không thể thêm danh mục!');
        }
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi!');
    }
  };

  const handleEdit = (category: Category) => {
    setName(category.name);
    setEditingId(category.id);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa danh mục này? Sản phẩm thuộc danh mục này sẽ không thể xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCategory(id);
            if (success) {
              Alert.alert('Thành công', 'Đã xóa danh mục!');
              loadData();
            } else {
              Alert.alert('Lỗi', 'Không thể xóa danh mục! Có thể đang có sản phẩm sử dụng danh mục này.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName('');
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
          <Text style={styles.headerTitle}>📁 Quản lý Loại Sản Phẩm</Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingId ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Tên danh mục"
            value={name}
            onChangeText={setName}
          />

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

        {/* DANH SÁCH CATEGORY */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Danh sách danh mục ({categories.length})</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const productCount = productsByCategory[item.id]?.length || 0;
              return (
                <View style={styles.categoryCard}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <View style={styles.categoryDetails}>
                      <Text style={styles.categoryId}>ID: {item.id}</Text>
                      <Text style={styles.productCount}>
                        {productCount} sản phẩm
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.addProductButton}
                      onPress={() => {
                        // Điều hướng đến ProductManagement với categoryId đã chọn
                        navigation.navigate('ProductManagement', { 
                          initialCategoryId: item.id 
                        } as any);
                      }}
                    >
                      <Text style={styles.addProductButtonText}>➕ Sản phẩm</Text>
                    </TouchableOpacity>
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
              );
            }}
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
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
  categoryCard: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  categoryDetails: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  categoryId: {
    fontSize: 12,
    color: '#64748B',
  },
  productCount: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addProductButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#10B981',
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

export default CategoryManagementScreen;

