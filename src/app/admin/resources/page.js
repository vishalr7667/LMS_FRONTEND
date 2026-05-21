'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, ExternalLink, Package } from 'lucide-react';
import styles from '../admin.module.css';

const MOCK_RESOURCES = [
  { _id: '1', title: 'PBR Material Pack — Metals', category: 'Textures', accessType: 'free', fileType: 'ZIP', fileSize: '45 MB', downloadCount: 1250, isPublished: true },
  { _id: '2', title: 'Game Engine Starter Template', category: 'Project Files', accessType: 'free', fileType: 'ZIP', fileSize: '12 MB', downloadCount: 892, isPublished: true },
  { _id: '3', title: 'Studio HDRI Collection', category: 'HDRIs', accessType: 'premium', fileType: 'HDR', fileSize: '320 MB', downloadCount: 456, isPublished: true },
  { _id: '4', title: 'Low Poly Character Pack', category: '3D Models', accessType: 'free', fileType: 'FBX', fileSize: '28 MB', downloadCount: 2100, isPublished: false },
  { _id: '5', title: 'VFX Breakdown Scene Files', category: 'Project Files', accessType: 'premium', fileType: 'ZIP', fileSize: '180 MB', downloadCount: 340, isPublished: true },
];

export default function AdminResourcesPage() {
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [showForm, setShowForm] = useState(false);
  const [editResource, setEditResource] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', accessType: 'free', fileType: '', fileSize: '', description: '', tags: '' });

  const handleNew = () => {
    setEditResource(null);
    setFormData({ title: '', category: '', accessType: 'free', fileType: '', fileSize: '', description: '', tags: '' });
    setShowForm(true);
  };

  const handleEdit = (res) => {
    setEditResource(res);
    setFormData({ title: res.title, category: res.category, accessType: res.accessType, fileType: res.fileType, fileSize: res.fileSize, description: res.description || '', tags: res.tags?.join(', ') || '' });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editResource) {
      setResources(resources.map(r => r._id === editResource._id ? { ...r, ...formData, tags: formData.tags.split(',').map(t => t.trim()) } : r));
    } else {
      setResources([{ _id: Date.now().toString(), ...formData, tags: formData.tags.split(',').map(t => t.trim()), downloadCount: 0, isPublished: false }, ...resources]);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this resource?')) setResources(resources.filter(r => r._id !== id));
  };

  const togglePublish = (id) => {
    setResources(resources.map(r => r._id === id ? { ...r, isPublished: !r.isPublished } : r));
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Manage Resources</h1>
        <div className={styles.topBarActions}>
          <button className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} onClick={handleNew}>
            <Plus size={16} style={{ marginRight: 6 }} />
            New Resource
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        {showForm && (
          <div className={styles.sectionCard} style={{ marginBottom: 24 }}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>{editResource ? 'Edit Resource' : 'Add New Resource'}</h3>
              <button className={`${styles.adminBtn} ${styles.adminBtnGhost}`} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div style={{ padding: 24 }}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Title</label>
                    <input className={styles.adminInput} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Resource title" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Category</label>
                    <select className={`${styles.adminInput} ${styles.adminSelect}`} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="">Select category</option>
                      <option value="Project Files">Project Files</option>
                      <option value="Textures">Textures</option>
                      <option value="HDRIs">HDRIs</option>
                      <option value="3D Models">3D Models</option>
                      <option value="Scripts">Scripts</option>
                      <option value="PDFs">PDFs</option>
                      <option value="Templates">Templates</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Access Type</label>
                    <select className={`${styles.adminInput} ${styles.adminSelect}`} value={formData.accessType} onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>File Type</label>
                    <input className={styles.adminInput} value={formData.fileType} onChange={(e) => setFormData({ ...formData, fileType: e.target.value })} placeholder="e.g. ZIP, PDF, FBX" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>File Size</label>
                    <input className={styles.adminInput} value={formData.fileSize} onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })} placeholder="e.g. 45 MB" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.adminLabel}>Tags (comma separated)</label>
                    <input className={styles.adminInput} value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="PBR, Metals, Textures" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Description</label>
                  <textarea className={`${styles.adminInput} ${styles.adminTextarea}`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Resource description..." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Upload File</label>
                  <input type="file" className={styles.adminInput} style={{ padding: '8px 14px' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="submit" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>{editResource ? 'Update' : 'Create Resource'}</button>
                  <button type="button" className={`${styles.adminBtn} ${styles.adminBtnGhost}`} onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h3 className={styles.sectionCardTitle}>All Resources ({resources.length})</h3>
          </div>
          <div className={styles.sectionCardBody}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Access</th>
                  <th>Size</th>
                  <th>Downloads</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((res) => (
                  <tr key={res._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{res.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{res.category}</div>
                    </td>
                    <td><span className={`${styles.cellBadge}`} style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>{res.fileType}</span></td>
                    <td><span className={`${styles.cellBadge} ${res.accessType === 'free' ? styles.cellBadgeFree : styles.cellBadgePremium}`}>{res.accessType}</span></td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>{res.fileSize}</td>
                    <td>{res.downloadCount}</td>
                    <td><span className={`${styles.cellBadge} ${res.isPublished ? styles.cellBadgePublished : styles.cellBadgeDraft}`}>{res.isPublished ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div className={styles.cellActions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(res)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className={styles.actionBtn} onClick={() => togglePublish(res._id)} title={res.isPublished ? 'Unpublish' : 'Publish'}>
                          <ExternalLink size={16} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(res._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
