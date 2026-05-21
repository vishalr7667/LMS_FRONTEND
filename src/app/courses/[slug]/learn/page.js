import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
import axios from 'axios';
import LearnClient from './LearnClient';
import { API_URL } from '@/lib/api';

async function getCourseData(slug) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  try {
    const { data } = await axios.get(`${API_URL}/courses/${slug}`, {
      headers: {
        Cookie: `refreshToken=${refreshToken}; accessToken=${token}`
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching course data on server:', error.message);
    return null;
  }
}

async function getProgressData(courseId) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) return null;

  try {
    // Obtain temporary access token for server-side fetching
    const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, {
      headers: {
        Cookie: `refreshToken=${refreshToken}`
      }
    });

    const validToken = refreshRes.data.accessToken;

    const { data } = await axios.get(`${API_URL}/progress/${courseId}`, {
      headers: {
        Authorization: `Bearer ${validToken}`
      }
    });
    return data.success ? data.progress : null;
  } catch (error) {
    console.error('Server-side progress fetch failed:', error.message);
    return null;
  }
}

export default async function LearnPage({ params }) {
  const { slug } = await params;
  const data = await getCourseData(slug);

  if (!data || !data.success) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <h1>Course Not Found</h1>
        <p>The course curriculum could not be loaded.</p>
      </div>
    );
  }

  const { course, modules, hasFullAccess } = data;
  const userProgress = await getProgressData(course._id);


  // Smart Initial Lesson Selection
  let initialLesson = null;

  if (modules && modules.length > 0) {
    // 1. Try to fetch the last watched lesson from database
    if (userProgress?.lastLessonId) {
      for (const mod of modules) {
        const found = mod.lessons?.find(l => l._id.toString() === userProgress.lastLessonId.toString());
        if (found && found.canAccess) {
          initialLesson = found;
          break;
        }
      }
    }

    // 2. Fall back to the first accessible lesson
    if (!initialLesson) {
      for (const mod of modules) {
        const accessible = mod.lessons?.find(l => l.canAccess);
        if (accessible) {
          initialLesson = accessible;
          break;
        }
      }
    }

    // 3. Absolute fallback
    if (!initialLesson && modules[0].lessons?.length > 0) {
      initialLesson = modules[0].lessons[0];
    }
  }

  return (
    <LearnClient
      course={course}
      modules={modules}
      initialLesson={initialLesson}
      userProgress={userProgress}
      hasFullAccess={hasFullAccess}
    />
  );
}
