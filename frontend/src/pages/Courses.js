import React, { useEffect, useState } from 'react';
import { getCourses } from '../api/courseService';
import CourseCard from '../components/CourseCard';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setError('⚠️ Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="courses-page">
      <h1 className="courses-title">📚 Available Courses</h1>

      {/* Optional: Filter UI could go here */}

      <div className="course-list">
        {courses.length === 0 ? (
          <div className="no-courses">No courses available at the moment.</div>
        ) : (
          courses.map((course) => <CourseCard key={course._id} course={course} />)
        )}
      </div>
    </div>
  );
};

export default Courses;
