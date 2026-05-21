'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  Trash2, 
  Folder, 
  PlayCircle, 
  FileText, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import adminStyles from '../../admin.module.css';
import styles from './editor.module.css';

export default function CourseEditorPage() {
  const { id } = useParams();
  const { api } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [openModules, setOpenModules] = useState({});
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [addingLesson, setAddingLesson] = useState(null); // module id
  const [newLesson, setNewLesson] = useState({ title: '', type: 'video', videoDuration: '', videoUrl: '', isFreePreview: false });
  
  const [editingLesson, setEditingLesson] = useState(null); // lesson id
  const [editLessonData, setEditLessonData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/admin/courses/${id}`),
        api.get(`/admin/modules/${id}`)
      ]);
      
      setCourse(courseRes.data.course);
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesRes.data.modules.map(async (mod) => {
          const lessonsRes = await api.get(`/admin/lessons/${mod._id}`);
          return { ...mod, lessons: lessonsRes.data.lessons };
        })
      );
      
      setModules(modulesWithLessons);
    } catch (err) {
      console.error('Error fetching curriculum:', err);
      setMessage({ type: 'error', text: 'Failed to load curriculum data' });
    } finally {
      setLoading(false);
    }
  }, [id, api]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const toggleModule = (id) => setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));

  // ================= MODULE HANDLERS =================

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      setSaving(true);
      const { data } = await api.post('/admin/modules', {
        title: newModuleTitle,
        courseId: id,
        order: modules.length + 1
      });
      
      if (data.success) {
        setModules([...modules, { ...data.module, lessons: [] }]);
        setNewModuleTitle('');
        setAddingModule(false);
        setOpenModules(prev => ({ ...prev, [data.module._id]: true }));
        showMessage('success', 'Module added');
      }
    } catch (err) {
      showMessage('error', 'Failed to add module');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      const { data } = await api.delete(`/admin/modules/${moduleId}`);
      if (data.success) {
        setModules(modules.filter(m => m._id !== moduleId));
        showMessage('success', 'Module deleted');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete module');
    }
  };

  // ================= LESSON HANDLERS =================

  const handleAddLesson = async (moduleId) => {
    if (!newLesson.title.trim()) return;
    try {
      setSaving(true);
      const mod = modules.find(m => m._id === moduleId);
      const { data } = await api.post('/admin/lessons', {
        ...newLesson,
        courseId: id,
        moduleId,
        order: (mod.lessons?.length || 0) + 1
      });
      
      if (data.success) {
        setModules(modules.map(m => {
          if (m._id === moduleId) {
            return {
              ...m,
              lessons: [...(m.lessons || []), data.lesson]
            };
          }
          return m;
        }));
        setNewLesson({ title: '', type: 'video', videoDuration: '', videoUrl: '', isFreePreview: false });
        setAddingLesson(null);
        showMessage('success', 'Lesson added');
      }
    } catch (err) {
      showMessage('error', 'Failed to add lesson');
    } finally {
      setSaving(false);
    }
  };

  const startEditingLesson = (lesson) => {
    setEditingLesson(lesson._id);
    setEditLessonData({ ...lesson });
  };

  const handleSaveLessonEdit = async (moduleId) => {
    if (!editLessonData.title.trim()) return;
    try {
      setSaving(true);
      const { data } = await api.put(`/admin/lessons/${editingLesson}`, editLessonData);
      
      if (data.success) {
        setModules(modules.map(m => {
          if (m._id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => l._id === editingLesson ? data.lesson : l)
            };
          }
          return m;
        }));
        setEditingLesson(null);
        setEditLessonData(null);
        showMessage('success', 'Lesson updated');
      }
    } catch (err) {
      showMessage('error', 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      const { data } = await api.delete(`/admin/lessons/${lessonId}`);
      if (data.success) {
        setModules(modules.map(m => {
          if (m._id === moduleId) {
            return { ...m, lessons: m.lessons.filter(l => l._id !== lessonId) };
          }
          return m;
        }));
        showMessage('success', 'Lesson deleted');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete lesson');
    }
  };

  if (loading) return <div className={adminStyles.pageContent}><p>Loading curriculum...</p></div>;
  if (!course) return <div className={adminStyles.pageContent}><p>Course not found.</p></div>;

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

  return (
    <>
      <div className={adminStyles.topBar}>
        <h1 className={adminStyles.topBarTitle}>Curriculum Editor</h1>
        <div className={adminStyles.topBarActions}>
          {message.text && (
            <span className={`${styles.statusBadge} ${message.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
              {message.text}
            </span>
          )}
          <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
            {modules.length} modules • {totalLessons} lessons
          </span>
          <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnPrimary}`} onClick={() => fetchData()}>
            Refresh Data
          </button>
        </div>
      </div>

      <div className={adminStyles.pageContent}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/admin/courses">Courses</Link>
          <ChevronRight size={14} />
          <span>{course.title}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--admin-text)' }}>Curriculum</span>
        </div>

        {/* Module List */}
        <div className={styles.moduleList}>
          {modules.map((mod, idx) => (
            <div key={mod._id} className={styles.moduleBlock}>
              {/* Module Header */}
              <div className={styles.moduleBlockHeader} onClick={() => toggleModule(mod._id)}>
                <div className={styles.moduleBlockLeft}>
                  <div className={styles.moduleOrder}>{idx + 1}</div>
                  <span className={styles.moduleTitle}>{mod.title}</span>
                  <span className={styles.moduleLessonCount}>({mod.lessons?.length || 0} lessons)</span>
                </div>
                <div className={styles.moduleBlockActions}>
                  <button
                    className={`${adminStyles.actionBtn} ${adminStyles.actionBtnDanger}`}
                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod._id); }}
                    title="Delete Module"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className={`${styles.moduleChevron} ${openModules[mod._id] ? styles.moduleChevronOpen : ''}`}>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {openModules[mod._id] && (
                <div className={styles.lessonTable}>
                  {mod.lessons?.map((lesson, lIdx) => (
                    <div key={lesson._id}>
                      {editingLesson === lesson._id ? (
                        <div className={styles.inlineForm}>
                          <div className={styles.inlineFormRow}>
                            <div className={styles.inlineFormGroup} style={{ flex: 2 }}>
                              <label>Lesson Title</label>
                              <input className={styles.inlineInput} value={editLessonData.title} onChange={(e) => setEditLessonData({ ...editLessonData, title: e.target.value })} placeholder="Lesson title" />
                            </div>
                            <div className={styles.inlineFormGroup}>
                              <label>Type</label>
                              <select className={`${styles.inlineInput} ${styles.inlineSelect}`} value={editLessonData.type} onChange={(e) => setEditLessonData({ ...editLessonData, type: e.target.value })}>
                                <option value="video">Video</option>
                                <option value="text">Text</option>
                                <option value="mixed">Mixed</option>
                              </select>
                            </div>
                            <div className={styles.inlineFormGroup}>
                              <label>Duration</label>
                              <input className={styles.inlineInput} value={editLessonData.videoDuration || ''} onChange={(e) => setEditLessonData({ ...editLessonData, videoDuration: e.target.value })} placeholder="MM:SS" style={{ width: 80 }} />
                            </div>
                            <div className={styles.inlineFormGroup} style={{ flex: 2 }}>
                              <label>Video URL</label>
                              <input className={styles.inlineInput} value={editLessonData.videoUrl || ''} onChange={(e) => setEditLessonData({ ...editLessonData, videoUrl: e.target.value })} placeholder="YouTube/Vimeo URL" />
                            </div>
                            <label className={styles.checkbox}>
                              <input type="checkbox" checked={editLessonData.isFreePreview || false} onChange={(e) => setEditLessonData({ ...editLessonData, isFreePreview: e.target.checked })} />
                              Free Preview
                            </label>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnPrimary}`} onClick={() => handleSaveLessonEdit(mod._id)} disabled={saving}>
                              {saving ? 'Saving...' : 'Save changes'}
                            </button>
                            <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnGhost}`} onClick={() => setEditingLesson(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.lessonRow}>
                          <span className={styles.lessonOrder}>{lIdx + 1}</span>
                          <span className={styles.lessonTypeIcon}>
                            {lesson.type === 'video' ? <PlayCircle size={14} /> : <FileText size={14} />}
                          </span>
                          <div className={styles.lessonName}>
                            {lesson.title}
                            {lesson.videoUrl && <span className={styles.hasVideoBadge}>Contains Video URL</span>}
                          </div>
                          {lesson.isFreePreview && <span className={styles.lessonPreviewBadge}>Preview</span>}
                          <span className={styles.lessonDuration}>{lesson.videoDuration || '—'}</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className={`${adminStyles.actionBtn}`}
                              onClick={() => startEditingLesson(lesson)}
                              style={{ fontSize: 11, padding: '4px 8px' }}
                            >
                              Edit
                            </button>
                            <button
                              className={`${adminStyles.actionBtn} ${adminStyles.actionBtnDanger}`}
                              onClick={() => handleDeleteLesson(mod._id, lesson._id)}
                              style={{ fontSize: 11, padding: '4px 8px' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Lesson Form */}
                  {addingLesson === mod._id ? (
                    <div className={styles.inlineForm}>
                      <div className={styles.inlineFormRow}>
                        <div className={styles.inlineFormGroup} style={{ flex: 2 }}>
                          <label>Lesson Title</label>
                          <input className={styles.inlineInput} value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} placeholder="Lesson title" />
                        </div>
                        <div className={styles.inlineFormGroup}>
                          <label>Type</label>
                          <select className={`${styles.inlineInput} ${styles.inlineSelect}`} value={newLesson.type} onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}>
                            <option value="video">Video</option>
                            <option value="text">Text</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div className={styles.inlineFormGroup}>
                          <label>Duration</label>
                          <input className={styles.inlineInput} value={newLesson.videoDuration} onChange={(e) => setNewLesson({ ...newLesson, videoDuration: e.target.value })} placeholder="MM:SS" style={{ width: 80 }} />
                        </div>
                        <div className={styles.inlineFormGroup} style={{ flex: 2 }}>
                          <label>Video URL</label>
                          <input className={styles.inlineInput} value={newLesson.videoUrl} onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })} placeholder="YouTube/Vimeo URL" />
                        </div>
                        <label className={styles.checkbox}>
                          <input type="checkbox" checked={newLesson.isFreePreview} onChange={(e) => setNewLesson({ ...newLesson, isFreePreview: e.target.checked })} />
                          Free Preview
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnPrimary}`} onClick={() => handleAddLesson(mod._id)} disabled={saving}>
                          {saving ? 'Adding...' : 'Add Lesson'}
                        </button>
                        <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnGhost}`} onClick={() => setAddingLesson(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.addLessonRow}>
                      <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnGhost}`} onClick={() => setAddingLesson(mod._id)} style={{ fontSize: 12 }}>
                        + Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {modules.length === 0 && (
            <div className={styles.emptyModules}>
              <div className={styles.emptyIcon}><Folder size={48} opacity={0.2} /></div>
              <p className={styles.emptyText}>No modules yet. Start building your curriculum!</p>
            </div>
          )}
        </div>

        {/* Add Module */}
        {addingModule ? (
          <div className={adminStyles.sectionCard} style={{ marginTop: 16, padding: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className={adminStyles.adminLabel}>Module Title</label>
                <input
                  className={adminStyles.adminInput}
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g. Introduction, Getting Started..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                />
              </div>
              <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnPrimary}`} onClick={handleAddModule} disabled={saving}>
                {saving ? 'Adding...' : 'Add Module'}
              </button>
              <button className={`${adminStyles.adminBtn} ${adminStyles.adminBtnGhost}`} onClick={() => setAddingModule(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className={styles.addModuleBtn} onClick={() => setAddingModule(true)} style={{ marginTop: 16 }}>
            + Add Module
          </button>
        )}
      </div>
    </>
  );
}
