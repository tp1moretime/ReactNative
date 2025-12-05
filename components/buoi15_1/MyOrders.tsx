import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView, // Thêm SafeAreaView
    ActivityIndicator, // Thêm ActivityIndicator
} from "react-native";
import { useAuth } from "./AuthContext";
import { fetchOrdersByUser } from "../database";
import { Ionicons } from '@expo/vector-icons'; // Thêm icons

type Order = {
    id: number;
    total: number;
    date: string;
    status: string;
};

// Hàm lấy màu và text cho trạng thái
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

const MyOrders = ({ navigation }: any) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const res = (await fetchOrdersByUser(user.id)) as Order[];
                setOrders(res);
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    // Nếu chưa đăng nhập
    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Đơn Hàng Của Tôi</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.emptyText}>
                        Bạn cần đăng nhập để xem lịch sử đơn hàng.
                    </Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("LoginTab")}>
                         <Text style={styles.loginButtonText}>Đăng Nhập</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    
    // Đang tải
    if (loading) {
         return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}><Text style={styles.headerTitle}>Đơn Hàng Của Tôi</Text></View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#BB86FC" />
                    <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const renderItem = ({ item }: { item: Order }) => {
        const statusInfo = getStatusDisplay(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("OrderDetails", { id: item.id })}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>Mã đơn: #{item.id}</Text>
                    <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#B3B3B3" style={{ marginRight: 8 }} />
                    <Text style={styles.date}>Ngày đặt: {item.date}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                    <Text style={styles.total}>
                        Tổng tiền: {item.total.toLocaleString("vi-VN")}đ
                    </Text>
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
                <Text style={styles.headerTitle}>Đơn Hàng Của Tôi</Text>
                <View style={styles.backButton} />
            </View>

            {orders.length === 0 ? (
                 <View style={styles.loadingContainer}>
                    <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(i) => i.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

export default MyOrders;

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

    listContent: { padding: 15 },

    card: {
        backgroundColor: "#1E1E1E", // Card nền tối
        padding: 20, // Padding lớn hơn
        borderRadius: 16, // Bo góc lớn
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333333',
    },
    
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    },
    loginButton: {
        backgroundColor: '#BB86FC',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 20,
    },
    loginButtonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: 'bold',
    }
});