import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";

type Student = {
  id: number;
  name: string;
  age: number;
  grade: number;
};

const StudentManager = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Phong", age: 20, grade: 9.2 },
    { id: 2, name: "Linh", age: 17, grade: 7.5 },
    { id: 3, name: "Nam", age: 19, grade: 8.3 },
    { id: 4, name: "Hà", age: 21, grade: 9.8 },
    { id: 5, name: "Duy", age: 18, grade: 6.9 },
  ]);

  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [filterType, setFilterType] = useState<"all" | "age" | "grade" | "name">("all");

  // 🔹 Thêm học sinh
  const addStudent = () => {
    if (!newName || !newAge || !newGrade) return;
    const newStudent: Student = {
      id: students.length + 1,
      name: newName,
      age: parseInt(newAge),
      grade: parseFloat(newGrade),
    };
    setStudents([...students, newStudent]);
    setNewName("");
    setNewAge("");
    setNewGrade("");
  };

  // 🔹 Sửa thông tin học sinh
  const updateStudent = (id: number, updatedName: string, updatedGrade: number) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, name: updatedName, grade: updatedGrade } : s
    );
    setStudents(updated);
  };

  // 🔹 Xóa học sinh
  const deleteStudent = (id: number) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  // 🔹 Lọc học sinh
  const filterStudents = () => {
    switch (filterType) {
      case "age":
        return students.filter((s) => s.age > 18);
      case "grade":
        return students.filter((s) => s.grade > 8);
      case "name":
        return students.filter((s) => s.name.toLowerCase().includes("h"));
      default:
        return students;
    }
  };

  // 🔹 Sắp xếp theo điểm giảm dần
  const sortByGrade = () => {
    setStudents([...students].sort((a, b) => b.grade - a.grade));
  };

  // 🔹 Đếm học sinh có điểm trên 8
  const countHighGrade = students.filter((s) => s.grade > 8).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Quản lý Danh Sách Học Sinh</Text>

      {/* Nhập thông tin thêm học sinh */}
      <TextInput
        style={styles.input}
        placeholder="Tên học sinh"
        value={newName}
        onChangeText={setNewName}
      />
      <TextInput
        style={styles.input}
        placeholder="Tuổi"
        value={newAge}
        keyboardType="numeric"
        onChangeText={setNewAge}
      />
      <TextInput
        style={styles.input}
        placeholder="Điểm"
        value={newGrade}
        keyboardType="numeric"
        onChangeText={setNewGrade}
      />
      <Button title="➕ Thêm học sinh" onPress={addStudent} />

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
        <Button title="Lọc theo tuổi >18" onPress={() => setFilterType("age")} />
        <Button title="Lọc điểm >8" onPress={() => setFilterType("grade")} />
        <Button title="Lọc theo tên có 'h'" onPress={() => setFilterType("name")} />
      </View>

      <Button title="Sắp xếp theo điểm" onPress={sortByGrade} />

      <Text style={styles.count}>Số học sinh có điểm > 8: {countHighGrade}</Text>

      {/* Danh sách học sinh */}
      <FlatList
        data={filterStudents()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <Text style={styles.studentText}>
              ID: {item.id} | {item.name} | Tuổi: {item.age} | Điểm: {item.grade}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Sửa" onPress={() => updateStudent(item.id, item.name + "✅", item.grade + 0.1)} />
              <Button title="Xóa" color="red" onPress={() => deleteStudent(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default StudentManager;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 5,
    borderRadius: 8,
  },
  studentItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  studentText: { fontSize: 16, marginBottom: 5 },
  count: { textAlign: "center", marginVertical: 10, fontWeight: "bold", fontSize: 16 },
});
