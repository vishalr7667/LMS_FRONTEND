'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { API_URL } from '@/lib/api';
import {
  Video,
  BookOpen,
  BarChart3,
  MessageCircle,
  Package,
  Unlock,
  Sparkles,
  PlayCircle,
  Clock,
  Gamepad2,
  Clapperboard,
  Monitor,
  Code,
  Book,
  Play
} from 'lucide-react';
import styles from './home.module.css';

const FEATURES = [
  { icon: <Video size={24} />, title: 'Video-First Learning', desc: 'High-quality video lessons with smooth streaming, resume playback, and speed controls.' },
  { icon: <BookOpen size={24} />, title: 'Structured Courses', desc: 'Clear hierarchy of courses, modules, and lessons for an organized learning path.' },
  { icon: <BarChart3 size={24} />, title: 'Track Your Progress', desc: 'Visual progress indicators, checkmarks, and the ability to resume where you left off.' },
  { icon: <MessageCircle size={24} />, title: 'Discussion & Q&A', desc: 'Ask questions and engage with other learners under each lesson.' },
  { icon: <Package size={24} />, title: 'Downloadable Assets', desc: 'Access project files, PDFs, source code, and other resources to practice.' },
  { icon: <Unlock size={24} />, title: 'Free & Premium Content', desc: 'Explore free courses or unlock premium content with a subscription.' },
];

