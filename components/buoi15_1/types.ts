import { ImageSourcePropType } from 'react-native';

// interface trước khi tạo Category
export interface Product1 {
  id: string;
  name: string;
  price: string;

  // require(...) ảnh
  image: ImageSourcePropType;

  // tên file trong DB
  img: string;
}


// interface khi tạo Category
export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  quantity: number;
}

// Kiểu danh sách màn hình trong Stack
export type HomeStackParamList = {
  Home: undefined;
  Details: { product: Product1 };
  ProductsByCategory: { categoryId: number };
  Accessory: undefined;
  Fashion: undefined;
  Categories: undefined;
  About: undefined;
  MainTabs: undefined;
  AdminDashboard: undefined;
  CategoryManagement: undefined;
  UserManagement: undefined;
  AddUser: undefined;
  EditUser: { userId: number };
  ProductManagement: { categoryId: number };
  Cart: undefined;
  OrderManagement: undefined;
  OrderDetails: {
    orderId: number;
    onStatusChange?: (newStatus: string) => void;
  };
  OrderHistory: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
  MyOrders: undefined;
  EditProduct: { product: Product; onSave: () => Promise<void> };
};


// Kiểu item cho menu admin
export interface MenuItem<K extends keyof HomeStackParamList = keyof HomeStackParamList> {
    id: string;
    title: string;
    icon: string;
    screen: K;
    description: string;
    params?: HomeStackParamList[K];
}