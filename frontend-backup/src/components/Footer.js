import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaBookOpen,
  FaChalkboardTeacher,
  FaUserTie,
} from 'react-icons/fa';
import './Footer.scss';

const Footer = () => {
  // Social media links (replace with your actual URLs)
  const socialLinks = [
    { icon: <FaTwitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <FaFacebookF />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <FaLinkedinIn />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FaInstagram />, url: 'https://instagram.com', label: 'Instagram' },
  ];

  // Footer links data
  const footerLinks = [
    {
      title: 'Resources',
      icon: <FaBookOpen className="link-column-icon" />,
      links: [
        { name: 'Blog', path: '/blog' },
        { name: 'Tutorials', path: '/tutorials' },
        { name: 'Webinars', path: '/webinars' },
      ],
    },
    {
      title: 'Company',
      icon: <FaUserTie className="link-column-icon" />,
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Careers', path: '/careers' },
      ],
    },
    {
      title: 'Legal',
      icon: <FaChalkboardTeacher className="link-column-icon" />,
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Cookie Policy', path: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-heading">Online Literacy Platform</h2>
            <p className="footer-tagline">Empowering learners through accessible education.</p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.label} page`}
                  className="social-link"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links">
            {footerLinks.map((column, index) => (
              <div key={index} className="link-column">
                <h3 className="link-column-heading">
                  {column.icon}
                  {column.title}
                </h3>
                <ul className="link-list">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="link-item">
                      <Link to={link.path} className="footer-link" aria-label={link.name}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Online Literacy Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
