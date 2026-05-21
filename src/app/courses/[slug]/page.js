'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import RatingStars from '@/components/courses/RatingStars';
import CourseReviews from '@/components/courses/CourseReviews';
import PreviewModal from '@/components/courses/PreviewModal';
import { API_URL } from '@/lib/api';
import { 
  BookOpen, 
  Clock, 
  User, 
  PlayCircle, 
  FileText, 
  Check, 
  ChevronRight, 
  Star, 
  Users,
  Book
} from 'lucide-react';
import styles from './detail.module.css';

const MOCK_COURSE = {
  _id: '1', title: 'Loading...', slug: '',
  category: 'Loading...', description: '',
  shortDescription: '',
  totalDuration: '0 hours', totalLessons: 0, price: 0, accessType: 'free',
  rating: { average: 0, count: 0, sum: 0 },
  instructor: { name: 'VFXVault Team' },
  features: [],
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { api, user } = useAuth();
  const backendUrl = API_URL.replace('/api', '');

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  const [course, setCourse] = useState(MOCK_COURSE);
  const [modules, setModules] = useState([]);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [previewReviews, setPreviewReviews] = useState([]);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [openModules, setOpenModules] = useState({ m1: true });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewLessonId, setSelectedPreviewLessonId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/courses/${params.slug}`);
        if (data.course) {
          setCourse(data.course);
          setModules(data.modules || []);
          
          if (user) {
            const { data: progData } = await api.get('/progress/my-courses');
            const enrolled = progData.courses?.some(c => c.courseId === data.course._id);
            setIsEnrolled(enrolled);
          }
        }

        const { data: relatedData } = await api.get('/courses');
        setRelatedCourses(relatedData.courses?.filter(c => c.slug !== params.slug).slice(0, 3) || []);

        const { data: revData } = await api.get(`/courses/${params.slug}/reviews?mode=preview&limit=6`);
        if (revData && revData.items) {
          setPreviewReviews(revData.items);
          setReviewsHasMore(revData.hasMore);
        }

      } catch (err) { 
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.slug, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${params.slug}`);
      return;
    }

    if (isEnrolled) {
      router.push(`/courses/${course.slug}/learn`);
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/progress/enroll', { courseId: course._id });
      setIsEnrolled(true);
      router.push(`/courses/${course.slug}/learn`);
    } catch (err) {
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (id) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  if (!course || course.title === 'Loading...') {
    return null; // Let PublicWrapper's GlobalLoader handle it if needed, or just silent return
  }

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Floating Sidebar Card (Desktop) */}
        <div className={styles.floatingSidebarWrapper}>
          <div className={styles.stickySidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardImage}>
                {course.coverImage ? (
                  <img src={resolveImageUrl(course.coverImage)} alt={course.title} />
                ) : (
                  <span><BookOpen size={48} opacity={0.5} /></span>
                )}
                <div className={styles.imageOverlay} />
              </div>
              <div className={styles.sidebarCardBody}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div className={styles.sidebarPrice}>
                    {course.accessType === 'free' ? (
                      <span className={styles.sidebarFree}>Free</span>
                    ) : (
                      <span>${course.price}</span>
                    )}
                  </div>
                  
                  {/* Rating moved beside price */}
                  <div className={styles.sidebarRatingInline} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <RatingStars rating={course.rating?.average || 0} readOnly size="sm" />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {course.rating?.average || 0} ({course.rating?.count || 0})
                    </span>
                  </div>
                </div>
                
                <div className={styles.sidebarActions}>
                  <button 
                    onClick={handleEnroll} 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%' }}
                    disabled={enrolling}
                  >
                    {isEnrolled ? 'CONTINUE LEARNING' : (enrolling ? 'ENROLLING...' : (course.accessType === 'free' ? 'START LEARNING' : 'ENROLL NOW'))}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPreviewLessonId(null);
                      setIsPreviewOpen(true);
                    }}
                    className="btn btn-secondary" 
                    style={{ width: '100%', fontWeight: 700 }}
                  >
                    FREE PREVIEW
                  </button>
                </div>

                {(() => {
                  const displayFeatures = course.features && course.features.length > 0 
                  ? course.features.slice(0, 4) 
                  : [
                      '30 hours on-demand video',
                      'Full lifetime access',
                      'Access on mobile and desktop',
                      'Certificate of completion'
                    ];

                  return (
                    <div className={styles.sidebarInclusion}>
                      <h3 className={styles.sidebarSubTitle}>This course includes</h3>
                      <div className={styles.featureList}>
                        {displayFeatures.map((feature, idx) => (
                          <div key={idx} className={styles.featureItem}>
                            <Check size={16} className={styles.featureIcon} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.heroBreadcrumb}>
                <Link href="/courses">Courses</Link>
                <ChevronRight size={14} />
                <span>{course.category}</span>
              </div>
              <div className={styles.heroCategoryBadge}>{course.category}</div>
              <h1 className={styles.heroTitle}>{course.title}</h1>
              <p className={styles.heroDesc}>{course.shortDescription}</p>
              
              <div className={styles.heroMeta}>
                <div className={styles.heroRatingWrapper}>
                  <span className={styles.ratingScore}>{course.rating?.average || 0}</span>
                  <RatingStars rating={course.rating?.average || 0} readOnly />
                  <span className={styles.ratingCount}>({course.rating?.count || 0} ratings)</span>
                </div>
                <div className={styles.heroMetaLine}>
                  <span><Clock size={16} style={{ marginRight: 6 }} /> {course.totalDuration}</span>
                  <span><BookOpen size={16} style={{ marginRight: 6 }} /> {totalLessons} lessons</span>
                  <span><User size={16} style={{ marginRight: 6 }} /> {course.instructor?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className={styles.contentArea}>
          <div className={styles.mainContent}>
            {/* Description */}
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>
                About this <span className={styles.highlight}>course</span>
              </h2>
              <div className={styles.descriptionText}>
                {course.description?.split('\n').map((p, i) => (
                  <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>
                Course <span className={styles.highlight}>content</span>
              </h2>
              <div className={styles.curriculumStats}>
                <span>{modules.length} Chapters</span>
                <span>•</span>
                <span>{totalLessons} Lessons</span>
                <span>•</span>
                <span>{course.totalDuration} total length</span>
              </div>

              <div className={styles.curriculumList}>
                {modules.map((mod, idx) => (
                  <div key={mod._id} className={styles.moduleItem}>
                    <div className={styles.moduleHeader} onClick={() => toggleModule(mod._id)}>
                      <div className={styles.moduleTitle}>
                        <span className={`${styles.moduleToggleIcon} ${openModules[mod._id] ? styles.open : ''}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                        </span>
                        <span>{mod.title}</span>
                      </div>
                      <span className={styles.moduleMeta}>{mod.lessons?.length || 0} lessons</span>
                    </div>

                    {openModules[mod._id] && mod.lessons && (
                      <div className={styles.lessonList}>
                        {mod.lessons.map((lesson) => (
                          <div 
                            key={lesson._id} 
                            className={`${styles.lessonItem} ${lesson.isFreePreview ? styles.lessonPreviewable : ''}`}
                            onClick={() => {
                              if (lesson.isFreePreview) {
                                setSelectedPreviewLessonId(lesson._id);
                                setIsPreviewOpen(true);
                              }
                            }}
                          >
                            <span className={styles.lessonIcon}>
                              {lesson.type === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />}
                            </span>
                            <span className={styles.lessonTitle}>{lesson.title}</span>
                            {lesson.isFreePreview && <span className={styles.lessonFree}>Preview</span>}
                            <span className={styles.lessonDuration}>{lesson.videoDuration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionHeading}>Your Instructor</h2>
              <div className={styles.instructorProfile}>
                <div className={styles.instructorHeader}>
                  <div className={styles.instructorAvatarLarge}>
                    {course.instructor?.avatar ? (
                      <img src={resolveImageUrl(course.instructor.avatar)} alt={course.instructor.name} />
                    ) : <User size={48} />}
                  </div>
                  <div className={styles.instructorInfo}>
                    <h3 className={styles.instructorName}>{course.instructor?.name || 'VFXVault Team'}</h3>
                    <p className={styles.instructorTitle}>Expert Content Creator & Educator</p>
                    <div className={styles.instructorStats}>
                      <span><Star size={14} style={{ marginRight: 4 }} /> 4.9 Instructor Rating</span>
                      <span><Users size={14} style={{ marginRight: 4 }} /> 12,450 Students</span>
                      <span><BookOpen size={14} style={{ marginRight: 4 }} /> 12 Courses</span>
                    </div>
                  </div>
                </div>
                <div className={styles.instructorBio}>
                  <p>{course.instructor?.bio || 'Professional industry veteran dedicated to sharing knowledge and building the next generation of visual effects artists.'}</p>
                </div>
              </div>
            </div>

            {/* Course Reviews */}
            <CourseReviews 
              courseSlug={course.slug} 
              initialReviews={previewReviews} 
              initialSummary={course.rating} 
              initialHasMore={reviewsHasMore} 
            />

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className={styles.sectionBlock} style={{ marginTop: 'var(--space-12)' }}>
                <h2 className={styles.sectionHeading}>Other related courses</h2>
                <div className={styles.relatedGrid}>
                  {relatedCourses.map(rc => (
                    <Link key={rc._id} href={`/courses/${rc.slug}`} className={styles.relatedCard}>
                      <div className={styles.relatedEmoji}><Book size={24} opacity={0.5} /></div>
                      <div className={styles.relatedInfo}>
                        <h4 className={styles.relatedTitle}>{rc.title}</h4>
                        <p className={styles.relatedMeta}>{rc.category} • ${rc.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Spacer */}
          <div className={styles.sidebarSpacer} />
        </div>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedPreviewLessonId(null);
        }}
        courseTitle={course.title}
        modules={modules}
        initialLessonId={selectedPreviewLessonId}
      />
    </>
  );
}
