'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { API_URL } from '@/lib/api';
import { 
  Plus, 
  RotateCw, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  Pencil,
  Trash2,
  Layout,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminCoursesPage() {
  const { api } = useAuth();
  const backendUrl = API_URL.replace('/api', '');

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    category: '', 
    shortDescription: '', 
    description: '', 
    accessType: 'free', 
    price: 0, 
    difficulty: 'beginner', 
    coverImage: '',
    features: [] 
  });
  
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/courses');
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setMsg({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleOpenEdit = (course) => {
    setEditCourse(course);
    setFormData({
      title: course.title,
      category: course.category,
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      accessType: course.accessType,
      price: course.price,
      difficulty: course.difficulty || 'beginner',
      coverImage: course.coverImage || '',
      features: course.features || []
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditCourse(null);
    setFormData({ title: '', category: '', shortDescription: '', description: '', accessType: 'free', price: 0, difficulty: 'beginner', coverImage: '', features: [] });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handeFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleFeatureImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setFormData(prev => ({ ...prev, coverImage: data.url }));
        showStatus('success', 'Image uploaded successfully');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showStatus('error', err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Clean up empty features before save
    const cleanFeatures = formData.features.map(f => f.trim()).filter(f => f !== '');
    const dataToSave = { ...formData, features: cleanFeatures };

    try {
      if (editCourse) {
        const { data } = await api.put(`/admin/courses/${editCourse._id}`, dataToSave);
        if (data.success) {
          setCourses(courses.map(c => c._id === editCourse._id ? data.course : c));
          showStatus('success', 'Course updated successfully!');
        }
      } else {
        const { data } = await api.post('/admin/courses', dataToSave);
        if (data.success) {
          setCourses([data.course, ...courses]);
          showStatus('success', 'Course created successfully!');
        }
      }
      setShowForm(false);
      setEditCourse(null);
    } catch (err) {
      console.error('Save error:', err);
      showStatus('error', err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course and all its modules/lessons? This cannot be undone.')) return;
    
    try {
      const { data } = await api.delete(`/admin/courses/${id}`);
      if (data.success) {
        setCourses(courses.filter(c => c._id !== id));
        showStatus('success', 'Course deleted');
      }
    } catch (err) {
      showStatus('error', 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const { data } = await api.put(`/admin/courses/${course._id}`, {
        isPublished: !course.isPublished
      });
      if (data.success) {
        setCourses(courses.map(c => c._id === course._id ? data.course : c));
        showStatus('success', `Course ${data.course.isPublished ? 'published' : 'moved to drafts'}`);
      }
    } catch (err) {
      showStatus('error', 'Failed to update course status');
    }
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Manage Courses</h1>
        <div className={styles.topBarActions}>
          <button className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} onClick={handleNew} disabled={loading || saving}>
            <Plus size={16} style={{ marginRight: 6 }} />
            New Course
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        {msg.text && (
          <div className={`${styles.alert} ${msg.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
            {msg.type === 'error' ? (
              <XCircle size={18} style={{ marginRight: 8 }} />
            ) : (
              <CheckCircle size={18} style={{ marginRight: 8 }} />
            )}
            {msg.text}
          </div>
        )}

        {/* Course Creation/Edit Form */}
        {showForm && (
          <div className={styles.sectionCard} style={{ marginBottom: 24 }}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>{editCourse ? 'Edit Course Details' : 'Create New Course'}</h3>
              <button className={`${styles.adminBtn} ${styles.adminBtnGhost}`} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div style={{ padding: 24 }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Course Title</label>
                    <input className={styles.adminInput} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter course title" required disabled={saving} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Category</label>
                    <select className={`${styles.adminInput} ${styles.adminSelect}`} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required disabled={saving}>
                      <option value="">Select category</option>
                      <option value="Game Development">Game Development</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Computer Graphics">Computer Graphics</option>
                      <option value="VFX & Motion">VFX & Motion</option>
                      <option value="Programming Languages">Programming Languages</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Short Description</label>
                  <input className={styles.adminInput} value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief description for card display" disabled={saving} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Full Description</label>
                  <textarea className={`${styles.adminInput} ${styles.adminTextarea}`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed course description..." disabled={saving} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Course Feature Image</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      className={styles.adminInput} 
                      value={formData.coverImage} 
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} 
                      placeholder="Paste image URL or upload below..." 
                      disabled={saving || uploadingImage} 
                    />
                    <label className={`${styles.adminBtn} ${styles.adminBtnGhost}`} style={{ cursor: isNaN(uploadingImage) && !uploadingImage ? 'pointer' : 'default', opacity: uploadingImage ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                      <Upload size={16} />
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFeatureImageUpload} 
                        style={{ display: 'none' }} 
                        disabled={uploadingImage || saving}
                      />
                    </label>
                  </div>
                  <div className={styles.imagePreviewContainer}>
                    <span className={styles.imagePreviewLabel}>Preview</span>
                    {formData.coverImage ? (
                      <img 
                        src={resolveImageUrl(formData.coverImage)} 
                        alt="Preview" 
                        className={styles.imagePreview} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={styles.imagePreviewEmpty} 
                      style={{ display: formData.coverImage ? 'none' : 'flex' }}
                    >
                      <ImageIcon size={32} opacity={0.2} />
                      <p>No image URL provided</p>
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Access Type</label>
                    <select className={`${styles.adminInput} ${styles.adminSelect}`} value={formData.accessType} onChange={(e) => setFormData({ ...formData, accessType: e.target.value })} disabled={saving}>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Price ($)</label>
                    <input className={styles.adminInput} type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} disabled={formData.accessType === 'free' || saving} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Difficulty</label>
                  <select className={`${styles.adminInput} ${styles.adminSelect}`} value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} disabled={saving}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Course Features</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.features.map((feature, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          className={styles.adminInput} 
                          value={feature} 
                          onChange={(e) => handeFeatureChange(idx, e.target.value)} 
                          placeholder="e.g. 5 real-world projects" 
                          disabled={saving}
                        />
                        <button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} style={{ padding: '0 12px' }} onClick={() => handleRemoveFeature(idx)} disabled={saving}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className={`${styles.adminBtn} ${styles.adminBtnGhost}`} onClick={handleAddFeature} style={{ width: 'fit-content' }} disabled={saving}>
                      <Plus size={14} style={{ marginRight: 6 }} />
                      Add Feature
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="submit" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} disabled={saving}>
                    {saving ? (editCourse ? 'Updating...' : 'Creating...') : (editCourse ? 'Save Changes' : 'Create Course')}
                  </button>
                  <button type="button" className={`${styles.adminBtn} ${styles.adminBtnGhost}`} onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courses Table */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h3 className={styles.sectionCardTitle}>
              {loading ? 'Loading Courses...' : `All Courses (${courses.length})`}
            </h3>
            {!loading && (
              <button 
                className={styles.refreshBtn} 
                onClick={fetchCourses} 
                title="Refresh List"
              >
                <RotateCw size={18} className={loading ? styles.spin : ''} />
              </button>
            )}
          </div>
          <div className={styles.sectionCardBody}>
            {loading ? (
              <div className={styles.loadingPlaceholder}>
                <div className={styles.loader}></div>
                <p>Fetching your curriculum...</p>
              </div>
            ) : courses.length > 0 ? (
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Lessons</th>
                    <th>Access</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{course.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{course.category}</div>
                      </td>
                      <td>{course.totalLessons || 0}</td>
                      <td>
                        <span className={`${styles.cellBadge} ${course.accessType === 'free' ? styles.cellBadgeFree : styles.cellBadgePremium}`}>
                          {course.accessType}
                        </span>
                      </td>
                      <td>{course.accessType === 'free' ? 'Free' : `$${course.price}`}</td>
                      <td>
                        <span className={`${styles.cellBadge} ${course.isPublished ? styles.cellBadgePublished : styles.cellBadgeDraft}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.cellActions}>
                          <button 
                            className={`${styles.actionBtn} ${course.isPublished ? styles.actionBtnDanger : styles.actionBtnSuccess}`} 
                            onClick={() => handleTogglePublish(course)}
                            title={course.isPublished ? "Unpublish Course" : "Publish Course"}
                          >
                            {course.isPublished ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <Link href={`/admin/courses/${course._id}`} className={styles.actionBtn} title="Curriculum">
                            <Layout size={16} />
                          </Link>
                          <button className={styles.actionBtn} onClick={() => handleOpenEdit(course)} title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(course._id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>No courses found in database.</p>
                <button className={styles.adminBtn} onClick={handleNew}>Create Your First Course</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
