import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Product1, HomeStackParamList } from './types';
import { fetchProducts, Product, searchProductsByNameOrCategory, filterProducts, initDatabase } from '../database';
import Header from './Header';

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const bannerImages = [
  require('../../assets/images/hinh1.jpg'),
  require('../../assets/images/hinh1.jpg'),
  require('../../assets/images/hinh1.jpg'),
];

// Sử dụng hình ảnh placeholder từ assets có sẵn
const productImages: ImageSourcePropType[] = [
  require('../../assets/images/hinh1.jpg'),
  require('../../assets/images/hinh1.jpg'),
  require('../../assets/images/hinh1.jpg'),
  require('../../assets/images/hinh1.jpg'),
];

// Hàm convert Product từ database sang Product1 để hiển thị
const convertProductToProduct1 = (product: Product): Product1 => {
  // Sử dụng hình ảnh dựa trên categoryId để có hình tương ứng
  const imageIndex = (product.categoryId - 1) % productImages.length;
  return {
    id: product.id.toString(),
    name: product.name,
    price: `${product.price.toLocaleString('vi-VN')}đ`,
    image: productImages[imageIndex] // Sử dụng hình ảnh theo danh mục
  };
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<Product1[]>([]);
  const [allProducts, setAllProducts] = useState<Product1[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = Dimensions.get('window');

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000); // 3 giây

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    // Fetch sản phẩm từ database khi component mount
    const loadProducts = async () => {
      try {
        setLoading(true);
        await initDatabase();
        const dbProducts = await fetchProducts();
        const convertedProducts = dbProducts.map(convertProductToProduct1);
        setProducts(convertedProducts);
        setAllProducts(convertedProducts); // Lưu tất cả sản phẩm để reset khi xóa search
      } catch (error) {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Tìm kiếm với debounce (chỉ khi không có filter active)
 // Trong useEffect search
useEffect(() => {
  if (isFilterActive) return;

  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

  if (searchKeyword.trim() === '') {
    setProducts(allProducts);
    setIsSearching(false);
    return;
  }

  setIsSearching(true);
  searchTimeoutRef.current = setTimeout(async () => {
    try {
      // Ép kiểu trả về Product[]
      const searchResults: Product[] = await searchProductsByNameOrCategory(searchKeyword.trim());
      const convertedResults = searchResults.map(convertProductToProduct1);
      setProducts(convertedResults);
    } catch (error) {
      console.error('❌ Lỗi khi tìm kiếm:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  return () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  };
}, [searchKeyword, allProducts, isFilterActive]);

// Hàm áp dụng filter
const handleApplyFilter = async () => {
  try {
    setIsFiltering(true);
    const min = minPrice.trim() ? parseFloat(minPrice.trim()) : undefined;
    const max = maxPrice.trim() ? parseFloat(maxPrice.trim()) : undefined;

    if (min !== undefined && max !== undefined && min > max) {
      Alert.alert('Lỗi', 'Giá tối thiểu không được lớn hơn giá tối đa');
      setIsFiltering(false);
      return;
    }

    const filteredResults: Product[] = await filterProducts(
      filterName.trim() || undefined,
      min,
      max
    );
    const convertedResults = filteredResults.map(convertProductToProduct1);
    setProducts(convertedResults);
    setIsFilterActive(true);
  } catch (error) {
    console.error('❌ Lỗi khi lọc sản phẩm:', error);
  } finally {
    setIsFiltering(false);
  }
};

  // Hàm reset filter
  const handleResetFilter = () => {
    setFilterName('');
    setMinPrice('');
    setMaxPrice('');
    setProducts(allProducts);
    setIsFilterActive(false);
    setSearchKeyword(''); // Reset search khi reset filter
  };

  const renderProduct = ({ item }: { item: Product1 }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { product: item })}
    >
      <View style={styles.productCard}>
        <Image source={item.image} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>

        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header với thông tin user và nút đăng xuất */}
      <Header />

      {/* Banner */}
      <View style={styles.bannerContainer}>        
        <FlatList
          ref={flatListRef}
          data={bannerImages}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width, height: 180 }}>
              <Image source={item} style={styles.banner} />
              <View style={styles.bannerOverlay}>
              </View>
            </View>
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />

        {/* Dots Indicator */}
        <View style={styles.dotContainer}>
          {bannerImages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { opacity: i === currentIndex ? 1 : 0.3 },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Menu điều hướng */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={22} color="#166534" style={{ marginRight: 8 }} />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Categories')}>
          <Feather name="folder" size={22} color="#166534" style={{ marginRight: 8 }} />
          <Text style={styles.menuText}>Danh mục sản phẩm</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>
        Chào mừng!
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#15803D" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên sản phẩm hoặc danh mục..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholderTextColor="#999"
            editable={!isFilterActive}
          />
          {searchKeyword.length > 0 && !isFilterActive && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchKeyword('')}>
              <Feather name="x" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilter(!showFilter)}
        >
          <MaterialIcons name="filter-list" size={20} color="#16A34A" style={{ marginRight: 6 }} />
          <Text style={styles.filterToggleText}>
            {showFilter ? '▾' : '▸'} Bộ lọc
          </Text>
          {isFilterActive && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>✨ Đang lọc</Text>
            </View>
          )}
        </TouchableOpacity>

        {showFilter && (
          <View style={styles.filterContent}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Tên sản phẩm:</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Nhập tên sản phẩm"
                value={filterName}
                onChangeText={setFilterName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Giá từ:</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="0"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.filterLabel}> - </Text>x
              <TextInput
                style={styles.filterInput}
                placeholder="Không giới hạn"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterButtons}>
              <TouchableOpacity style={[styles.filterButton, styles.applyButton]} onPress={handleApplyFilter}>
                <Feather name="check" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.filterButtonText}>Áp dụng</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterButton, styles.resetButton]} onPress={handleResetFilter}>
                <Feather name="rotate-ccw" size={14} color="#16A34A" style={{ marginRight: 4 }} />
                <Text style={[styles.filterButtonText, styles.resetButtonText]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isFilterActive ? (
                <>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                  </Text>
                </>
              ) : searchKeyword.trim() ? (
                <>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    Không tìm thấy sản phẩm nào với từ khóa &quot;{searchKeyword}&quot;
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
              )}
            </View>
          }
          ListHeaderComponent={
            (searchKeyword.trim() || isFilterActive) ? (
              <View>
                <Text>
                  {isFilterActive 
                    ? `Đã lọc: ${products.length} sản phẩm`
                    : `Tìm thấy ${products.length} sản phẩm`}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* BANNER */
  bannerContainer: {
  width: '100%',
  height: 180,
  borderRadius: 15,
  overflow: 'hidden',
  marginBottom: 15,
  elevation: 4,           // shadow Android
  shadowColor: '#000',    // shadow iOS
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  },
 
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'flex-end',
  },

  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 5,
  },

  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },

  /* MENU */
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7', // Xanh lá rất nhạt
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534', // Green 700
  },

  /* TITLE */
  welcomeText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 18,
    marginBottom: 10,
    color: '#166534',
    fontWeight: '700',
  },

  /* SEARCH BAR */
  searchContainer: {
    paddingHorizontal: 18,
    marginTop: 5,
    marginBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 48,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#15803D', // xanh lá đậm
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  clearButton: {
    width: 25,
    height: 25,
    borderRadius: 25,
    backgroundColor: '#86EFAC', // Soft green
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '700',
  },

  /* FILTER */
  filterContainer: {
    backgroundColor: '#ECFDF5', // xanh lá nhạt
    paddingVertical: 8,
    borderRadius: 12,
    width: '94%',
    alignSelf: 'center',
    marginTop: 10,
    elevation: 2,
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterToggleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16A34A', // primary green
  },
  filterBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  filterContent: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '92%',
    alignSelf: 'center',
    elevation: 3,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16A34A',
    minWidth: 85,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },

  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  applyButton: {
    backgroundColor: '#16A34A',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#16A34A',
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  resetButtonText: {
    color: '#16A34A',
  },

  /* LIST + CARDS */
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    color: '#14532D', // Dark green
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#DC2626', // đỏ để giữ độ nhấn
    marginTop: 4,
    fontWeight: '700',
  },
  buyButton: {
    marginTop: 10,
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  /* LOADING + EMPTY */
  loadingContainer: {
    paddingTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#166534',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HomeScreen;