import React, { useState, useEffect } from "react";
import { View, Text,  TouchableOpacity, ActivityIndicator, StyleSheet, Share } from "react-native";
import axios from "axios";
import { Picker } from '@react-native-picker/picker';
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { API_IP, API_PORT } from '@env';

const BASE_URL = `http://${API_IP}:${API_PORT}`;

const DutyReportGeneratorMobile = () => {
  const [examId, setExamId] = useState("");
  const [examList, setExamList] = useState([]);
  const [dutyData, setDutyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/v1/exam/exams-with-dates`)
      .then(res => setExamList(res.data))
      .catch(console.error);
  }, []);

  const fetchDutyDetails = () => {
    if (!examId) return;
    setLoading(true);
    axios.get(`${BASE_URL}/api/v1/exam/user-selections-by-exam/${examId}`)
      .then(res => setDutyData(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const generatePdf = async () => {
    if (dutyData.length === 0) return;
    setGenerating(true);

    // Group by user_name
    const grouped = dutyData.reduce((acc, cur) => {
      (acc[cur.user_name] = acc[cur.user_name] || []).push(cur);
      return acc;
    }, {});

    // Get exam name from the first duty record
    const examName = dutyData.length > 0 ? dutyData[0].exam_name : 'Unknown Exam';

    const htmlParts = [
      '<h1 style="text-align:center;">INVIGILATION DUTY FOR END SEM EXAMINATIONS</h1>',
      `<h3 style="text-align:center;">Exam: ${examName} (ID: ${examId})</h3>`
    ];

    for (const [name, duties] of Object.entries(grouped)) {
      // Get email from the first duty record for this faculty
      const facultyEmail = duties.length > 0 ? duties[0].email : '';
      const facultyDisplayName = facultyEmail ? `${name} (${facultyEmail})` : name;

      htmlParts.push(`<h2 style="text-align:center;background-color:#f2f2f2;padding:8px;margin:10px 0;">${facultyDisplayName}</h2><table border="1" style="width:100%;border-collapse:collapse;"><tr><th>S No</th><th>Dept</th><th>Date</th><th>Duty Type</th><th>Session</th></tr>`);
      duties.forEach((d, idx) => {
        htmlParts.push(`<tr><td>${idx+1}</td><td>${d.department}</td><td>${new Date(d.exam_date).toLocaleDateString("en-GB")}</td><td>${d.duty_type}</td><td>${d.session}</td></tr>`);
      });
      htmlParts.push(`</table><br/>`);
    }
    htmlParts.push(`<p style="text-align:right;">Date: ${new Date().toLocaleDateString("en-GB")}<br/>Principal</p>`);

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlParts.join(""),
        base64: false,
      });

      await Share.share({
        url: uri,
        title: `Duty_Report_${examId}.pdf`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Generator</Text>
      <Text style={styles.subheader}>Generate exam-wise invigilation reports</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={examId}
          onValueChange={setExamId}
          style={styles.picker}
        >
          <Picker.Item label="Choose exam..." value="" />
          {examList.map(ex => (
            <Picker.Item key={ex.examId} label={`${ex.examName} (${ex.examId})`} value={ex.examId} />
          ))}
        </Picker>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={fetchDutyDetails}
          disabled={!examId || loading}
          style={[styles.button, styles.loadBtn, (!examId || loading) && styles.btnDisabled]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Load Duty Data</Text>}
        </TouchableOpacity>

        {dutyData.length > 0 && (
          <TouchableOpacity
            onPress={generatePdf}
            disabled={generating}
            style={[styles.button, styles.genBtn, generating && styles.btnDisabled]}
          >
            {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate PDF</Text>}
          </TouchableOpacity>
        )}
      </View>

      {dutyData.length > 0 && (
        <Text style={styles.loadedText}>{dutyData.length} records loaded</Text>
      )}
    </View>
  );
};

export default DutyReportGeneratorMobile;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12, margin: 16 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#111827' },
  subheader: { fontSize: 14, color: '#4b5563', marginBottom: 16 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 16 },
  picker: { height: 50, width: '100%' },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  loadBtn: { backgroundColor: '#2563eb' },
  genBtn: { backgroundColor: '#059669' },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadedText: { fontSize: 14, color: '#065f46', marginTop: 8 },
});
