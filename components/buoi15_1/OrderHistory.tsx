import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { fetchOrders } from "../database";
import { Ionicons } from '@expo/vector-icons';

// ===================================
// Hàm lấy màu và text cho trạng thái
// ===================================
const getStatusDisplay = (status: string) => {
    switch (status) {
        case 'pending':
            return { text: 'Chờ xác nhận', color: '#FFD54F' }; // Vàng nhạt
        case 'shipping':
            return { text: 'Đang giao', color: '#4FC3F7' }; // Xanh dương nhạt
        case 'completed':
            return { text: 'Hoàn thành', color: '#03DAC6' }; // Teal
        case 'cancelled':
            return { text: 'Đã hủy', color: '#CF6679' }; // Đỏ Cảnh báo
        default:
            return { text: status, color: '#B3B3B3' };
    }
};

const OrderHistory = ({ navigation }: any) => { // Thêm navigation cho nút back
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchOrders();
            // Lọc dữ liệu thô (có thể cần lọc theo userId nếu API cho phép)
            setOrders(data);
        } catch (error) {
            console.error("Lỗi tải lịch sử đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        const statusInfo = getStatusDisplay(item.status);
        const orderDate = new Date(item.date).toLocaleDateString();

        return (
            <TouchableOpacity 
                style={styles.card}
                // Giả định có màn hình OrderDetails để navigate
                onPress={() => navigation.navigate("OrderDetails", { id: item.id })}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>Mã đơn: #{item.id}</Text>
                    <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#B3B3B3" style={{ marginRight: 8 }} />
                    <Text style={styles.date}>{orderDate}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.total}>Tổng tiền: {item.total.toLocaleString("vi-VN")}đ</Text>
                    <Ionicons name="chevron-forward" size={20} color="#BB86FC" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch Sử Đơn Hàng</Text>
                <View style={styles.backButton} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#BB86FC" />
                    <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
};

export default OrderHistory;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212" }, // Nền Tối
    
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },

    listContainer: { padding: 15 },
    
    card: {
        backgroundColor: "#1E1E1E", // Card nền tối
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333333',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2C',
        paddingBottom: 10,
    },
    orderId: { 
        fontSize: 18, 
        fontWeight: "bold", 
        color: "#BB86FC" // Màu nhấn
    },
    
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12, 
        fontWeight: '700',
    },
    
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    date: { 
        fontSize: 14, 
        color: "#B3B3B3" // Chữ xám
    },
    
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2C2C2C',
        paddingTop: 10,
        marginTop: 10,
    },
    total: { 
        fontSize: 16, 
        color: "#03DAC6", // Màu Teal cho tổng tiền
        fontWeight: "700" 
    },

    loadingContainer: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
    },
    loadingText: {
        color: '#B3B3B3',
        marginTop: 10,
        fontSize: 16,
    },
    emptyText: {
        color: '#B3B3B3',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
    }
});