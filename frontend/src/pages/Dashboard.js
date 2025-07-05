import React from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import './Dashboard.scss';

export default function Dashboard() {
  const navigate = useNavigate();

  const courses = [
    { id: 1, title: 'Basic Grammar', progress: 75 },
    { id: 2, title: 'Reading Comprehension', progress: 40 },
  ];

  const activities = [
    'Continued “Reading Comprehension” 2 hours ago',
    'Completed quiz: “Tenses Basics”',
    'New message from your mentor',
  ];

  const achievements = [
    '🎓 Completed 3 Courses',
    '🔥 7-Day Learning Streak',
    '🏅 Top Scorer in Grammar Quiz',
  ];

  const upcoming = [
    '🗓 Webinar: Advanced Vocabulary - June 30',
    '📌 Quiz: Sentence Structure - Due July 2',
  ];

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome, tapan123!</p>

      <div className="dashboard-grid">
        <section className="dashboard-section courses">
          <h2>My Courses</h2>
          <div className="course-cards">
            {courses.map((course) => (
              <button
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <h3>{course.title}</h3>
                <div className="progress-bar">
                  <div style={{ width: `${course.progress}%` }} className="progress-fill" />
                </div>
                <p>
                  <CountUp end={course.progress} duration={1.2} />% Complete
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-section progress">
          <h2>Learning Progress</h2>
          <p>
            📚 Courses Completed: <CountUp end={3} duration={1.5} />
          </p>
          <p>
            ⏱ Time Spent: <CountUp end={8} duration={2} /> hrs this week
          </p>
        </section>

        <section className="dashboard-section activity">
          <h2>Recent Activity</h2>
          <ul>
            {activities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="dashboard-section achievements">
          <h2>Achievements</h2>
          <ul>
            {achievements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="dashboard-section schedule">
          <h2>Upcoming</h2>
          <ul>
            {upcoming.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
