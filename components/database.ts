// ========================== IMPORT ==========================
import * as SQLite from "expo-sqlite";

// export const deleteDatabase = async () => {
//   const dbPath = FileSystem.documentDirectory  + "SQLite/myDatabases.db";

//   try {
//     const fileInfo = await FileSystem.getInfoAsync(dbPath);

//     if (fileInfo.exists) {
//       await FileSystem.deleteAsync(dbPath, { idempotent: true });
//       console.log("🗑 Database deleted successfully!");

//       // Sau khi xóa, nên reset lại dbReady để lần sau initDatabase() tạo mới
//       dbReady = false;
//     } else {
//       console.log("⚠️ Database file not found at:", dbPath);
//     }
//   } catch (error) {
//     console.error("❌ Error deleting DB:", error);
//   }
// };
const db = SQLite.openDatabaseSync("myDatabases.db");


// ========================== TYPES ==========================
export type Category = { id: number; name: string };
export type Product = { id: number; name: string; price: number; img: string; categoryId: number };
export type User = { id: number; username: string; password: string; role: "admin" | "user"; avatar?: string | null };
export type Order = {
  id: number;
  userId: number;
  total: number;
  status: "pending" | "shipping" | "completed" | "cancelled";
  date: string;
  paymentMethod: "cod" | "stripe" | "qr";
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export let dbReady = false;

// ========================== DATA ==========================
const initialCategories: Category[] = [
  { id: 1, name: "Acura" }, { id: 2, name: "Hyundai" }, { id: 3, name: "Lamborghini" },
  { id: 4, name: "tesla_cybertruck" },
];

const initialProducts: Product[] = [
  { id: 1, name: "Acura ILX", price: 28000, img: 'acura_PNG120.png', categoryId: 1 },
  { id: 2, name: "Acura MDX", price: 48000, img: 'acura_PNG122.png', categoryId: 1 },
  { id: 3, name: "Hyundai Elantra", price: 20000, img: 'hyundai_PNG112.png', categoryId: 2 },
  { id: 4, name: "Hyundai Santa Fe", price: 35000, img: 'hyundai_PNG11238.png', categoryId: 2 },
  { id: 5, name: "Hyundai Tucson", price: 30000, img: 'hyundai_PNG11241.png', categoryId: 2 },
  { id: 6, name: "Lamborghini Aventador", price: 393695, img: 'lamborghini1.png', categoryId: 3 },
  { id: 7, name: "Lamborghini Huracan", price: 261274, img: 'lamborghini2.png', categoryId: 3 },
  { id: 8, name: "Lamborghini Urus", price: 218009, img: 'lamborghini3.png', categoryId: 3 },
  { id: 9, name: "Lamborghini Gallardo", price: 200000, img: 'lambordini4.png', categoryId: 3 },
  { id: 10, name: "Tesla Cybertruck 1", price: 39990, img: 'tesla_cybertruck1.png', categoryId: 4 },
  { id: 11, name: "Tesla Cybertruck 2", price: 49990, img: 'tesla_cybertruck2.png', categoryId: 4 },
  { id: 12, name: "Tesla Cybertruck 3", price: 69990, img: 'tesla_cybertruck3.png', categoryId: 4 },
  { id: 13, name: "Tesla Cybertruck 4", price: 89990, img: 'tesla_cybertruck4.png', categoryId: 4 },
];

// ========================== INIT DB ==========================
export const initDatabase = () => {
  if (dbReady) {
    console.log("ℹ️ Database already initialized.");
    return;
  }
  dbReady = true;

  try {
    console.log("🚀 Initializing database...");

    // Tạo các bảng
    db.execSync(`
      CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT);
    `);
    db.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL,
        img TEXT,
        categoryId INTEGER
      );
    `);
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        avatar TEXT
      );
    `);
    db.execSync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER,
        name TEXT,
        price REAL,
        quantity INTEGER,
        img TEXT
      );
    `);
    db.execSync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        total REAL,
        status TEXT,
        date TEXT,
        paymentMethod TEXT
      );
    `);
    // ⚠️ Ensure `paymentMethod` column exists
    try {
      const columns = db.getAllSync(`PRAGMA table_info(orders);`);
      const hasPaymentColumn = columns.some((c: any) => c.name === "paymentMethod");

      if (!hasPaymentColumn) {
        console.log("⚠️ Adding missing column: paymentMethod");
        db.execSync("ALTER TABLE orders ADD COLUMN paymentMethod TEXT;");
      }
    } catch (err) {
      console.error("❌ Failed to migrate orders table:", err);
    }

    db.execSync(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        productId INTEGER,
        name TEXT,
        price REAL,
        quantity INTEGER
      );
    `);

    for (const c of initialCategories) {
      db.runSync(
        "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
        [c.id, c.name]
      );
    }

    // ===== Insert initial products =====
    for (const p of initialProducts) {
      db.runSync(
        "INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)",
        [p.id, p.name, p.price, p.img, p.categoryId]
      );
    }

    // Insert admin default nếu chưa có
    const admin = db.getFirstSync(
      "SELECT * FROM users WHERE username='admin'"
    );

    if (!admin) {
      db.runSync(
        "INSERT INTO users (username, password, role) VALUES ('admin','123456','admin')"
      );
    }

    console.log("✅ Database Ready!");

  } catch (err) {
    console.error("❌ Database init failed:", err);
  }
};

// ========================== FETCH ==========================
export const fetchCategories = (): Category[] => {
  return db.getAllSync("SELECT * FROM categories");
};

export const fetchProducts = (): Product[] => {
  return db.getAllSync("SELECT * FROM products");
};

export const fetchProductsByCategory = (categoryId: number) => {
  return db.getAllSync("SELECT * FROM products WHERE categoryId = ?", [categoryId]);
};

// ========================== PRODUCTS ==========================
export const addProduct = (p: Omit<Product, "id">) => {
  db.runSync(
    "INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)",
    [p.name, p.price, p.img, p.categoryId]
  );
};

export const updateProduct = (p: Product) => {
  db.runSync(
    "UPDATE products SET name=?, price=?, img=?, categoryId=? WHERE id=?",
    [p.name, p.price, p.img, p.categoryId, p.id]
  );
};

export const deleteProduct = (id: number) => {
  db.runSync("DELETE FROM products WHERE id=?", [id]);
};

// ========================== CART ==========================
// export const addToCart = (product: Product) => {
//   const existing = db.getFirstSync("SELECT * FROM cart WHERE productId=?", [product.id]);

//   if (existing) {
//     db.runSync("UPDATE cart SET quantity = quantity + 1 WHERE productId=?", [product.id]);
//   } else {
//     db.runSync(
//       "INSERT INTO cart (productId, name, price, quantity, img) VALUES (?, ?, ?, ?, ?)",
//       [product.id, product.name, product.price, 1, product.img]
//     );
//   }
// };
export const addToCart = (product: Product) => {
  const existing = db.getFirstSync(
    "SELECT * FROM cart WHERE productId=?",
    [product.id]
  );

  if (existing) {
    db.runSync(
      "UPDATE cart SET quantity = quantity + 1 WHERE productId=?",
      [product.id]
    );
  } else {
    db.runSync(
      "INSERT INTO cart (productId, name, price, quantity, img) VALUES (?, ?, ?, ?, ?)",
      [
        product.id,
        product.name,
        product.price,
        1,
        product.img 
      ]
    );
  }
};

export const getCart = () => db.getAllSync("SELECT * FROM cart");

export const removeCartItem = (id: number) => {
  db.runSync("DELETE FROM cart WHERE id=?", [id]);
};

export const updateCartQuantity = (id: number, quantity: number) => {
  db.runSync("UPDATE cart SET quantity=? WHERE id=?", [quantity, id]);
};

export const clearCart = () => {
  db.runSync("DELETE FROM cart");
};

// ========================== SEARCH ==========================
export const searchProductsByNameOrCategory = (keyword: string): Product[] => {
  return db.getAllSync(
    `
      SELECT products.* 
      FROM products 
      JOIN categories ON products.categoryId = categories.id 
      WHERE products.name LIKE ? OR categories.name LIKE ?
    `,
    [`%${keyword}%`, `%${keyword}%`]
  );
};

// ========================== FILTER ==========================
export const filterProducts = (name?: string, min?: number, max?: number): Product[] => {
  let query = "SELECT * FROM products WHERE 1=1";
  const params: any[] = [];

  if (name) { query += " AND name LIKE ?"; params.push(`%${name}%`); }
  if (min != null) { query += " AND price >= ?"; params.push(min); }
  if (max != null) { query += " AND price <= ?"; params.push(max); }

  return db.getAllSync(query, params);
};

// ========================== USERS ==========================
export const addUser = (username: string, password: string, role = "user") => {
  db.runSync("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
    username,
    password,
    role,
  ]);
};

export const loginUser = (username: string, password: string): User | null => {
  return db.getFirstSync("SELECT * FROM users WHERE username=? AND password=?", [
    username,
    password,
  ]) as User | null;
};

export const fetchUsers = (): User[] => {
  return db.getAllSync("SELECT * FROM users ORDER BY id");
};

export const updateUserRole = (id: number, role: string) => {
  db.runSync("UPDATE users SET role=? WHERE id=?", [role, id]);
};

export const deleteUser = (id: number) => {
  db.runSync("DELETE FROM users WHERE id=?", [id]);
};

// ========================== CATEGORIES ==========================
export const addCategory = (name: string) => {
  const row = db.getFirstSync("SELECT MAX(id) as maxId FROM categories") as { maxId: number | null };
  const maxId = row?.maxId ?? 0;

  db.runSync("INSERT INTO categories (id, name) VALUES (?, ?)", [maxId + 1, name]);
};


export const updateCategory = (id: number, name: string) => {
  db.runSync("UPDATE categories SET name=? WHERE id=?", [name, id]);
};

export const deleteCategory = (id: number) => {
  db.runSync("DELETE FROM products WHERE categoryId=?", [id]);
  db.runSync("DELETE FROM categories WHERE id=?", [id]);
};

// ========================== ORDERS ==========================
export const createOrder = (
  userId: number,
  items: { productId: number; name: string; price: number; quantity: number }[],
  paymentMethod: "cod" | "stripe" | "qr"
) => {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const date = new Date().toISOString();

  const res: any = db.runSync(
    `INSERT INTO orders (userId, total, status, date, paymentMethod)
     VALUES (?, ?, 'pending', ?, ?)`,
    [userId, total, date, paymentMethod]
  );

  const orderId = res.lastInsertRowId;

  for (const i of items) {
    db.runSync(
      "INSERT INTO order_items (orderId, productId, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
      [orderId, i.productId, i.name, i.price, i.quantity]
    );
  }

  return orderId;
};


// export const fetchOrders = (): Order[] => {
//   return db.getAllSync("SELECT * FROM orders ORDER BY date DESC");
// };
export const fetchOrders = (): any[] => {
  return db.getAllSync(`
    SELECT 
      orders.*, 
      (SELECT COUNT(*) FROM order_items WHERE order_items.orderId = orders.id) AS itemCount
    FROM orders
    ORDER BY date DESC
  `);
};

export const fetchOrderDetails = (orderId: number) => {
  const order = db.getFirstSync("SELECT * FROM orders WHERE id=?", [orderId]);
  const items = db.getAllSync("SELECT * FROM order_items WHERE orderId=?", [orderId]);

  return { order, items };
};

export const updateOrderStatus = (orderId: number, status: string) => {
  db.runSync("UPDATE orders SET status=? WHERE id=?", [status, orderId]);
};

export const deleteOrder = (orderId: number) => {
  db.runSync("DELETE FROM order_items WHERE orderId=?", [orderId]);
  db.runSync("DELETE FROM orders WHERE id=?", [orderId]);
};

// ========================== PROFILE ==========================
export const updateUserPassword = (id: number, newPassword: string) => {
  db.runSync("UPDATE users SET password=? WHERE id=?", [newPassword, id]);
};

export const updateUserProfile = (id: number, username: string, avatar: string | null) => {
  db.runSync("UPDATE users SET username=?, avatar=? WHERE id=?", [
    username,
    avatar,
    id,
  ]);
};

export const fetchOrdersByUser = (userId: number) => {
  return db.getAllSync("SELECT * FROM orders WHERE userId=? ORDER BY date DESC", [
    userId,
  ]);
};