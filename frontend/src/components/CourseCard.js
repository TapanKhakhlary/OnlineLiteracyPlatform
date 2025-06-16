import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.scss';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <Link to={`/courses/${course._id}`}>
        <img src={course.thumbnail} alt={course.title} />
        <h3>{course.title}</h3>
        <p>{course.description.substring(0, 100)}...</p>
        <div className="course-meta">
          <span>{course.category}</span>
          <span>{course.lessons?.length || 0} lessons</span>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
