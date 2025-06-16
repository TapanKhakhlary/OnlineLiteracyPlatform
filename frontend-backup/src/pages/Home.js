import { Link } from 'react-router-dom';
import './Home.scss';

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Enhance Your <span className="highlight">Literacy Skills</span>
          </h1>
          <p className="hero-subtitle">
            Join thousands of learners improving their reading and writing with our interactive
            platform
          </p>

          <div className="cta-buttons">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <svg
            className="hero-illustration"
            viewBox="0 0 600 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Blue background */}
            <rect width="600" height="400" fill="#4361ee" rx="16" />

            {/* Abstract shapes */}
            <circle cx="450" cy="100" r="60" fill="#3a0ca3" opacity="0.2" />
            <circle cx="500" cy="300" r="80" fill="#4cc9f0" opacity="0.2" />

            {/* Main illustration */}
            <g transform="translate(100, 80) scale(1.2)">
              {/* Person */}
              <circle cx="120" cy="70" r="30" fill="#fff" />
              <path d="M120,100 v60 l20,30 h-40 l20-30 v-60" fill="#f8f9fa" />

              {/* Book */}
              <rect x="180" y="70" width="100" height="140" fill="#fff" rx="5" />
              <rect x="185" y="75" width="90" height="130" fill="#3a0ca3" opacity="0.1" rx="3" />
              <line x1="230" y1="75" x2="230" y2="205" stroke="#fff" strokeWidth="2" />

              {/* Learning elements */}
              <path d="M50,150 q50,-30 100,0" stroke="#4cc9f0" strokeWidth="3" fill="none" />
              <path d="M50,170 q50,-20 100,0" stroke="#4cc9f0" strokeWidth="3" fill="none" />
              <circle cx="70" cy="120" r="8" fill="#fff" />
              <circle cx="200" cy="120" r="8" fill="#fff" />
            </g>
          </svg>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Our Platform</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: '📚',
    title: 'Personalized Learning',
    description: 'Adaptive content that matches your skill level and learning pace.',
  },
  {
    icon: '✍️',
    title: 'Interactive Exercises',
    description: 'Engaging activities to practice reading and writing in context.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    description: 'Visualize your improvement with detailed analytics.',
  },
];
