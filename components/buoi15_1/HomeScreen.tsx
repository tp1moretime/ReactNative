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
    SafeAreaView,
    ScrollView, 
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Product1, HomeStackParamList } from './types';
import { useAuth } from './AuthContext';
import { fetchProducts, Product, searchProductsByNameOrCategory, filterProducts, initDatabase, addToCart } from '../database';
import { productImages } from "../../src/utils/productImages";
import Header from './Header'; 

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const screenWidth = Dimensions.get("window").width;
const ITEM_SPACING = 15 * 2; 
const ITEM_WIDTH = (screenWidth - ITEM_SPACING - 15) / 2; 

// XÓA MẢNG bannerImages
const bannerImages: any[] = []; 


// Hàm convert Product từ database sang Product1 để hiển thị
const convertProductToProduct1 = (product: Product): Product1 => {
    return {
        id: product.id.toString(),
        name: product.name,
        price: `${product.price.toLocaleString("vi-VN")}đ`, 
        image: productImages[product.img], 
        img: product.img, 
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
    // XÓA currentIndex và flatListRef do không dùng banner
    // const [currentIndex, setCurrentIndex] = useState(0); 
    // const flatListRef = useRef<FlatList<any>>(null); 
    const isFocused = navigation.isFocused();

    // XÓA useEffect auto scroll
    /*
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % bannerImages.length;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }, 3000); 

        return () => clearInterval(interval);
    }, [currentIndex]);
    */

    const refreshProducts = async () => {
        try {
            setLoading(true);
            await initDatabase(); 
            const dbProducts = await fetchProducts();
            const converted = dbProducts.map(convertProductToProduct1);
            setProducts(converted);
            setAllProducts(converted);
        } catch (error) {
            console.error('❌ Lỗi khi tải sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) refreshProducts();
    }, [isFocused]);

    // Logic tìm kiếm (GIỮ NGUYÊN)
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

    // Hàm áp dụng filter (GIỮ NGUYÊN)
    const handleApplyFilter = async () => {
        try {
            setIsFiltering(true);
            setShowFilter(false); 

            const normalizePrice = (value: string) => {
                if (!value || value.trim() === "") return undefined;
                const cleaned = value.replace(/[.,]/g, "");
                const number = parseFloat(cleaned);
                return Number.isNaN(number) ? undefined : number;
            };

            const min = normalizePrice(minPrice);
            const max = normalizePrice(maxPrice);

            // Validate giá nhập sai
            if ((minPrice && min === undefined) || (maxPrice && max === undefined)) {
                Alert.alert("Lỗi", "Giá trị nhập không hợp lệ!");
                return;
            }

            // Validate range
            if (min !== undefined && max !== undefined && min > max) {
                Alert.alert("Lỗi", "Giá tối thiểu không được lớn hơn giá tối đa");
                return;
            }

            const filteredResults: Product[] = await filterProducts(
                filterName.trim() || undefined,
                min,
                max
            );

            setProducts(filteredResults.map(convertProductToProduct1));
            setIsFilterActive(true);

        } catch (error) {
            console.error("❌ Lỗi khi lọc sản phẩm:", error);
        } finally {
            setIsFiltering(false);
        }
    };

    // Hàm reset filter (GIỮ NGUYÊN)
    const handleResetFilter = () => {
        setFilterName('');
        setMinPrice('');
        setMaxPrice('');
        setProducts(allProducts);
        setIsFilterActive(false);
        setSearchKeyword(''); 
    };

    const { user } = useAuth();

    const handleAddToCart = async (product: Product1) => {
        if (!user) {
            Alert.alert(
                "Bạn chưa đăng nhập",
                "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.",
                [
                    { text: "Hủy" },
                    { text: "Đăng nhập", onPress: () => navigation.getParent()?.navigate("LoginTab") }
                ]
            );
            return;
        }

        await addToCart({
            id: Number(product.id),
            name: product.name,
            price: Number(product.price.replace(/[^\d]/g, "")),
            img: product.img,
            categoryId: 0,
        });

        Alert.alert("🎉 Thành công", "Đã thêm vào giỏ hàng!");
    };

    const handleBuyNow = async (product: Product1) => {
        if (!user) {
            Alert.alert(
                "Bạn chưa đăng nhập",
                "Bạn cần đăng nhập để mua hàng.",
                [
                    { text: "Hủy" },
                    { text: "Đăng nhập", onPress: () => navigation.getParent()?.navigate("LoginTab") }
                ]
            );
            return;
        }

        await handleAddToCart(product);
        navigation.navigate("Cart");
    };

    // Render Product Item (GIỮ NGUYÊN)
    const renderProduct = ({ item }: { item: Product1 }) => (
        <View style={styles.productCard}>

            {/* Hình sản phẩm */}
            <TouchableOpacity
                onPress={() => navigation.navigate("Details", { product: item })}
                style={styles.imageWrapper}
            >
                <Image source={item.image} style={styles.productImage} />
            </TouchableOpacity>

            {/* Tên sản phẩm */}
            <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productName}>
                    {item.name}
                </Text>

                {/* Giá */}
                <Text style={styles.productPrice}>{item.price}</Text>
            </View>

            {/* Nút hành động nổi bật (Buy Now) */}
            <View style={styles.actionOverlay}>
                <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => handleAddToCart(item)}
                >
                    <Ionicons name="cart-outline" size={20} color="#BB86FC" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buyNowBtn}
                    onPress={() => handleBuyNow(item)}
                >
                    <Text style={styles.buyNowText}>Mua Ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            
            {/* Header (Sử dụng Dark Mode Header) */}
            <Header /> 

            <ScrollView>
                
                {/* Search Bar và Giỏ hàng (Được đưa lên sát Header) */}
                <View style={styles.topBar}>
                    <View style={styles.searchBoxMain}>
                        <Feather name="search" size={20} color="#BB86FC" style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchKeyword}
                            onChangeText={setSearchKeyword}
                            placeholderTextColor="#B3B3B3"
                            editable={!isFilterActive}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.cartButtonHeader}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Ionicons name="cart-outline" size={26} color="#03DAC6" />
                    </TouchableOpacity>
                </View>

                {/* Menu điều hướng/Filter (Được đặt ngay dưới Top Bar) */}
                <View style={styles.menuContainer}>
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Categories')}>
                        <Feather name="grid" size={24} color="#03DAC6" style={{ marginRight: 8 }} />
                        <Text style={styles.menuText}>Danh Mục</Text>
                    </TouchableOpacity>

                    {/* Filter Toggle */}
                    <TouchableOpacity
                        style={styles.filterToggle}
                        onPress={() => setShowFilter(!showFilter)}
                    >
                        <MaterialIcons name="filter-list" size={20} color="#BB86FC" style={{ marginRight: 6 }} />
                        <Text style={styles.filterToggleText}>
                            {showFilter ? '▾' : '▸'} Bộ lọc
                        </Text>
                        {isFilterActive && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>✨</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Filter Content (Nếu mở) */}
                {showFilter && (
                    <View style={styles.filterContentWrapper}>
                        <View style={styles.filterContent}>
                            <View style={styles.filterRow}>
                                <Text style={styles.filterLabel}>Tên SP: </Text>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Tên sản phẩm"
                                    value={filterName}
                                    onChangeText={setFilterName}
                                    placeholderTextColor="#B3B3B3"
                                />
                            </View>

                            <View style={styles.filterRow}>
                                <Text style={styles.filterLabel}>Giá Min/Max: </Text>
                                <TextInput
                                    style={[styles.filterInput, { flex: 0.6 }]}
                                    placeholder="Min"
                                    value={minPrice}
                                    onChangeText={setMinPrice}
                                    keyboardType="numeric"
                                    placeholderTextColor="#B3B3B3"
                                />
                                <TextInput
                                    style={[styles.filterInput, { flex: 0.6 }]}
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChangeText={setMaxPrice}
                                    keyboardType="numeric"
                                    placeholderTextColor="#B3B3B3"
                                />
                            </View>

                            <View style={styles.filterButtons}>
                                <TouchableOpacity style={[styles.filterButton, styles.applyButton]} onPress={handleApplyFilter} disabled={isFiltering}>
                                    <Feather name="check" size={16} color="#121212" style={{ marginRight: 4 }} />
                                    <Text style={styles.applyButtonText}>{isFiltering ? 'Lọc...' : 'Áp dụng'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.filterButton, styles.resetButton]} onPress={handleResetFilter}>
                                    <Feather name="rotate-ccw" size={16} color="#BB86FC" style={{ marginRight: 4 }} />
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            

                <Text style={styles.productSectionTitle}>
                    {isFilterActive || searchKeyword ? 'Kết quả tìm kiếm/lọc' : 'Sản Phẩm Mới Nhất'}
                </Text>

                {/* Product List/Loading */}
                {loading || isSearching || isFiltering ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#BB86FC" />
                        <Text style={styles.loadingText}>
                            {loading ? 'Đang tải sản phẩm...' : isSearching ? 'Đang tìm kiếm...' : 'Đang lọc...'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        numColumns={2}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={styles.productListContainer}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>}
                        scrollEnabled={false} // Cuộn chung với ScrollView lớn
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212", // Nền Tối
    },

    /* TOP BAR (Search & Cart) */
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        marginTop: 15,
        justifyContent: 'space-between',
    },
    searchBoxMain: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E", // Nền tối hơn
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: "#333333",
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#FFFFFF",
    },
    cartButtonHeader: {
        padding: 10,
        backgroundColor: "#1E1E1E",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#03DAC6',
    },
    clearButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#CF6679",
        justifyContent: "center",
        alignItems: "center",
    },

    /* MENU */
    menuContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15, // Giảm khoảng cách sau khi xóa banner
        paddingHorizontal: 15, // Thống nhất padding
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333333'
    },
    menuText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    
    /* FILTER */
    filterToggle: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333333',
        backgroundColor: '#1E1E1E',
    },
    filterToggleText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#BB86FC",
        marginLeft: 6,
    },
    filterBadge: {
        backgroundColor: "#03DAC6",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
        marginLeft: 6,
    },
    filterBadgeText: {
        color: "#121212",
        fontSize: 12,
        fontWeight: "700",
    },
    filterContentWrapper: {
        width: "90%",
        alignSelf: "center",
        marginTop: 15,
        backgroundColor: "#1E1E1E",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333333',
        padding: 15,
    },
    filterContent: {
        // Nội dung bên trong wrapper
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    filterLabel: {
        minWidth: 70,
        fontSize: 14,
        color: "#B3B3B3",
        fontWeight: "600",
    },
    filterInput: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        borderWidth: 1,
        borderColor: "#333333",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        color: "#FFFFFF",
        fontSize: 14,
        marginHorizontal: 4,
    },
    filterButtons: {
        flexDirection: "row",
        marginTop: 15,
        gap: 10,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
    },
    applyButton: {
        backgroundColor: "#BB86FC",
    },
    applyButtonText: {
        color: "#121212",
        fontWeight: "700",
        fontSize: 16,
    },
    resetButton: {
        borderWidth: 1,
        borderColor: "#BB86FC",
        backgroundColor: 'transparent',
    },
    resetButtonText: {
        color: "#BB86FC",
        fontWeight: "700",
        fontSize: 16,
    },

    /* PRODUCT LIST & ITEM */
    productSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#BB86FC',
        marginTop: 25,
        marginBottom: 5,
        paddingHorizontal: 15,
    },
    productListContainer: {
        paddingTop: 10,
        paddingHorizontal: 15,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: "space-between",
        marginBottom: 15,
    },
    productCard: {
        width: ITEM_WIDTH,
        backgroundColor: "#1E1E1E", // Card nền tối
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: "#333333",
        position: 'relative',
        height: 270, 
    },
    imageWrapper: {
        flex: 1,
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    productImage: {
        width: "100%",
        height: 150, 
        borderRadius: 12,
        resizeMode: 'cover',
    },
    productInfo: {
        marginBottom: 10,
        minHeight: 40,
    },
    productName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#03DAC6", // Màu Teal cho giá
        marginTop: 4,
    },
    actionOverlay: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#2C2C2C',
    },
    addToCartBtn: {
        width: 40,
        height: 40,
        backgroundColor: "#2C2C2C",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#BB86FC',
    },
    buyNowBtn: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: "#BB86FC", // Mua ngay màu nhấn tím
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
    },
    buyNowText: {
        color: "#121212",
        fontWeight: "700",
        fontSize: 15,
    },

    /* LOADING */
    loadingContainer: {
        paddingTop: 40,
        alignItems: "center",
    },
    loadingText: {
        fontSize: 15,
        marginTop: 10,
        color: "#B3B3B3",
    },
    emptyText: {
        color: '#B3B3B3',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
    }
});


export default HomeScreen;