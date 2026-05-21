'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LockedLesson from '@/components/courses/LockedLesson';
import CommentSection from '@/components/courses/comments/CommentSection';
import dynamic from 'next/dynamic';
import styles from './learn.module.css';

import YouTubePlayer from 'react-player/youtube';
import VimeoPlayer from 'react-player/vimeo';
import { MessageSquare, X, Menu, LayoutList } from 'lucide-react';
export default function LearnClient({ course, modules, initialLesson, userProgress, hasFullAccess }) {
  const params = useParams();
  const { api } = useAuth();

  const [activeLesson, setActiveLesson] = useState(initialLesson);

  // Sync activeLesson if the server passes a new initialLesson during client navigation
  useEffect(() => {
    if (initialLesson) {
      setActiveLesson(initialLesson);
    }
  }, [initialLesson?._id]);

  const [completedLessons, setCompletedLessons] = useState(userProgress?.completedLessons || []);
  const [openModules, setOpenModules] = useState({});
  const [activeTab, setActiveTab] = useState('resources');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Discussion Panel State
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [discussionWidth, setDiscussionWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  // Set client flag after mount to avoid SSR hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const playerRef = useRef(null);

  // Calculate proper seek time synchronously when client loads
  const getInitialTime = () => {
    if (!isClient || !activeLesson?._id) return 0;
    const localTime = localStorage.getItem(`vid_progress_${activeLesson._id}`);
    const dbTime = (userProgress?.lastLessonId === activeLesson._id)
      ? userProgress.lastVideoTimestamp
      : 0;
    return Math.floor(parseFloat(localTime) || dbTime || 0);
  };


  // Save Progress Logic
  const saveToDB = async (time) => {
    if (!activeLesson?._id || !time) return;
    try {
      await api.put('/progress/video-timestamp', {
        courseId: course._id,
        lessonId: activeLesson._id,
        timestamp: Math.floor(time)
      });
    } catch (err) {
      console.error('Failed to save progress to DB:', err);
    }
  };

  const handleProgress = (state) => {
    if (!activeLesson?._id) return;
    // Save to local storage frequently (cheap)
    localStorage.setItem(`vid_progress_${activeLesson._id}`, state.playedSeconds);
  };

  const handlePause = () => {
    const time = playerRef?.current?.getCurrentTime() || 0;
    saveToDB(time);
  };

  // Resize Logic
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 320 && newWidth < window.innerWidth * 0.8) {
        setDiscussionWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // Save progress when user leaves the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const time = playerRef?.current?.getCurrentTime() || 0;
        if (time > 1) saveToDB(time);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeLesson?._id]);


  // Initialize open modules
  useEffect(() => {
    if (modules && modules.length > 0) {
      const initialOpen = {};
      modules.forEach(m => {
        if (m.lessons?.some(l => l._id === activeLesson?._id)) {
          initialOpen[m._id] = true;
        }
      });
      setOpenModules(initialOpen);
    }
  }, [modules, activeLesson?._id]);

  const allLessons = modules.flatMap(m => m.lessons || []);
  const completionPercent = allLessons.length > 0
    ? Math.round((completedLessons.length / allLessons.length) * 100)
    : 0;
  const currentIndex = allLessons.findIndex(l => l._id === activeLesson?._id);

  const toggleModule = (id) => setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
  };

  const markComplete = async () => {
    if (!activeLesson || completedLessons.includes(activeLesson._id) || isMarkingComplete) return;

    setIsMarkingComplete(true);
    try {
      const { data } = await api.post('/progress/complete', {
        courseId: course._id,
        lessonId: activeLesson._id
      });
      if (data.success) {
        setCompletedLessons(data.progress.completedLessons);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const goToLesson = (offset) => {
    const nextIdx = currentIndex + offset;
    if (nextIdx >= 0 && nextIdx < allLessons.length) {
      setActiveLesson(allLessons[nextIdx]);
    }
  };

  const getVideoEmbed = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtu.be') || url.includes('youtube.com')) {
        const urlObj = new URL(url);
        let id = '';
        if (url.includes('youtu.be/')) {
          id = urlObj.pathname.slice(1);
        } else {
          id = urlObj.searchParams.get('v');
        }
        if (id) return `https://www.youtube-nocookie.com/watch?v=${id}`;
      }
    } catch (e) { }
    return url;
  };

  const embedUrl = activeLesson?.canAccess ? getVideoEmbed(activeLesson.videoUrl) : null;

  if (!isClient) return null;

  return (
    <div className={`${styles.learnLayout} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
      {/* Dynamic Navbar */}
      <div className={styles.learnNav}>
        <div className={styles.learnNavInner}>
          <div className={styles.learnNavLeft}>
            <Link href={`/courses/${course.slug}`} className={styles.backBtn}>← Back</Link>
            <button
              className={`${styles.navContentBtn} ${sidebarOpen ? styles.navContentBtnActive : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <LayoutList size={18} />
              <span>Content</span>
            </button>
            <div className={styles.navContentDivider} />
            <span className={styles.courseNavTitle}>{course.title}</span>
          </div>
          <div className={styles.learnNavRight}>
            <button
              className={`${styles.navDiscussionBtn} ${showDiscussion ? styles.navDiscussionBtnActive : ''}`}
              onClick={() => setShowDiscussion(!showDiscussion)}
            >
              <MessageSquare size={18} />
              <span>Discussion</span>
            </button>
            <div className={styles.navDivider} />
            <span className={styles.progressLabel}>
              Progress: <span className={styles.progressPercent}>{completionPercent}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar with Lock Icons and Selection Logic */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>Course Content</div>
          <div className={styles.sidebarProgress}>
            <div className={styles.sidebarProgressBar} style={{ width: `${completionPercent}%` }} />
          </div>
          <div className={styles.sidebarProgressText}>{completedLessons.length}/{allLessons.length} completed</div>
        </div>

        {modules.map((mod, idx) => (
          <div key={mod._id} className={styles.sModuleItem}>
            <div className={styles.sModuleHeader} onClick={() => toggleModule(mod._id)}>
              <div className={styles.sModuleTitle}>
                <span className={`${styles.sModuleToggle} ${openModules[mod._id] ? styles.sModuleToggleOpen : ''}`}>▸</span>
                {mod.title}
              </div>
              <span className={styles.sModuleMeta}>{mod.lessons?.length || 0} lessons</span>
            </div>

            {openModules[mod._id] && (
              <div>
                {mod.lessons?.map((lesson) => {
                  const isActive = lesson._id === activeLesson?._id;
                  const isDone = completedLessons.includes(lesson._id);
                  const isLocked = lesson.isLocked;

                  return (
                    <div
                      key={lesson._id}
                      className={`${styles.sLessonItem} ${isActive ? styles.sLessonActive : ''} ${isLocked ? styles.sLessonLocked : ''}`}
                      onClick={() => selectLesson(lesson)}
                    >
                      <div className={`${styles.sLessonIcon} ${isDone ? styles.sLessonIconDone : ''}`}>
                        {isDone ? '✓' : (isLocked ? '🔒' : '')}
                      </div>
                      <span className={`${styles.sLessonTitle} ${isDone ? styles.sLessonCompleted : ''}`}>
                        {lesson.isFreePreview && !hasFullAccess && <span className={styles.sLessonPreviewBadge}>Preview</span>}
                        {lesson.title}
                      </span>
                      <span className={styles.sLessonDuration}>{lesson.videoDuration}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.videoContainer}>
          {activeLesson?.canAccess ? (
            embedUrl ? (
              (() => {
                const Player = embedUrl.includes('vimeo') ? VimeoPlayer : YouTubePlayer;
                return (
                  <Player
                    ref={playerRef}
                    key={activeLesson._id}
                    url={embedUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    onProgress={handleProgress}
                    onPause={handlePause}
                    progressInterval={5000}
                    config={{
                      youtube: { playerVars: { rel: 0, modestbranding: 1, start: getInitialTime(), autoplay: 1 } },
                      vimeo: { playerOptions: { autopause: false } }
                    }}
                  />
                );
              })()
            ) : (

              <div className={styles.videoPlaceholder}>
                <div style={{ fontSize: '64px', marginBottom: '8px' }}>▶</div>
                <p>{activeLesson.title}</p>
                <p style={{ opacity: 0.5, marginTop: '4px' }}>Video will appear here when a URL is set</p>
              </div>
            )
          ) : (
            <LockedLesson courseSlug={course.slug} />
          )}
        </div>

        <div className={styles.lessonContent}>
          <div className={styles.lessonHeader}>
            <h1 className={styles.lessonTitle}>{activeLesson?.title || 'No lesson selected'}</h1>
            {activeLesson?.canAccess && (
              <button
                className={`${styles.completeBtn} ${completedLessons.includes(activeLesson?._id) ? styles.completeBtnDone : styles.completeBtnIncomplete}`}
                onClick={markComplete}
                disabled={isMarkingComplete}
              >
                {completedLessons.includes(activeLesson?._id) ? '✓ Completed' : (isMarkingComplete ? 'Updating...' : 'Mark Complete')}
              </button>
            )}
          </div>

          <div className={styles.tabBar}>
            <button className={`${styles.tab} ${activeTab === 'resources' ? styles.tabActive : ''}`} onClick={() => setActiveTab('resources')}>
              📎 Resources
            </button>
          </div>

          {activeTab === 'resources' && (
            <div className={styles.resourcesList}>
              {!activeLesson?.canAccess ? (
                <p style={{ color: 'var(--text-muted)' }}>Resources are locked for premium lessons.</p>
              ) : activeLesson?.resources?.length > 0 ? (
                activeLesson.resources.map((res, i) => (
                  <div key={i} className={styles.resourceItem}>
                    <div className={styles.resourceIcon}>📄</div>
                    <div className={styles.resourceInfo}>
                      <div className={styles.resourceName}>{res.name}</div>
                      <div className={styles.resourceMeta}>{res.fileType} • {res.fileSize}</div>
                    </div>
                    <Link href={res.fileUrl || '#'} className={styles.resourceDownload} target="_blank">Download</Link>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No resources available for this lesson.</p>
              )}
            </div>
          )}
        </div>

        <div className={styles.lessonNav}>
          <button className="btn btn-ghost btn-sm" onClick={() => goToLesson(-1)} disabled={currentIndex <= 0}>
            ← Previous Lesson
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => goToLesson(1)} disabled={currentIndex >= allLessons.length - 1}>
            Next Lesson →
          </button>
        </div>
      </div>

      {/* Discussion Side Panel */}
      <div
        className={`${styles.discussionPanel} ${showDiscussion ? styles.discussionPanelOpen : ''}`}
        style={{ width: isClient && window.innerWidth > 768 ? `${discussionWidth}px` : '100%' }}
      >
        <div className={styles.resizeHandle} onMouseDown={startResizing} />

        <div className={styles.discussionHeader}>
          <div className={styles.discussionHeaderTitle}>
            <MessageSquare size={20} />
            <span>Discussion</span>
          </div>
          <button className={styles.closePanelBtn} onClick={() => setShowDiscussion(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.discussionContent}>
          <CommentSection lessonId={activeLesson?._id} />
        </div>
      </div>

      {showDiscussion && <div className={styles.panelBackdrop} onClick={() => setShowDiscussion(false)} />}
    </div>
  );
}
