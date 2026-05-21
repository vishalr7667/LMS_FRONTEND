'use client';

import { useState } from 'react';
import styles from './resources.module.css';

const CATEGORIES = ['All', 'Project Files', 'Textures', 'HDRIs', '3D Models', 'Scripts', 'PDFs', 'Templates'];

const MOCK_RESOURCES = [
  { _id: '1', title: 'PBR Material Pack — Metals', category: 'Textures', accessType: 'free', fileType: 'ZIP', fileSize: '45 MB', downloadCount: 1250, emoji: '🎨', tags: ['PBR', 'Metals', 'Textures'] },
  { _id: '2', title: 'Game Engine Starter Template', category: 'Project Files', accessType: 'free', fileType: 'ZIP', fileSize: '12 MB', downloadCount: 892, emoji: '🕹️', tags: ['C++', 'SDL', 'Starter'] },
  { _id: '3', title: 'Studio HDRI Collection', category: 'HDRIs', accessType: 'premium', fileType: 'HDR', fileSize: '320 MB', downloadCount: 456, emoji: '🌅', tags: ['HDRI', 'Studio', 'Lighting'] },
  { _id: '4', title: 'Low Poly Character Pack', category: '3D Models', accessType: 'free', fileType: 'FBX', fileSize: '28 MB', downloadCount: 2100, emoji: '🧑', tags: ['3D', 'Low Poly', 'Character'] },
  { _id: '5', title: 'Python Utility Scripts', category: 'Scripts', accessType: 'free', fileType: 'PY', fileSize: '500 KB', downloadCount: 678, emoji: '🐍', tags: ['Python', 'Utility', 'Scripts'] },
  { _id: '6', title: 'Linear Algebra Cheatsheet', category: 'PDFs', accessType: 'free', fileType: 'PDF', fileSize: '2.4 MB', downloadCount: 3400, emoji: '📐', tags: ['Math', 'Linear Algebra'] },
  { _id: '7', title: 'VFX Breakdown Scene Files', category: 'Project Files', accessType: 'premium', fileType: 'ZIP', fileSize: '180 MB', downloadCount: 340, emoji: '🎬', tags: ['VFX', 'Nuke', 'Comp'] },
  { _id: '8', title: 'Architectural Materials Pack', category: 'Textures', accessType: 'premium', fileType: 'ZIP', fileSize: '90 MB', downloadCount: 560, emoji: '🏛️', tags: ['PBR', 'Architecture'] },
];

function ResourcesContent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_RESOURCES.filter((r) => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <>
        <div className="container">
          <div className={styles.resourcesPage}>
            <div className={styles.resourcesHeader}>
              <h1 className={styles.resourcesTitle}>
                Resource <span className="text-gold">Library</span>
              </h1>
              <p className={styles.resourcesSubtitle}>
                Free and premium assets to supercharge your projects
              </p>
            </div>

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
              <div className={styles.searchBox}>
                <span>🔍</span>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className={styles.resourcesGrid}>
                {filtered.map((res) => (
                  <div key={res._id} className={styles.resourceCard}>
                    <div className={styles.resourcePreview}>
                      <span>{res.emoji}</span>
                      <div className={styles.resourceBadge}>
                        <span className={`badge ${res.accessType === 'free' ? 'badge-free' : 'badge-premium'}`}>
                          {res.accessType === 'free' ? 'FREE' : 'PREMIUM'}
                        </span>
                      </div>
                      <span className={styles.resourceFileType}>{res.fileType}</span>
                    </div>
                    <div className={styles.resourceBody}>
                      <p className={styles.resourceCategory}>{res.category}</p>
                      <h3 className={styles.resourceTitle}>{res.title}</h3>
                      <div className={styles.resourceTags}>
                        {res.tags.map((tag, i) => (
                          <span key={i} className={styles.resourceTag}>{tag}</span>
                        ))}
                      </div>
                      <div className={styles.resourceFooter}>
                        <span className={styles.resourceSize}>{res.fileSize}</span>
                        <span className={styles.resourceDownloads}>⬇ {res.downloadCount}</span>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3 className={styles.emptyTitle}>No resources found</h3>
                <p>Try adjusting your filters or search</p>
              </div>
            )}
          </div>
        </div>
    </>
  );
}

export default function ResourcesPage() {
  return <ResourcesContent />;
}
