import React, { useState, useEffect } from "react";
import axios from "axios";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

const DutyReportGenerator = () => {
  const [examId, setExamId] = useState("");
  const [examList, setExamList] = useState([]);
  const [dutyData, setDutyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/v1/exam/exams-with-dates");
        setExamList(res.data);
      } catch (error) {
        console.error("Failed to load exams", error);
      }
    };
    fetchExams();
  }, []);

  const fetchDutyDetails = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/exam/user-selections-by-exam/${examId}`
      );
      setDutyData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching duty details", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = () => {
    if (dutyData.length === 0) return;
    setGenerating(true);

    try {
      // Group duties by user_name
      const grouped = dutyData.reduce((acc, curr) => {
        if (!acc[curr.user_name]) acc[curr.user_name] = [];
        acc[curr.user_name].push(curr);
        return acc;
      }, {});

      // Get exam name from the first duty record (all records will have the same exam_name)
      const examName = dutyData.length > 0 ? dutyData[0].exam_name : 'Unknown Exam';

      const content = [
        {
          text: "INVIGILATION DUTY FOR END SEM EXAMINATIONS",
          style: "title",
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
        {
          text: `Exam: ${examName} (ID: ${examId})`,
          style: "subheader",
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
      ];

      // Generate a table per faculty
      Object.entries(grouped).forEach(([name, duties]) => {
        // Get email from the first duty record for this faculty
        const facultyEmail = duties.length > 0 ? duties[0].email : '';
        const facultyDisplayName = facultyEmail ? `${name} (${facultyEmail})` : name;

        content.push(
          {
            style: "tableStyle",
            table: {
              headerRows: 2,
              widths: ["auto", "*", "*", "*", "*"],
              body: [
                // 👇 Name and email row as first row, spanning all 5 columns
                [
                  { text: facultyDisplayName, bold: true, colSpan: 5, alignment: "center", fillColor: "#f2f2f2" },
                  {}, {}, {}, {}
                ],
              // 👇 Table headers
              [
                { text: "S.No", bold: true },
                { text: "Department", bold: true },
                { text: "Exam Date", bold: true },
                { text: "Duty Type", bold: true },
                { text: "Session", bold: true },
              ],
              // 👇 Data rows
              ...duties.map((duty, i) => [
                i + 1,
                duty.department,
                new Date(duty.exam_date).toLocaleDateString("en-GB"),
                duty.duty_type,
                duty.session,
              ]),
            ],
          },
          layout: {
            hLineWidth: () => 0.8,
            vLineWidth: () => 0.8,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
        }
        
      );
    });
  
    content.push({
      columns: [
        {},
        {
          width: "auto",
          text: `Date: ${new Date().toLocaleDateString("en-GB")}\n\nPrincipal`,
          alignment: "right",
          margin: [0, 20, 0, 0],
        },
      ],
    });
  
    const docDefinition = {
      content,
      styles: {
        title: {
          fontSize: 15,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: false,
        },
        facultyHeader: {
          fontSize: 11,
          bold: true,
          decoration: "underline",
        },
        tableStyle: {
          margin: [0, 5, 0, 15],
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake.createPdf(docDefinition).download(`Duty_Report_${examId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };
  

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Report Generator
            </h2>
            <p className="text-emerald-100">Generate exam-wise invigilation reports</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Exam Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2-2V9a2 2 0 00-2-2h-3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Select Examination</h4>
            </div>

            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-gray-900"
            >
              <option value="">Choose an examination...</option>
              {examList.map((exam) => (
                <option key={exam.examId} value={exam.examId}>
                  {exam.examName} ({exam.examId})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={fetchDutyDetails}
              disabled={!examId || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>Load Duty Data</span>
                  </>
                )}
              </div>
            </button>

            {dutyData.length > 0 && (
              <button
                onClick={generatePdf}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Generate PDF Report</span>
                    </>
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Data Preview */}
          {dutyData.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Data Loaded</h4>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {dutyData.length} records
                </span>
              </div>
              <p className="text-gray-600">
                Successfully loaded duty data for {examId}. You can now generate the PDF report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutyReportGenerator;
