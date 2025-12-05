import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import {
  getCart,
  updateCartQuantity,
  removeCartItem,
  createOrder,
  clearCart,
} from "../database";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useStripe } from "@stripe/stripe-react-native";
import { productImages } from "../../src/utils/productImages";

interface CartItem {
  id: number; // ID dòng cart
  productId: number; // ID sản phẩm thật
  name: string;
  price: number;
  img: string;
  quantity: number;
}

type RootStackParamList = {
  Cart: undefined;
  OrderHistory: undefined;
};

const CartScreen = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentVisible, setPaymentVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const loadCart = async () => {
    const data = await getCart();
    setItems(data as CartItem[]);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const inc = async (item: CartItem) => {
    await updateCartQuantity(item.id, item.quantity + 1);
    loadCart();
  };

  const dec = async (item: CartItem) => {
    if (item.quantity === 1) {
      Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa?", [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          onPress: async () => {
            await removeCartItem(item.id);
            loadCart();
          },
        },
      ]);
    } else {
      await updateCartQuantity(item.id, item.quantity - 1);
      loadCart();
    }
  };

  // =============================================================
  // 1. HANDLE COD
  // =============================================================
  const handleCOD = async () => {
    const orderItems = items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    const orderId = await createOrder(1, orderItems, "cod");
    await clearCart();

    Alert.alert("Đặt hàng thành công (COD)", `Mã đơn hàng: ${orderId}`, [
      { text: "Xem đơn hàng", onPress: () => navigation.navigate("OrderHistory") },
    ]);

    loadCart();
    setPaymentVisible(false);
  };

  // =============================================================
  // 2. HANDLE STRIPE
  // =============================================================
  const fetchPaymentIntent = async () => {
    const response = await fetch("https://your-server.com/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Stripe yêu cầu đơn vị = CENT
      body: JSON.stringify({ amount: total * 100 }),
    });

    const data = await response.json();
    return data.clientSecret;
  };

  const handleStripe = async () => {
    try {
      const clientSecret = await fetchPaymentIntent();

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "My Store",
      });

      if (initError) {
        alert(initError.message);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        alert(paymentError.message);
      } else {
        const orderItems = items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        }));

        const orderId = await createOrder(1, orderItems, "stripe");

        await clearCart();
        loadCart();
        setPaymentVisible(false);

        Alert.alert("Thanh toán thành công!", `Mã đơn hàng: ${orderId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi thanh toán Stripe.");
    }
  };

  // =============================================================
  // 3. HANDLE QR
  // =============================================================
  const handleQR = async () => {
    const orderItems = items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    const orderId = await createOrder(1, orderItems, "qr");

    await clearCart();
    loadCart();
    setPaymentVisible(false);

    setQrVisible(true);

    Alert.alert("Đã tạo đơn hàng QR", `Mã đơn hàng: ${orderId}`);
  };

  // =============================================================
  // UI RETURN
  // =============================================================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Giỏ hàng</Text>

        <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")}>
          <Ionicons name="receipt-outline" size={28} color="#BB86FC" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              source={productImages[item.img] || require("../../assets/images/hinh1.jpg")}
              style={styles.img}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price.toLocaleString("vi-VN")}đ</Text>

              <View style={styles.qty}>
                <TouchableOpacity onPress={() => dec(item)}>
                  <Text style={styles.qtyBtn}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity onPress={() => inc(item)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.total}>Tổng cộng: {total.toLocaleString("vi-VN")}đ</Text>

        <TouchableOpacity
          style={styles.checkout}
          onPress={() => setPaymentVisible(true)}
        >
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>

      {/* PAYMENT METHOD MODAL */}
      <Modal visible={paymentVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>

            <TouchableOpacity style={styles.payBtn} onPress={handleCOD}>
              <Text style={styles.payBtnText}>Thanh toán khi nhận hàng (COD)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.payBtn} onPress={handleStripe}>
              <Text style={styles.payBtnText}>Thanh toán bằng Stripe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.payBtn} onPress={handleQR}>
              <Text style={styles.payBtnText}>Thanh toán bằng QR Banking</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPaymentVisible(false)}>
              <Text style={styles.closeModal}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR MODAL */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.qrBox}>
            <Text style={styles.modalTitle}>Quét QR để thanh toán</Text>
            <QRCode
              size={220}
              value={`PAYMENT_${total}_${new Date().getTime()}`}
              backgroundColor="#121212"
              color="#FFFFFF"
            />
            <TouchableOpacity onPress={() => setQrVisible(false)}>
              <Text style={styles.closeModal}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartScreen;

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212", // Nền Tối
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: '#121212',
  },

  backButton: { paddingHorizontal: 10 },
  backArrow: { fontSize: 32, color: "#BB86FC" }, // Màu Nhấn Tím

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF", // Chữ Trắng
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E", // Card nền tối
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },

  img: { width: 80, height: 80, borderRadius: 12, marginRight: 15 },

  info: { flex: 1 },

  name: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },

  price: {
    color: "#03DAC6", // Màu Teal cho giá
    fontWeight: "800",
    fontSize: 16,
    marginVertical: 4,
  },

  qty: { flexDirection: "row", alignItems: "center", marginTop: 4 },

  qtyBtn: {
    fontSize: 28,
    paddingHorizontal: 10,
    color: "#BB86FC", // Màu Nhấn Tím
    fontWeight: "700",
  },

  quantity: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#333333", // Viền xám
  },

  total: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#FFFFFF",
  },

  checkout: {
    backgroundColor: "#BB86FC", // Màu Nhấn Tím
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  checkoutText: {
    color: "#121212", // Chữ tối
    fontSize: 18,
    fontWeight: "700",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    backgroundColor: "#1E1E1E", // Modal nền tối
    borderRadius: 16,
    padding: 25,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },

  payBtn: {
    backgroundColor: "#2C2C2C", // Nền nút tối hơn
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },

  payBtnText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#BB86FC", // Chữ Màu Nhấn
  },

  closeModal: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#CF6679", // Đỏ Cảnh báo
  },

  qrBox: {
    width: "90%",
    backgroundColor: "#1E1E1E", // QR Modal nền tối
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
  },
});