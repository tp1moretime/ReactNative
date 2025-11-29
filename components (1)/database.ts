
// ========================== IMPORT ==========================
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// ========================== OPEN DB ==========================
const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('myDatabase.db');
  }
  return db;
};

// ========================== TYPES ==========================
export type Category = { id: number; name: string };
export type Product = { id: number; name: string; price: number; img: string; categoryId: number };
export type User = { id: number; username: string; password: string; role: 'admin' | 'user' };

// ========================== DATA ==========================
const initialCategories: Category[] = [
  { id: 1, name: "Áo" }, { id: 2, name: "Giày" }, { id: 3, name: "Balo" },
  { id: 4, name: "Mũ" }, { id: 5, name: "Túi" },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Áo sơ mi trắng', price: 250000, img: 'ao1.jpg', categoryId: 1 },
  { id: 2, name: 'Áo thun nam', price: 180000, img: 'ao2.jpg', categoryId: 1 },
  { id: 3, name: 'Áo khoác gió', price: 450000, img: 'ao3.jpg', categoryId: 1 },
  { id: 4, name: 'Áo polo', price: 320000, img: 'ao4.jpg', categoryId: 1 },
  { id: 5, name: 'Áo len', price: 380000, img: 'ao5.jpg', categoryId: 1 },
  { id: 6, name: 'Áo hoodie', price: 420000, img: 'ao6.jpg', categoryId: 1 },
  { id: 7, name: 'Giày sneaker', price: 1100000, img: 'giay1.jpg', categoryId: 2 },
{ id: 8, name: 'Giày thể thao', price: 950000, img: 'giay2.jpg', categoryId: 2 },
  { id: 9, name: 'Giày cao gót', price: 650000, img: 'giay3.jpg', categoryId: 2 },
  { id: 10, name: 'Giày búp bê', price: 480000, img: 'giay4.jpg', categoryId: 2 },
  { id: 11, name: 'Giày boot', price: 1200000, img: 'giay5.jpg', categoryId: 2 },
  { id: 12, name: 'Giày sandal', price: 350000, img: 'giay6.jpg', categoryId: 2 },
  { id: 13, name: 'Balo thời trang', price: 490000, img: 'balo1.jpg', categoryId: 3 },
  { id: 14, name: 'Balo laptop', price: 550000, img: 'balo2.jpg', categoryId: 3 },
  { id: 15, name: 'Balo du lịch', price: 680000, img: 'balo3.jpg', categoryId: 3 },
  { id: 16, name: 'Balo thể thao', price: 420000, img: 'balo4.jpg', categoryId: 3 },
  { id: 17, name: 'Balo học sinh', price: 380000, img: 'balo5.jpg', categoryId: 3 },
  { id: 18, name: 'Balo mini', price: 320000, img: 'balo6.jpg', categoryId: 3 },
  { id: 19, name: 'Mũ lưỡi trai', price: 120000, img: 'mu1.jpg', categoryId: 4 },
  { id: 20, name: 'Mũ bucket', price: 150000, img: 'mu2.jpg', categoryId: 4 },
  { id: 21, name: 'Mũ snapback', price: 180000, img: 'mu3.jpg', categoryId: 4 },
  { id: 22, name: 'Mũ len', price: 200000, img: 'mu4.jpg', categoryId: 4 },
  { id: 23, name: 'Mũ rộng vành', price: 250000, img: 'mu5.jpg', categoryId: 4 },
  { id: 24, name: 'Mũ beanie', price: 100000, img: 'mu6.jpg', categoryId: 4 },
  { id: 25, name: 'Túi xách nữ', price: 980000, img: 'tui1.jpg', categoryId: 5 },
  { id: 26, name: 'Túi đeo chéo', price: 450000, img: 'tui2.jpg', categoryId: 5 },
  { id: 27, name: 'Túi tote', price: 380000, img: 'tui3.jpg', categoryId: 5 },
  { id: 28, name: 'Túi mini', price: 320000, img: 'tui4.jpg', categoryId: 5 },
  { id: 29, name: 'Túi da', price: 1200000, img: 'tui5.jpg', categoryId: 5 },
  { id: 30, name: 'Túi vải', price: 250000, img: 'tui6.jpg', categoryId: 5 },
];

