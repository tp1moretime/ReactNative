import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Category,
  Product,
  addToCart,
  fetchCategories,
  fetchProducts,
  initDatabase,
  searchProductsByName,
} from '../../database/database';
import Header from './Header';
import { useUser } from './UserContext';


// CARD SẢN PHẨM — CHỈ XEM, KHÔNG CÓ EDIT/DELETE
const ProductCard = ({
  item,
  onPress,
  getImageSource,
  onAddToCart,
}: {
  item: Product;
  onPress: () => void;
  getImageSource: (img: string) => ImageSourcePropType;
  onAddToCart: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={getImageSource(item.img)} style={styles.image} />
    <View style={styles.infoContainer}>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
    </View>
    <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
      <Text style={styles.addButtonText}>+ Giỏ</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);


const HomeScreen = () => {
  const navigation: any = useNavigation();
  const { currentUser } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Lưu tất cả sản phẩm để lấy danh sách tên
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [selectedNameFilter, setSelectedNameFilter] = useState<string | null>(null); // Lọc theo tên sản phẩm
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initDatabase(() => loadData());
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setAllProducts(prods); // Lưu tất cả sản phẩm
    setProducts(prods.reverse());
  };

  const handleAddProductToCart = async (product: Product) => {
    if (!currentUser) {
      Alert.alert(
        'Thông báo',
        'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.getParent()?.navigate('Login'),
          },
        ]
      );
      return;
    }
    await addToCart(currentUser.id, product.id, 1);
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng!');
  };
  
  // Lấy danh sách tên sản phẩm duy nhất để hiển thị trong filter
  const getUniqueProductNames = () => {
    const uniqueNames = Array.from(new Set(allProducts.map(p => p.name)));
    return uniqueNames.sort(); // Sắp xếp theo thứ tự alphabet
  };

  const getImageSource = (img: string) => {
    if (img.startsWith('file://')) return { uri: img };
    switch (img) {
      case 'aothun.jpg': return require('../../assets/images/hinh1.jpg');
      case 'shoesDRM.jpg': return require('../../assets/images/hinh1.jpg');
      case 'balo.jpg': return require('../../assets/images/hinh1.jpg');
      case 'hat.jpg': return require('../../assets/images/hinh1.jpg');
      case 'tui.jpg': return require('../../assets/images/hinh1.jpg');
      default: return require('../../assets/images/hinh1.jpg');
    }
  };

  const applyAllFilters = async (keyword?: string, categoryId?: number | null, nameFilter?: string | null, min?: string, max?: string) => {
    // Sử dụng tham số nếu có, nếu không thì dùng state hiện tại
    const currentKeyword = keyword !== undefined ? keyword : searchKeyword;
    const currentCategory = categoryId !== undefined ? categoryId : selectedCategoryFilter;
    const currentNameFilter = nameFilter !== undefined ? nameFilter : selectedNameFilter;
    const currentMinPrice = min !== undefined ? min : minPrice;
    const currentMaxPrice = max !== undefined ? max : maxPrice;
    
    const hasKeyword = currentKeyword.trim() !== '';
    const hasCategoryFilter = currentCategory !== null;
    const hasNameFilter = currentNameFilter !== null && currentNameFilter !== '';
    // Kiểm tra có filter giá không (cho phép giá = 0)
    const minPriceNum = currentMinPrice.trim() !== '' ? parseFloat(currentMinPrice) : NaN;
    const maxPriceNum = currentMaxPrice.trim() !== '' ? parseFloat(currentMaxPrice) : NaN;
    const hasPriceFilter = (!isNaN(minPriceNum) && minPriceNum >= 0) || 
                          (!isNaN(maxPriceNum) && maxPriceNum >= 0);
    
    // Nếu không có filter nào, load tất cả
    if (!hasKeyword && !hasCategoryFilter && !hasNameFilter && !hasPriceFilter) {
      setIsSearching(false);
      loadData();
      return;
    }
    
    setIsSearching(true);
    
    try {
      let results: Product[] = [];
      
      // Bước 1: Lọc theo tên (nếu có)
      if (hasKeyword) {
        results = await searchProductsByName(currentKeyword.trim());
      } else {
        // Nếu không có keyword, bắt đầu với tất cả sản phẩm
        results = await fetchProducts();
      }
      
      // Bước 2: Lọc theo tên sản phẩm (nếu có - filter riêng biệt với search)
      if (hasNameFilter && currentNameFilter !== null) {
        results = results.filter(p => p.name === currentNameFilter);
      }
      
      // Bước 3: Lọc theo danh mục (nếu có)
      if (hasCategoryFilter && currentCategory !== null) {
        results = results.filter(p => p.categoryId === currentCategory);
      }
      
      // Bước 4: Lọc theo khoảng giá (nếu có)
      if (hasPriceFilter) {
        const minValue = currentMinPrice.trim() !== '' ? parseFloat(currentMinPrice) : NaN;
        const maxValue = currentMaxPrice.trim() !== '' ? parseFloat(currentMaxPrice) : NaN;
        
        // Lọc theo giá tối thiểu
        if (!isNaN(minValue) && minValue >= 0) {
          results = results.filter(p => p.price >= minValue);
        }
        // Lọc theo giá tối đa
        if (!isNaN(maxValue) && maxValue >= 0) {
          results = results.filter(p => p.price <= maxValue);
        }
        
        // Validate: min phải <= max nếu cả hai đều có
        if (!isNaN(minValue) && !isNaN(maxValue) && minValue > maxValue) {
          // Nếu min > max, không hiển thị kết quả nào
          results = [];
        }
      }
      
      setProducts(results.reverse());
    } catch (error) {
      console.error('Filter error:', error);
      setProducts([]);
    }
  };

  // Debounce cho search
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    
    // Clear timeout cũ nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Tạo timeout mới
    searchTimeoutRef.current = setTimeout(() => {
      applyAllFilters(keyword);
    }, 300);
  };

  const handleNameFilter = (productName: string | null) => {
    setSelectedNameFilter(productName);
    applyAllFilters(undefined, undefined, productName, undefined, undefined);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategoryFilter(categoryId);
    applyAllFilters(undefined, categoryId);
  };

  const handlePriceFilter = () => {
    // Sử dụng giá trị state hiện tại
    applyAllFilters(undefined, undefined, undefined, minPrice, maxPrice);
  };
  
  // Tự động filter khi giá thay đổi (với debounce)
  useEffect(() => {
    // Không filter ngay khi component mount
    if (minPrice === '' && maxPrice === '') {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      // Chỉ filter nếu có ít nhất một giá được nhập và hợp lệ
      const minPriceNum = minPrice.trim() !== '' ? parseFloat(minPrice) : NaN;
      const maxPriceNum = maxPrice.trim() !== '' ? parseFloat(maxPrice) : NaN;
      const hasMin = !isNaN(minPriceNum) && minPriceNum >= 0;
      const hasMax = !isNaN(maxPriceNum) && maxPriceNum >= 0;
      
      if (hasMin || hasMax) {
        applyAllFilters();
      } else if (minPrice.trim() === '' && maxPrice.trim() === '') {
        // Nếu cả hai đều rỗng, load lại tất cả
        applyAllFilters();
      }
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timeoutId);
  }, [minPrice, maxPrice]);

  const clearSearch = () => {
    setSearchKeyword('');
    setSelectedCategoryFilter(null);
    setSelectedNameFilter(null);
    setMinPrice('');
    setMaxPrice('');
    setIsSearching(false);
    loadData();
  };

  return (
    <View style={styles.container}>
      {/* HEADER - THÔNG TIN NGƯỜI DÙNG */}
      <Header />
      
      {/* BANNER */}
      <View style={styles.bannerContainer}>
        <Image 
          source={require('../../assets/images/react-logo.png')} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>🛍️ Doraemon Store</Text>
          <Text style={styles.bannerSubtitle}>Cửa hàng thời trang Doraemon</Text>
        </View>
      </View>

      {/* MENU ĐIỀU HƯỚNG */}
      <View style={styles.navMenu}>
        <TouchableOpacity 
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => {
            // Scroll to top nếu đang ở trang Home
            navigation.navigate("Home");
          }}
        >
          <Text style={styles.navItemText}>🏠 Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            if (categories.length > 0) {
              navigation.navigate("ProductsByCategory", { 
                categoryId: categories[0].id,
                categoryName: categories[0].name 
              });
            } else {
              Alert.alert('Thông báo', 'Đang tải danh mục sản phẩm...');
            }
          }}
        >
          <Text style={styles.navItemText}>📦 Danh mục sản phẩm</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.quickActionText}>🛒 Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.quickActionText}>📜 Lịch sử</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Text style={styles.quickActionText}>👤 Hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* TÌM KIẾM */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="🔍 Tìm kiếm theo tên hoặc danh mục..." 
            placeholderTextColor="#94A3B8"
            value={searchKeyword}
            onChangeText={handleSearch}
          />
          {(searchKeyword.trim() !== '' || selectedCategoryFilter !== null || selectedNameFilter !== null ||
            (minPrice.trim() !== '' && parseFloat(minPrice) > 0) || 
            (maxPrice.trim() !== '' && parseFloat(maxPrice) > 0)) && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* FILTER THEO KHOẢNG GIÁ */}
        <View style={styles.priceFilterContainer}>
          <Text style={styles.filterLabel}>Lọc theo khoảng giá:</Text>
          <View style={styles.priceFilterRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Từ (đ):</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={(text) => {
                  setMinPrice(text);
                }}
                onBlur={handlePriceFilter}
              />
            </View>
            <Text style={styles.priceSeparator}>-</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Đến (đ):</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Không giới hạn"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={(text) => {
                  // Chỉ cho phép số và dấu chấm
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setMaxPrice(cleaned);
                }}
                onBlur={handlePriceFilter}
              />
            </View>
            {(minPrice.trim() !== '' || maxPrice.trim() !== '') && (
              <TouchableOpacity 
                style={styles.clearPriceButton}
                onPress={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  applyAllFilters(undefined, undefined, null, '', '');
                }}
              >
                <Text style={styles.clearPriceText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FILTER THEO TÊN SẢN PHẨM */}
        <View style={styles.nameFilterContainer}>
          <Text style={styles.filterLabel}>Lọc theo tên sản phẩm:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedNameFilter || 'all'}
              onValueChange={(value) => handleNameFilter(value === 'all' ? null : value)}
              style={styles.picker}
              dropdownIconColor="#64748B"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Tất cả" value="all" />
              {getUniqueProductNames().map((name) => (
                <Picker.Item key={name} label={name} value={name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* FILTER THEO DANH MỤC */}
        <View style={styles.categoryFilterContainer}>
          <Text style={styles.filterLabel}>Lọc theo danh mục:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCategoryFilter || 0}
              onValueChange={(value) => handleCategoryFilter(value === 0 ? null : value)}
              style={styles.picker}
              dropdownIconColor="#64748B"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Tất cả" value={0} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* HIỂN THỊ SỐ KẾT QUẢ */}
        {isSearching && (
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              Tìm thấy {products.length} sản phẩm
              {searchKeyword.trim() !== '' && ` cho "${searchKeyword}"`}
              {selectedNameFilter !== null && 
                ` với tên "${selectedNameFilter}"`
              }
              {selectedCategoryFilter !== null && categories.find(c => c.id === selectedCategoryFilter) && 
                ` trong danh mục "${categories.find(c => c.id === selectedCategoryFilter)?.name}"`
              }
              {(() => {
                const minPriceNum = minPrice.trim() !== '' ? parseFloat(minPrice) : NaN;
                const maxPriceNum = maxPrice.trim() !== '' ? parseFloat(maxPrice) : NaN;
                const hasMin = !isNaN(minPriceNum) && minPriceNum >= 0;
                const hasMax = !isNaN(maxPriceNum) && maxPriceNum >= 0;
                
                if (hasMin || hasMax) {
                  const minText = hasMin ? `từ ${minPriceNum.toLocaleString()} đ` : '';
                  const maxText = hasMax ? `đến ${maxPriceNum.toLocaleString()} đ` : '';
                  const separator = hasMin && hasMax ? ' ' : '';
                  return ` với giá ${minText}${separator}${maxText}`;
                }
                return '';
              })()}
            </Text>
          </View>
        )}
      </View>


      {/* DANH SÁCH SẢN PHẨM */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            getImageSource={getImageSource}
            onPress={() => navigation.navigate("Details", { product: item })}
            onAddToCart={() => handleAddProductToCart(item)}
          />
        )}
      />
    </View>
  );
};



