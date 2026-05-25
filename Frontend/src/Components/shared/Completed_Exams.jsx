import React, { useEffect, useState } from 'react';
import { examAPI } from '../../services/api';

const CompletedExamDates = () => {
  const [examDates, setExamDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedExamDates = async () => {
      try {
        const response = await examAPI.getCompletedExams();
        setExamDates(response.data.completedExamDates || []);
      } catch (err) {
        setError('Failed to fetch completed exam dates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedExamDates();
  }, []);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Completed Exam Dates</h2>
      {examDates.length === 0 ? (
        <p>No completed exam dates found.</p>
      ) : (
        <table className="w-full table-auto border border-collapse border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Exam ID</th>
              <th className="border px-4 py-2">Exam Date</th>
              <th className="border px-4 py-2">Session</th>
             
            </tr>
          </thead>
          <tbody>
            {examDates.map((exam) => (
              <tr key={exam.id}>
                <td className="border px-4 py-2">{exam.exam_id}</td>
                <td className="border px-4 py-2">
  {new Date(exam.exam_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</td>

                <td className="border px-4 py-2">{exam.session}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CompletedExamDates;
