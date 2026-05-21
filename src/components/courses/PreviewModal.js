'use client';

import { useState, useEffect } from 'react';
import styles from './PreviewModal.module.css';

export default function PreviewModal({ isOpen, onClose, courseTitle, modules = [], initialLessonId = null }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-select the first preview lesson or specific one when opening
  useEffect(() => {
    if (isOpen && modules.length > 0) {
      if (initialLessonId) {
        // Find specific lesson
        for (const mod of modules) {
          const target = mod.lessons?.find(l => l._id === initialLessonId);
          if (target && target.isFreePreview) {
            setActiveLesson(target);
            return;
          }
        }
      }

      // Default to first preview lesson
      for (const mod of modules) {
        const previewLesson = mod.lessons?.find(l => l.isFreePreview);
        if (previewLesson) {
          setActiveLesson(previewLesson);
          break;
        }
      }
    }
  }, [isOpen, modules, initialLessonId]);

  if (!isOpen) return null;

  const getVideoEmbed = (url) => {
    if (!url) return null;
    
    // Support YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    
    // Support Vimeo
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    
    // If it's a direct mp4 or local path, we might need a <video> tag, 
    // but the user requested iframe for now. If it's a raw URL, 
    // we'll return it and the iframe will try to render it.
    return url;
  };

  const handleLessonClick = (lesson) => {
    if (lesson.isFreePreview) {
      setIsLoading(true);
      setActiveLesson(lesson);
    }
  };

  const embedUrl = activeLesson ? getVideoEmbed(activeLesson.videoUrl) : null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Free Course Preview: {courseTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.modalBody}>
          {/* Main Content: Video Player */}
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              {embedUrl ? (
                <iframe
                  key={activeLesson?._id}
                  className={styles.videoIframe}
                  src={embedUrl}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={() => setIsLoading(false)}
                />
              ) : (
                <div className={styles.videoFallback}>
                  <div className={styles.fallbackIcon}>📺</div>
                  <h3>No Preview Available</h3>
                  <p>This lesson doesn't have a video preview set yet.</p>
                </div>
              )}
            </div>
            
            <div className={styles.videoInfo}>
              {activeLesson && (
                <>
                  <h3 className={styles.activeLessonTitle}>{activeLesson.title}</h3>
                  <div className={styles.lessonMeta}>
                    <span className={styles.previewBadge}>Free Preview</span>
                    <span>•</span>
                    <span>{activeLesson.videoDuration || '00:00'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar: Curriculum */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Course Curriculum</h3>
            </div>
            
            <div className={styles.moduleList}>
              {modules.map((mod, modIdx) => (
                <div key={mod._id} className={styles.moduleItem}>
                  <div className={styles.moduleHeader}>
                    Module {modIdx + 1}: {mod.title}
                  </div>
                  
                  {mod.lessons?.map((lesson) => (
                    <div
                      key={lesson._id}
                      className={`${styles.lessonItem} ${
                        activeLesson?._id === lesson._id ? styles.lessonItemActive : ''
                      } ${!lesson.isFreePreview ? styles.lessonItemLocked : ''}`}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className={styles.lessonIcon}>
                        {lesson.isFreePreview ? (activeLesson?._id === lesson._id ? '▶' : '✓') : '🔒'}
                      </div>
                      
                      <div className={styles.lessonInfo}>
                        <div className={styles.lessonTitle}>{lesson.title}</div>
                        <div className={styles.lessonMeta}>
                          {lesson.isFreePreview ? (
                            <span className={styles.previewBadge}>Preview</span>
                          ) : (
                            <span className={styles.lockedIcon}>Locked</span>
                          )}
                          <span>•</span>
                          <span>{lesson.videoDuration || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