/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  // Banner styles
  bannerContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    marginBottom: 6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#F1F5F9',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  // Navigation menu styles
  navMenu: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  navItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  navItemActive: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.2,
  },
  navItemTextActive: {
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingRight: 40,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    color: '#1E293B',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nameFilterContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    minHeight: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    backgroundColor: '#FFFFFF',
    fontSize: 11,
    paddingVertical: 0,
  },
  pickerItem: {
    fontSize: 11,
    color: '#1E293B',
    height: 50,
  },
  categoryFilterContainer: {
    marginTop: 6,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  resultsInfo: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  resultsText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
  },
  priceFilterContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  priceInput: {
    height: 36,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 13,
    color: '#1E293B',
  },
  priceSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 18,
    marginHorizontal: 4,
  },
  clearPriceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  clearPriceText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productsList: {
    flex: 1,
  },
  gridContainer: { 
    paddingVertical: 4, 
    paddingHorizontal: 2, 
    justifyContent: 'space-around',
    paddingBottom: 60, // Tăng padding bottom để tránh bị che bởi bottom tab
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  card: {
    flex: 1 / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 6,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#6366F1',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  image: { 
    width: 65, 
    height: 65, 
    borderRadius: 6, 
    marginBottom: 4, 
    resizeMode: 'cover' 
  },
  infoContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 2,
    width: '100%',
  },
  productName: { 
    fontWeight: 'bold', 
    fontSize: 10, 
    textAlign: 'center', 
    lineHeight: 13, 
    color: '#333333',
    marginBottom: 2,
  },
  productPrice: { 
    color: '#EF4444', 
    fontWeight: '700', 
    fontSize: 11,
    letterSpacing: 0.2,
  },
  addButton: {
    marginTop: 6,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default HomeScreen;