export default function HomePage() {
  const { api } = useAuth();
  const backendUrl = API_URL.replace('/api', '');

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalLessons: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, statsRes] = await Promise.all([
          api.get('/courses/featured'),
          api.get('/courses/stats'),
        ]);
        setFeaturedCourses(featuredRes.data.courses);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <>
      {/* ============ HERO ============ */}
        <section className={styles.heroSection} id="hero">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}><Sparkles size={14} style={{ marginRight: 6 }} /> Start Learning Today</div>
              <h1 className={styles.heroTitle}>
                Master the Art of{' '}
                <span className={styles.heroTitleGold}>Digital Creation</span>
              </h1>
              <p className={styles.heroDescription}>
                Structured, video-based courses in VFX, game development, and computer science.
                Learn at your own pace from industry professionals.
              </p>
              <div className={styles.heroActions}>
                <Link href="/courses" className="btn btn-primary btn-lg" id="hero-browse-btn">
                  Browse Courses
                </Link>
                <Link href="/auth/register" className="btn btn-secondary btn-lg" id="hero-signup-btn">
                  Free Preview
                </Link>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNumber}>{stats.totalCourses}+</div>
                  <div className={styles.heroStatLabel}>Courses</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNumber}>{stats.totalLessons}+</div>
                  <div className={styles.heroStatLabel}>Video Lessons</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNumber}>{stats.totalStudents}+</div>
                  <div className={styles.heroStatLabel}>Students</div>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Link 
                href={featuredCourses[0] ? `/courses/${featuredCourses[0].slug}/learn` : '/courses'} 
                className={styles.heroCard}
              >
                <div className={styles.heroCardPlayer}>
                  <div className={styles.playButton}><Play size={20} fill="currentColor" /></div>
                </div>
                <div className={styles.heroCardContent}>
                  <div className={styles.heroCardTitle}>
                    {featuredCourses[0] ? `${featuredCourses[0].title} — Lesson 1` : '3D Rendering Pipeline — Lesson 14'}
                  </div>
                  <div className={styles.heroCardMeta}>
                    <span><Clock size={12} style={{ marginRight: 4 }} /> {featuredCourses[0]?.totalDuration || '22:03'}</span>
                    <span><Book size={12} style={{ marginRight: 4 }} /> {featuredCourses[0]?.category || 'Matrices Overview'}</span>
                  </div>
                  <div className={styles.heroCardProgress}>
                    <div className={styles.heroCardProgressBar} />
                  </div>
                </div>
              </Link>

              <Link 
                href={featuredCourses[0] ? `/courses/${featuredCourses[0].slug}/learn` : '/courses'} 
                className={styles.heroCardSecondary}
              >
                <div className={styles.heroCardSecondaryIcon}>
                  <Sparkles size={20} />
                </div>
                <div className={styles.heroCardSecondaryInfo}>
                  <div className={styles.heroCardSecondaryTitle}>
                    {featuredCourses[0] ? 'Continue Learning' : 'Certificate Earned'}
                  </div>
                  <div className={styles.heroCardSecondaryText}>
                    {featuredCourses[0] ? featuredCourses[0].title : 'Advanced VFX Compositing'}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section className={styles.featuresSection} id="features">
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className={styles.sectionSubtitle}>Why VFXVault Education?</p>
              <h2 className={styles.sectionTitle}>Everything You Need to Learn</h2>
              <p className={styles.sectionDescription}>
                A complete learning platform built for visual creators and developers
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className={`${styles.featureCard} animate-fade-in-up animate-delay-${i % 4 + 1}`}
                >
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURED COURSES ============ */}
        <section className={styles.coursesSection} id="featured-courses">
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className={styles.sectionSubtitle}>Featured Courses</p>
              <h2 className={styles.sectionTitle}>Start Your Learning Journey</h2>
              <p className={styles.sectionDescription}>
                Handpicked courses to help you master digital creation skills
              </p>
            </div>

            {loading ? (
              <div className={styles.coursesGrid}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.courseCardSkeleton}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonBody}>
                      <div className={styles.skeletonLine} style={{ width: '40%' }} />
                      <div className={styles.skeletonLine} style={{ width: '80%' }} />
                      <div className={styles.skeletonLine} style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredCourses.length > 0 ? (
              <div className={styles.coursesGrid}>
                {featuredCourses.map((course) => (
                  <Link href={`/courses/${course.slug}`} key={course._id} className={styles.courseCard}>
                    <div className={styles.courseImage}>
                      {course.coverImage ? (
                        <img src={resolveImageUrl(course.coverImage)} alt={course.title} />
                      ) : (
                        <div className={styles.courseIconFallback}>
                          {course.category === 'Computer Graphics' ? <Monitor size={48} /> :
                            course.category === 'VFX & Motion' ? <Clapperboard size={48} /> :
                              course.category === 'Game Development' ? <Gamepad2 size={48} /> :
                                course.category === 'Computer Science' ? <Monitor size={48} /> :
                                  course.category === 'Programming Languages' ? <Code size={48} /> :
                                    <Book size={48} />}
                        </div>
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
                      <p className={styles.courseDesc}>{course.shortDescription || course.description}</p>
                      <div className={styles.courseMeta}>
                        <span className={styles.courseDuration}><Clock size={14} style={{ marginRight: 6 }} /> {course.totalDuration}</span>
                        <span className={course.accessType === 'free' ? styles.coursesFreeLabel : styles.coursePrice}>
                          {course.accessType === 'free' ? 'Free' : `$${course.price}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No featured courses yet. Check back soon!</p>
              </div>
            )}

            <div className={styles.coursesViewAll}>
              <Link href="/courses" className="btn btn-dark btn-lg" id="view-all-courses-btn">
                View All Courses
              </Link>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className={styles.howSection} id="how-it-works">
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className={styles.sectionSubtitle}>How It Works</p>
              <h2 className={styles.sectionTitle}>Three Simple Steps</h2>
            </div>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>Browse & Choose</h3>
                <p className={styles.stepDesc}>
                  Explore our catalog of structured courses across VFX, game development, and more.
                </p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>Watch & Learn</h3>
                <p className={styles.stepDesc}>
                  Stream high-quality video lessons at your own pace with resume and progress tracking.
                </p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>Practice & Master</h3>
                <p className={styles.stepDesc}>
                  Download resources, complete exercises, and engage with the community to solidify your skills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className={styles.ctaSection} id="cta">
          <div className="container">
            <h2 className={styles.ctaTitle}>Ready to Start Learning?</h2>
            <p className={styles.ctaDesc}>
              Join thousands of students mastering digital creation. Start with free courses today.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link href="/courses" className="btn btn-secondary btn-lg">
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
    </>
  );
}
