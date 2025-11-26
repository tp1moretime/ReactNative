import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('myDatabase.db');
  }
  return db;
};

export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export type CartItemWithProduct = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  name: string;
  price: number;
  img: string;
};

export type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: string | null;
  note?: string | null;
};

export type OrderWithUser = Order & {
  username: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  img: string;
};

const initialCategories: Category[] = [
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Giày' },
  { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' },
  { id: 5, name: 'Túi' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Áo thun Doreamon', price: 250000, img: 'aothun.jpg', categoryId: 1 },
  { id: 2, name: 'Giày sneaker', price: 1100000, img: 'shoesDRM.jpg', categoryId: 2 },
  { id: 3, name: 'Balo thời trang', price: 490000, img: 'balo.jpg', categoryId: 3 },
  { id: 4, name: 'Mũ bảo hiểm thời trang', price: 120000, img: 'hat.jpg', categoryId: 4 },
  { id: 5, name: 'Túi đeo chéo dễ thương', price: 980000, img: 'tui.jpg', categoryId: 5 },
];

// ====================== KHỞI TẠO DATABASE ======================
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const db = getDb();

    // Tạo bảng categories, products, users
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        img TEXT,
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER DEFAULT 1,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        totalAmount REAL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT,
        shippingAddress TEXT,
        note TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );
    `);

    console.log("✅ Tables created (categories, products, users)");

    // Thêm categories mẫu
    for (const c of initialCategories) {
      await db.runAsync(
        "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
        [c.id, c.name]
      );
    }

    // Thêm products mẫu
    for (const p of initialProducts) {
      await db.runAsync(
        "INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)",
        [p.id, p.name, p.price, p.img, p.categoryId]
      );
    }

    // Thêm user admin nếu chưa có
    await db.runAsync(
      `INSERT INTO users (username, password, role)
       SELECT 'admin', '123456', 'admin'
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`
    );

    console.log("✅ Admin user created");

    console.log("✅ Database initialized");

    if (onSuccess) onSuccess(); // Gọi loadData() trong useEffect()

  } catch (error) {
    console.error("❌ initDatabase error:", error);
  }
};

// CRUD USERS
// ======================= CRUD USERS =======================

// ➕ Thêm người dùng
export const addUser = async (username: string, password: string, role: string): Promise<boolean> => {
  try {
    const db = getDb();
    
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await db.getFirstAsync(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser) {
      console.log('❌ Username already exists:', username);
      return false;
    }
    
    await db.runAsync(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    
    // Verify user was added
    const newUser = await db.getFirstAsync(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    console.log('✅ User added successfully:', newUser ? 'Verified' : 'Not found after insert');
    return true;
  } catch (error) {
    console.error('❌ Error adding user:', error);
    // Log chi tiết lỗi
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};


// ✏️ Cập nhật người dùng
export const updateUser = async (user: User): Promise<boolean> => {
  try {
    const db = getDb();
    await db.runAsync(
      'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?',
      [user.username, user.password, user.role, user.id]
    );
    console.log('✅ User updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return false;
  }
};

// ❌ Xóa người dùng theo ID
export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const db = getDb();
    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
    console.log('✅ User deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }
};


// 📌 Lấy danh sách tất cả người dùng
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync('SELECT * FROM users');
    return rows as User[];
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
};

// 🔐 Lấy người dùng theo username + password (đăng nhập)
export const getUserByCredentials = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const db = getDb();
    
    // Debug: Log tất cả users để kiểm tra
    const allUsers = await db.getAllAsync('SELECT * FROM users');
    console.log('📋 All users in database:', allUsers);
    console.log('🔍 Searching for:', { username, password });
    
    const row = await db.getFirstAsync(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    console.log('🔍 Query result:', row ? 'Found user' : 'No user found');
    
    return (row as User) ?? null;
  } catch (error) {
    console.error('❌ Error getting user by credentials:', error);
    return null;
  }
};

// 🔎 Lấy người dùng theo ID
export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = getDb();
    const row = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [id]);
    return (row as User) ?? null;
  } catch (error) {
    console.error('❌ Error getting user by id:', error);
    return null;
  }
};

// ====================== CATEGORY ======================
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync('SELECT * FROM categories');
    return rows as Category[];
  } catch (error) {
    console.error(' Error fetching categories:', error);
    return [];
  }
};

// ➕ Thêm category
export const addCategory = async (name: string): Promise<boolean> => {
  try {
    const db = getDb();
    // Tìm ID lớn nhất và tăng lên 1
    const maxIdRow = await db.getFirstAsync('SELECT MAX(id) as maxId FROM categories');
    const newId = maxIdRow && (maxIdRow as any).maxId ? ((maxIdRow as any).maxId + 1) : 1;
    
    await db.runAsync('INSERT INTO categories (id, name) VALUES (?, ?)', [newId, name]);
    console.log('✅ Category added');
    return true;
  } catch (error) {
    console.error('❌ Error adding category:', error);
    return false;
  }
};

// ✏️ Cập nhật category
export const updateCategory = async (category: Category): Promise<boolean> => {
  try {
    const db = getDb();
    await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', [category.name, category.id]);
    console.log('✅ Category updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating category:', error);
    return false;
  }
};

// ❌ Xóa category
export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const db = getDb();
    // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
    const products = await db.getAllAsync('SELECT * FROM products WHERE categoryId = ?', [id]);
    if (products.length > 0) {
      console.log('❌ Cannot delete category: products are using it');
      return false;
    }
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
    console.log('✅ Category deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    return false;
  }
};

// ====================== PRODUCT ======================
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync('SELECT * FROM products');
    return rows as Product[];
  } catch (error) {
    console.error(' Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const db = getDb();
    await db.runAsync(
      'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
      [product.name, product.price, product.img, product.categoryId]
    );
    console.log(' Product added');
  } catch (error) {
    console.error(' Error adding product:', error);
  }
};

export const updateProduct = async (product: Product) => {
  try {
    const db = getDb();
    await db.runAsync(
      'UPDATE products SET name = ?, price = ?, img = ?, categoryId = ? WHERE id = ?',
      [product.name, product.price, product.img, product.categoryId, product.id]
    );
    console.log(' Product updated');
  } catch (error) {
    console.error(' Error updating product:', error);
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const db = getDb();
    await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
    console.log(' Product deleted');
  } catch (error) {
    console.error(' Error deleting product:', error);
  }
};

// ====================== SEARCH ======================
export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      `SELECT products.* FROM products
       JOIN categories ON products.categoryId = categories.id
       WHERE products.name LIKE ? OR categories.name LIKE ?`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    return rows as Product[];
  } catch (error) {
    console.error(' Error searching products:', error);
    return [];
  }
};

// ====================== FETCH PRODUCTS BY CATEGORY ======================
export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM products WHERE categoryId = ?',
      [categoryId]
    );
    return rows as Product[];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// ====================== FILTER PRODUCTS BY PRICE RANGE ======================
export const fetchProductsByPriceRange = async (minPrice?: number, maxPrice?: number): Promise<Product[]> => {
  try {
    const db = getDb();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (minPrice !== undefined && minPrice !== null && minPrice > 0) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice > 0) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    const rows = await db.getAllAsync(query, params);
    return rows as Product[];
  } catch (error) {
    console.error('Error fetching products by price range:', error);
    return [];
  }
};

// ====================== SEARCH PRODUCTS BY NAME ONLY ======================
export const searchProductsByName = async (keyword: string): Promise<Product[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM products WHERE name LIKE ?',
      [`%${keyword}%`]
    );
    return rows as Product[];
  } catch (error) {
    console.error('Error searching products by name:', error);
    return [];
  }
};

// ====================== CART ======================
export const addToCart = async (userId: number, productId: number, quantity = 1): Promise<void> => {
  try {
    const db = getDb();
    const existing = await db.getFirstAsync(
      'SELECT id, quantity FROM cart_items WHERE userId = ? AND productId = ?',
      [userId, productId]
    );

    if (existing) {
      const currentQty = (existing as any).quantity ?? 0;
      await db.runAsync(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [currentQty + quantity, (existing as any).id]
      );
    } else {
      await db.runAsync(
        'INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

export const fetchCartItemsByUser = async (userId: number): Promise<CartItemWithProduct[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      `SELECT cart_items.id, cart_items.userId, cart_items.productId, cart_items.quantity,
              products.name, products.price, products.img
       FROM cart_items
       JOIN products ON cart_items.productId = products.id
       WHERE cart_items.userId = ?
       ORDER BY cart_items.id DESC`,
      [userId]
    );
    return rows as CartItemWithProduct[];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

export const updateCartItemQuantity = async (itemId: number, quantity: number): Promise<void> => {
  try {
    const db = getDb();
    await db.runAsync('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
  } catch (error) {
    console.error('Error updating cart quantity:', error);
  }
};

export const removeCartItem = async (itemId: number): Promise<void> => {
  try {
    const db = getDb();
    await db.runAsync('DELETE FROM cart_items WHERE id = ?', [itemId]);
  } catch (error) {
    console.error('Error removing cart item:', error);
  }
};

export const clearCart = async (userId: number): Promise<void> => {
  try {
    const db = getDb();
    await db.runAsync('DELETE FROM cart_items WHERE userId = ?', [userId]);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// ====================== ORDERS ======================
export const createOrder = async (
  userId: number,
  items: { productId: number; quantity: number; price: number }[],
  shippingAddress?: string,
  note?: string
): Promise<number | null> => {
  if (!items.length) return null;
  try {
    const db = getDb();
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const insertResult = await db.runAsync(
      'INSERT INTO orders (userId, totalAmount, status, createdAt, shippingAddress, note) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, totalAmount, 'pending', new Date().toISOString(), shippingAddress ?? null, note ?? null]
    );
    let orderId: number | null = null;
    if (typeof insertResult.lastInsertRowId === 'number') {
      orderId = insertResult.lastInsertRowId;
    } else {
      const row = await db.getFirstAsync('SELECT last_insert_rowid() as id');
      orderId = row ? (row as any).id : null;
    }

    if (!orderId) {
      throw new Error('Can not determine order id');
    }

    for (const item of items) {
      await db.runAsync(
        'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    await clearCart(userId);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

export const fetchOrdersByUser = async (userId: number): Promise<Order[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM orders WHERE userId = ? ORDER BY datetime(createdAt) DESC',
      [userId]
    );
    return rows as Order[];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

export const fetchAllOrders = async (): Promise<OrderWithUser[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      `SELECT orders.*, users.username
       FROM orders
       LEFT JOIN users ON orders.userId = users.id
       ORDER BY datetime(orders.createdAt) DESC`
    );
    return rows as OrderWithUser[];
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

export const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      `SELECT order_items.*, products.name, products.img
       FROM order_items
       JOIN products ON order_items.productId = products.id
       WHERE order_items.orderId = ?`,
      [orderId]
    );
    return rows as OrderItem[];
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
  try {
    const db = getDb();
    await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};
