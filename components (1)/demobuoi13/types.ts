// 🔹 .ts (TypeScript file) → Chỉ chứa code TypeScript, không có JSX (JSX là cú pháp dùng trong React để viết UI).
// => Mục đích của file này là để lưu trữ các kiểu dữ liệu (type, interface) dùng chung giữa các màn hình.
// 🔹 .tsx (TypeScript with JSX) → Chứa cả code TypeScript và JSX (ví dụ: <View><Text>Hello</Text></View>).
import { Product } from '../../database/database';

export type HomeStackParamList = {
  Home: undefined;
  Details: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
  ProductManagement: { initialCategoryId?: number };
  Cart: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
  UserProfile: undefined;
  AdminDashboard: undefined;
  CategoryManagement: undefined;
  UserManagement: undefined;
  OrderManagement: undefined;
};
