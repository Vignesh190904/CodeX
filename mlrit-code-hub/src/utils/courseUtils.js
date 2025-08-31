import axios from 'axios';

// Utility to validate and get correct course structure
export const validateCourseStructure = async (courseId, topicId = null, lessonId = null) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const course = response.data;
    
    // If only course validation needed
    if (!topicId) {
      return { valid: true, course, correctedUrl: `/courses/${course._id}` };
    }
    
    // Find topic
    const topic = course.topics.find(t => t._id === topicId);
    if (!topic) {
      // Return first topic as fallback
      const firstTopic = course.topics[0];
      return {
        valid: false,
        course,
        topic: firstTopic,
        correctedUrl: `/courses/${course._id}/topics/${firstTopic._id}`,
        error: 'Topic not found, redirected to first topic'
      };
    }
    
    // If only topic validation needed
    if (!lessonId) {
      return { valid: true, course, topic, correctedUrl: `/courses/${course._id}/topics/${topic._id}` };
    }
    
    // Find lesson
    const lesson = topic.lessons.find(l => l._id === lessonId);
    if (!lesson) {
      // Return first lesson as fallback
      const firstLesson = topic.lessons[0];
      return {
        valid: false,
        course,
        topic,
        lesson: firstLesson,
        correctedUrl: `/courses/${course._id}/topics/${topic._id}/lessons/${firstLesson._id}`,
        error: 'Lesson not found, redirected to first lesson'
      };
    }
    
    return {
      valid: true,
      course,
      topic,
      lesson,
      correctedUrl: `/courses/${course._id}/topics/${topic._id}/lessons/${lesson._id}`
    };
    
  } catch (error) {
    return {
      valid: false,
      error: error.response?.data?.message || 'Course not found',
      correctedUrl: '/courses'
    };
  }
};

// Get all available courses with their structure
export const getAllCoursesWithStructure = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.map(course => ({
      id: course._id,
      title: course.title,
      url: `/courses/${course._id}`,
      topics: course.topics.map(topic => ({
        id: topic._id,
        title: topic.title,
        url: `/courses/${course._id}/topics/${topic._id}`,
        lessons: topic.lessons.map(lesson => ({
          id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          url: `/courses/${course._id}/topics/${topic._id}/lessons/${lesson._id}`
        }))
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
};

// Find lesson by title (fallback when IDs don't match)
export const findLessonByTitle = async (courseId, lessonTitle) => {
  try {
    const validation = await validateCourseStructure(courseId);
    if (!validation.valid) return null;
    
    for (const topic of validation.course.topics) {
      const lesson = topic.lessons.find(l => 
        l.title.toLowerCase().includes(lessonTitle.toLowerCase())
      );
      if (lesson) {
        return {
          course: validation.course,
          topic,
          lesson,
          url: `/courses/${courseId}/topics/${topic._id}/lessons/${lesson._id}`
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to find lesson by title:', error);
    return null;
  }
};
