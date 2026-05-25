import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Ionicons, Feather } from "@expo/vector-icons";
import { API_IP, API_PORT } from '@env';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const API_URL = `${BASE_URL}/api/v1/users`;

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", department: "", role: "faculty" });

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [searchTerm, roleFilter, facultyList]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setFacultyList(res.data.data);
      setFilteredFaculty(res.data.data);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error fetching data" });
    } finally {
      setLoading(false);
    }
  };

  const filterFaculty = () => {
    let result = facultyList;

    if (searchTerm) {
      result = result.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((f) => f.role === roleFilter);
    }

    setFilteredFaculty(result);
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Delete Faculty",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/${id}`);
              Toast.show({ type: "success", text1: "Deleted successfully" });
              fetchFaculty();
            } catch (error) {
              Toast.show({ type: "error", text1: "Delete failed" });
            }
          },
        },
      ]
    );
  };

  const openEditModal = (faculty) => {
    setSelectedFaculty(faculty);
    setEditData(faculty);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/${selectedFaculty.id}`, editData);
      Toast.show({ type: "success", text1: "Updated successfully" });
      setModalVisible(false);
      fetchFaculty();
    } catch (err) {
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  const renderFaculty = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>Email: {item.email}</Text>
      <Text style={styles.meta}>Phone: {item.phone || "N/A"}</Text>
      <Text style={styles.meta}>Dept: {item.department || "N/A"}</Text>
      <Text style={styles.role}>{item.role.toUpperCase()}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
          <Feather name="edit" size={20} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
          <Feather name="trash-2" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Toast />

      <Text style={styles.header}>Manage Faculty</Text>

      {/* Search */}
      <TextInput
        placeholder="Search by name, email, or department..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.input}
      />

      {/* Filter */}
      <View style={styles.filterRow}>
        {["all", "faculty", "admin"].map((role) => (
          <TouchableOpacity key={role} onPress={() => setRoleFilter(role)}>
            <Text style={[styles.filterBtn, roleFilter === role && styles.activeFilter]}>{role.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={filteredFaculty}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFaculty}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Faculty</Text>
            {["name", "email", "phone", "department"].map((field) => (
              <TextInput
                key={field}
                placeholder={field}
                value={editData[field]}
                onChangeText={(text) => setEditData({ ...editData, [field]: text })}
                style={styles.input}
              />
            ))}
            <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "gray", marginTop: 10, textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageFaculty;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  filterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  filterBtn: { padding: 8, color: "gray" },
  activeFilter: { fontWeight: "bold", color: "blue" },
  card: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 1,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  meta: { fontSize: 13, color: "#555" },
  role: { marginTop: 4, fontWeight: "bold", color: "#888" },
  actions: { flexDirection: "row", marginTop: 10 },
  actionBtn: { marginRight: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