// ========================== INIT DB ==========================
export const initDatabase = async (onSuccess?: () => void) => {
  try {
    const db = await getDb();

    await db.execAsync(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT);`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      img TEXT,
      categoryId INTEGER
    );`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );`);


    // Insert categories
    for (const c of initialCategories) {
      await db.runAsync(
        "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
        [c.id, c.name]
      );
    }

    // Insert products
    for (const p of initialProducts) {
      await db.runAsync(
        "INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)",
        [p.id, p.name, p.price, p.img, p.categoryId]
      );
    }
// Admin default
    await db.runAsync(`
      INSERT INTO users (username, password, role)
      SELECT 'admin', '123456', 'admin'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');
    `);

    onSuccess?.();
    console.log("✅ Database initialized on Expo Go");
  } catch (err) {
    console.error("❌ initDatabase error:", err);
  }
};

// ========================== FETCH FUNCTIONS ==========================
export const fetchCategories = async (): Promise<Category[]> => {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM categories");
};

export const fetchProducts = async (): Promise<Product[]> => {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM products");
};

export const fetchProductsByCategory = async (categoryId: number) => {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM products WHERE categoryId = ?", [categoryId]);
};

// ========================== CRUD: PRODUCTS ==========================
export const addProduct = async (p: Omit<Product, "id">) => {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)",
    [p.name, p.price, p.img, p.categoryId]
  );
};

export const updateProduct = async (p: Product) => {
  const db = await getDb();
  await db.runAsync(
    "UPDATE products SET name=?, price=?, img=?, categoryId=? WHERE id=?",
    [p.name, p.price, p.img, p.categoryId, p.id]
  );
};

export const deleteProduct = async (id: number) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM products WHERE id=?", [id]);
};

// ========================== SEARCH ==========================
export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  const db = await getDb();
  return await db.getAllAsync(
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
export const filterProducts = async (name?: string, min?: number, max?: number): Promise<Product[]> => {
  const db = await getDb();

  let query = "SELECT * FROM products WHERE 1=1";
  const params: any[] = [];

  if (name) {
    query += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (min != null) {
    query += " AND price >= ?";
    params.push(min);
  }
  if (max != null) {
    query += " AND price <= ?";
    params.push(max);
  }

  return db.getAllAsync(query, params);
};

// ========================== USERS ==========================
export const addUser = async (username: string, password: string, role = "user") => {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role]
  );
};

export const loginUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  const db = await getDb();
  const result = await db.getFirstAsync(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password]
  );

  return result ? (result as User) : null;
};

export const fetchUsers = async (): Promise<User[]> => {
  const db = await getDb();
  return await db.getAllAsync("SELECT * FROM users ORDER BY id");
};

export const updateUserRole = async (id: number, role: string) => {
  const db = await getDb();
  await db.runAsync("UPDATE users SET role=? WHERE id=?", [role, id]);
};

export const deleteUser = async (id: number) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM users WHERE id=?", [id]);
};
// ========================== CATEGORIES ==========================
// export const addCategory = async (name: string) => {
//   const db = await getDb();
//   const result = await db.getFirstAsync("SELECT MAX(id) as maxId FROM categories");
//   const maxId = result?.maxId ?? 0;
//   await db.runAsync("INSERT INTO categories (id, name) VALUES (?, ?)", [maxId + 1, name]);
// };
export const addCategory = async (name: string) => {
  const db = await getDb();
  type MaxIdResult = { maxId: number | null };
  const result = await db.getFirstAsync("SELECT MAX(id) as maxId FROM categories") as MaxIdResult;
  const maxId = result?.maxId ?? 0;
  await db.runAsync("INSERT INTO categories (id, name) VALUES (?, ?)", [maxId + 1, name]);
};

export const updateCategory = async (id: number, name: string) => {
  const db = await getDb();
  await db.runAsync("UPDATE categories SET name=? WHERE id=?", [name, id]);
};
export const deleteCategory = async (id: number) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM products WHERE categoryId=?", [id]);
  await db.runAsync("DELETE FROM categories WHERE id=?", [id]);
};