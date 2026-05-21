'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Search, Clock, BookOpen } from 'lucide-react';
import { API_URL } from '@/lib/api';
import styles from './courses.module.css';

const CATEGORIES = ['All', 'Game Development', 'Computer Science', 'Programming Languages', 'Computer Graphics', 'VFX & Motion', 'Electronics', 'Mathematics'];

const MOCK_COURSES = [
  { _id: '1', title: '3D Rendering Pipeline from Scratch', slug: '3d-rendering-pipeline', category: 'Computer Graphics', shortDescription: 'Learn how a 3D rendering engine works from the ground up using C++ and linear algebra.', totalDuration: '30 hours', price: 79.99, accessType: 'premium', emoji: '🎮', rating: { average: 4.8, count: 120 } },
  { _id: '2', title: 'Introduction to VFX Compositing', slug: 'intro-vfx-compositing', category: 'VFX & Motion', shortDescription: 'Master the fundamentals of visual effects compositing with industry-standard techniques.', totalDuration: '18 hours', price: 0, accessType: 'free', emoji: '🎬', rating: { average: 4.6, count: 85 } },
  { _id: '3', title: 'Build a 2D Game Engine with C++', slug: 'build-2d-game-engine', category: 'Game Development', shortDescription: 'Create a complete 2D game engine from scratch using modern C++, SDL, ECS, and Lua scripting.', totalDuration: '25 hours', price: 89.99, accessType: 'premium', emoji: '🕹️', rating: { average: 4.9, count: 200 } },
  { _id: '4', title: 'Data Structures & Algorithms', slug: 'data-structures-algorithms', category: 'Computer Science', shortDescription: 'Deep dive into essential data structures and algorithms with visualizations and hands-on coding.', totalDuration: '22 hours', price: 69.99, accessType: 'premium', emoji: '🧮', rating: { average: 4.7, count: 150 } },
  { _id: '5', title: 'Learn Python from Scratch', slug: 'learn-python', category: 'Programming Languages', shortDescription: 'A beginner-friendly introduction to Python programming with practical projects and exercises.', totalDuration: '15 hours', price: 0, accessType: 'free', emoji: '🐍', rating: { average: 4.5, count: 310 } },
  { _id: '6', title: 'Digital Electronics & Computer Architecture', slug: 'digital-electronics', category: 'Electronics', shortDescription: 'Build a computer from scratch — from transistors and logic gates to a working CPU.', totalDuration: '30 hours', price: 89.99, accessType: 'premium', emoji: '⚡', rating: { average: 5.0, count: 95 } },
  { _id: '7', title: 'Linear Algebra for Game Developers', slug: 'linear-algebra-gamedev', category: 'Mathematics', shortDescription: 'Master vectors, matrices, and transformations used in games and computer graphics.', totalDuration: '12 hours', price: 49.99, accessType: 'premium', emoji: '📐', rating: { average: 4.8, count: 78 } },
  { _id: '8', title: 'NES Programming with 6502 Assembly', slug: 'nes-6502-assembly', category: 'Game Development', shortDescription: 'Learn 6502 Assembly programming to build games for the Nintendo Entertainment System.', totalDuration: '25 hours', price: 79.99, accessType: 'premium', emoji: '🎮', rating: { average: 4.9, count: 65 } },
  { _id: '9', title: 'Motion Graphics Fundamentals', slug: 'motion-graphics', category: 'VFX & Motion', shortDescription: 'Create stunning motion graphics from basic principles to advanced animation techniques.', totalDuration: '20 hours', price: 0, accessType: 'free', emoji: '✨', rating: { average: 4.4, count: 112 } },
];

function CoursesContent() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { api } = useAuth();
  const backendUrl = API_URL.replace('/api', '');

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  // Try to fetch from API, fallback to mock
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = {};
        if (activeCategory !== 'All') params.category = activeCategory;
        if (searchQuery) params.search = searchQuery;
        params.sort = sortBy;

        const { data } = await api.get('/courses', { params });
        if (data.courses && data.courses.length > 0) {
          setCourses(data.courses);
        }
      } catch (err) {
        // Use mock data on error
      }
    };
    fetchCourses();
  }, [activeCategory, sortBy]);

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
        <div className="container">
          <div className={styles.coursesPage}>
            {/* Header */}
            <div className={styles.coursesHeader}>
              <h1 className={styles.coursesTitle}>
                All <span className="text-gold">Courses</span>
              </h1>
              <p className={styles.coursesSubtitle}>
                Explore our catalog of structured, video-based courses
              </p>
            </div>

            {/* Filters */}
            <div className={styles.filtersBar}>
              <div className={styles.filterPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterPill} ${activeCategory === cat ? styles.filterPillActive : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div className={styles.searchBox}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="course-search-input"
                  />
                </div>

                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  id="course-sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
              <div className={styles.coursesGrid}>
                {filteredCourses.map((course) => (
                  <Link
                    href={`/courses/${course.slug}`}
                    key={course._id}
                    className={styles.courseCard}
                  >
                    <div className={styles.courseImage}>
                      {course.coverImage ? (
                        <img src={resolveImageUrl(course.coverImage)} alt={course.title} />
                      ) : (
                        <div className={styles.courseIconFallback}><BookOpen size={40} opacity={0.3} /></div>
                      )}
                      <div className={styles.courseBadge}>
                        <span className={`badge ${course.accessType === 'free' ? 'badge-free' : 'badge-premium'}`}>
                          {course.accessType === 'free' ? 'FREE' : 'PREMIUM'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.courseBody}>
                      <p className={styles.courseCategory}>{course.category}</p>
                      <h3 className={styles.courseTitle}>{course.title}</h3>
                      <p className={styles.courseDesc}>{course.shortDescription}</p>
                      <div className={styles.courseMeta}>
                        <span className={styles.courseDuration}><Clock size={14} style={{ marginRight: 6 }} /> {course.totalDuration}</span>
                        {course.accessType === 'free' ? (
                          <span className={styles.courseFree}>Free</span>
                        ) : (
                          <span className={styles.coursePrice}>${course.price}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.courseViewMore}>View More</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Search size={48} opacity={0.2} /></div>
                <h3 className={styles.emptyTitle}>No courses found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
    </>
  );
}

export default function CoursesPage() {
  return <CoursesContent />;
}
