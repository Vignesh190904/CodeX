import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FileText, Target, Code, CheckCircle, Plus, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import "./AdminCreateCourse.css";

const AdminCreateCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Create default lesson structure according to unified schema
  const createDefaultLesson = () => ({
    title: "",
    type: "lesson",
    content: "", // Theory content (required)
    mcqs: [
      {
        question: "",
        options: ["", "", "", ""],
        correct: 0,
        explanation: ""
      },
      {
        question: "",
        options: ["", "", "", ""],
        correct: 0,
        explanation: ""
      }
    ], // Exactly 2 MCQs (required)
    codeChallenges: [
      {
        title: "",
        description: "",
        sampleInput: "",
        sampleOutput: "",
        constraints: "",
        initialCode: "",
        language: "python",
        testCases: []
      },
      {
        title: "",
        description: "",
        sampleInput: "",
        sampleOutput: "",
        constraints: "",
        initialCode: "",
        language: "python",
        testCases: []
      }
    ], // Exactly 2 coding challenges (required)
    review: "" // Review content (required)
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Easy",
      scoringConfig: {
        lessonMcqMarks: 5,
        lessonCodingMarks: 25,
        moduleTestMcqMarks: 15,
        moduleTestCodingMarks: 75,
        finalExamMcqMarks: 20,
        finalExamCodingMarks: 100
      },
      topics: [
        {
          title: "",
          description: "",
          lessons: [createDefaultLesson()]
        }
      ]
    }
  });

  const {
    fields: topicFields,
    append: appendTopic,
    remove: removeTopic
  } = useFieldArray({
    control,
    name: "topics"
  });

  const watchedTopics = watch("topics");

  // Add new topic with default lesson
  const addTopic = () => {
    appendTopic({
      title: "",
      description: "",
      lessons: [createDefaultLesson()]
    });
  };

  // Add lesson to specific topic
  const addLessonToTopic = (topicIndex) => {
    const currentLessons = watchedTopics[topicIndex]?.lessons || [];
    const updatedLessons = [...currentLessons, createDefaultLesson()];
    setValue(`topics.${topicIndex}.lessons`, updatedLessons);
  };

  // Remove lesson from specific topic
  const removeLessonFromTopic = (topicIndex, lessonIndex) => {
    const currentLessons = watchedTopics[topicIndex]?.lessons || [];
    if (currentLessons.length > 1) { // Keep at least one lesson
      const updatedLessons = currentLessons.filter((_, index) => index !== lessonIndex);
      setValue(`topics.${topicIndex}.lessons`, updatedLessons);
    }
  };

  // Validation function for unified lesson schema
  const validateLessonStructure = (data) => {
    const errors = [];
    
    data.topics?.forEach((topic, topicIndex) => {
      if (!topic.title?.trim()) {
        errors.push(`Topic ${topicIndex + 1} must have a title`);
      }
      
      topic.lessons?.forEach((lesson, lessonIndex) => {
        const lessonLabel = `Topic ${topicIndex + 1}, Lesson ${lessonIndex + 1}`;
        
        if (!lesson.content?.trim()) {
          errors.push(`${lessonLabel} must have theory content`);
        }
        
        if (!lesson.mcqs || lesson.mcqs.length !== 2) {
          errors.push(`${lessonLabel} must have exactly 2 MCQs`);
        }
        
        if (!lesson.codeChallenges || lesson.codeChallenges.length !== 2) {
          errors.push(`${lessonLabel} must have exactly 2 coding challenges`);
        }
        
        if (!lesson.review?.trim()) {
          errors.push(`${lessonLabel} must have review content`);
        }
      });
    });
    
    return errors;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Validate lesson structure
      const validationErrors = validateLessonStructure(data);
      if (validationErrors.length > 0) {
        setSubmitError(`Validation errors:\n${validationErrors.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post("http://localhost:5000/api/courses", data);
      
      if (response.status === 201) {
        alert("Course created successfully!");
        navigate("/admin/courses");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setSubmitError(
        error.response?.data?.message || 
        "Failed to create course. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-create-course">
      <div className="create-course-header">
        <h1>Create New Course</h1>
        <p>Design a comprehensive course with topics and lessons following the unified schema</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="course-form">
        {/* Basic Course Information */}
        <div className="form-section">
          <h2>Course Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Course Title *</label>
            <input
              id="title"
              type="text"
              {...register("title", { required: "Course title is required" })}
              placeholder="Enter course title"
            />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Course Description *</label>
            <textarea
              id="description"
              {...register("description", { required: "Course description is required" })}
              placeholder="Enter course description"
              rows={4}
            />
            {errors.description && <span className="error">{errors.description.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty Level *</label>
            <select
              id="difficulty"
              {...register("difficulty", { required: "Difficulty level is required" })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            {errors.difficulty && <span className="error">{errors.difficulty.message}</span>}
          </div>
        </div>

        {/* Scoring Configuration Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Scoring Configuration</h2>
            <p className="section-description">Configure marks for different assessment types</p>
          </div>
          
          <div className="scoring-grid">
            <div className="scoring-category">
              <h4>Lesson Assessments</h4>
              <div className="form-group">
                <label>MCQ Marks (per question)</label>
                <input
                  type="number"
                  min="1"
                  {...register("scoringConfig.lessonMcqMarks", { 
                    required: "Lesson MCQ marks is required",
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                  placeholder="5"
                />
                {errors.scoringConfig?.lessonMcqMarks && (
                  <span className="error">{errors.scoringConfig.lessonMcqMarks.message}</span>
                )}
              </div>
              <div className="form-group">
                <label>Coding Challenge Marks (per challenge)</label>
                <input
                  type="number"
                  min="1"
                  {...register("scoringConfig.lessonCodingMarks", { 
                    required: "Lesson coding marks is required",
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                  placeholder="25"
                />
                {errors.scoringConfig?.lessonCodingMarks && (
                  <span className="error">{errors.scoringConfig.lessonCodingMarks.message}</span>
                )}
              </div>
            </div>

            <div className="scoring-category">
              <h4>Module Test Assessments</h4>
              <div className="form-group">
                <label>MCQ Marks (per question)</label>
                <input
                  type="number"
                  min="1"
                  {...register("scoringConfig.moduleTestMcqMarks", { 
                    required: "Module test MCQ marks is required",
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                  placeholder="15"
                />
                {errors.scoringConfig?.moduleTestMcqMarks && (
                  <span className="error">{errors.scoringConfig.moduleTestMcqMarks.message}</span>
                )}
              </div>
              <div className="form-group">
                <label>Coding Challenge Marks (per challenge)</label>
                <input
                  type="number"
                  min="1"
                  {...register("scoringConfig.moduleTestCodingMarks", { 
                    required: "Module test coding marks is required",
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                  placeholder="75"
                />
                {errors.scoringConfig?.moduleTestCodingMarks && (
                  <span className="error">{errors.scoringConfig.moduleTestCodingMarks.message}</span>
                )}
              </div>
            </div>

            <div className="scoring-category">
              <h4>Final Exam Assessments</h4>
              <div className="form-group">
                <label>MCQ Marks (per question)</label>
                <input
                  type="number"
                  min="1"
                  {...register("scoringConfig.finalExamMcqMarks", { 
                    required: "Final exam MCQ marks is required",
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                  placeholder="20"
                />
                {errors.scoringConfig?.finalExamMcqMarks && (
                  <span className="error">{errors.scoringConfig.finalExamMcqMarks.message}</span>
                )}
              </div>
              <div className="form-group">
                <label>Coding Challenge Marks (per challenge)</label>
                <input
                  type="number"
                  min="1"
                  {...register("scoringConfig.finalExamCodingMarks", { 
                    required: "Final exam coding marks is required",
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                  placeholder="100"
                />
                {errors.scoringConfig?.finalExamCodingMarks && (
                  <span className="error">{errors.scoringConfig.finalExamCodingMarks.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Course Topics</h2>
            <Button
              type="button"
              onClick={addTopic}
              variant="outline"
              size="sm"
              loading={false}
              disabled={false}
            >
              <Plus size={16} />
              Add Topic
            </Button>
          </div>

          {topicFields.map((topic, topicIndex) => (
            <div key={topic.id} className="topic-card">
              <div className="topic-header">
                <h3>Topic {topicIndex + 1}</h3>
                {topicFields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeTopic(topicIndex)}
                    variant="outline"
                    size="sm"
                    loading={false}
                    disabled={false}
                  >
                    <Trash2 size={16} />
                    Remove Topic
                  </Button>
                )}
              </div>

              <div className="form-group">
                <label>Topic Title *</label>
                <input
                  type="text"
                  {...register(`topics.${topicIndex}.title`, { 
                    required: "Topic title is required" 
                  })}
                  placeholder="Enter topic title"
                />
              </div>

              <div className="form-group">
                <label>Topic Description</label>
                <textarea
                  {...register(`topics.${topicIndex}.description`)}
                  placeholder="Enter topic description"
                  rows={2}
                />
              </div>

              {/* Lessons within Topic */}
              <div className="lessons-section">
                <div className="section-header">
                  <h4>Lessons</h4>
                  <Button
                    type="button"
                    onClick={() => addLessonToTopic(topicIndex)}
                    variant="outline"
                    size="sm"
                    loading={false}
                    disabled={false}
                  >
                    <Plus size={14} />
                    Add Lesson
                  </Button>
                </div>

                {watchedTopics[topicIndex]?.lessons?.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="lesson-card">
                    <div className="lesson-header">
                      <h5>Lesson {lessonIndex + 1}</h5>
                      {watchedTopics[topicIndex].lessons.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeLessonFromTopic(topicIndex, lessonIndex)}
                          variant="outline"
                          size="sm"
                          loading={false}
                          disabled={false}
                        >
                          <Trash2 size={14} />
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Lesson Title */}
                    <div className="form-group">
                      <label>Lesson Title *</label>
                      <input
                        type="text"
                        {...register(`topics.${topicIndex}.lessons.${lessonIndex}.title`, {
                          required: "Lesson title is required"
                        })}
                        placeholder="Enter lesson title"
                      />
                    </div>

                    {/* Theory Content */}
                    <div className="form-group">
                      <label>Theory Content * <FileText size={16} /></label>
                      <textarea
                        {...register(`topics.${topicIndex}.lessons.${lessonIndex}.content`, {
                          required: "Theory content is required"
                        })}
                        placeholder="Enter theory content for this lesson"
                        rows={4}
                      />
                    </div>

                    {/* MCQs (Exactly 2) */}
                    <div className="mcqs-section">
                      <h6><Target size={16} /> MCQs (Exactly 2 Required)</h6>
                      {[0, 1].map((mcqIndex) => (
                        <div key={mcqIndex} className="mcq-card">
                          <h6>MCQ {mcqIndex + 1}</h6>
                          
                          <div className="form-group">
                            <label>Question *</label>
                            <input
                              type="text"
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.mcqs.${mcqIndex}.question`, {
                                required: "MCQ question is required"
                              })}
                              placeholder="Enter MCQ question"
                            />
                          </div>

                          {/* Options */}
                          {[0, 1, 2, 3].map((optionIndex) => (
                            <div key={optionIndex} className="form-group">
                              <label>Option {optionIndex + 1} *</label>
                              <input
                                type="text"
                                {...register(`topics.${topicIndex}.lessons.${lessonIndex}.mcqs.${mcqIndex}.options.${optionIndex}`, {
                                  required: "Option is required"
                                })}
                                placeholder={`Enter option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}

                          <div className="form-group">
                            <label>Correct Answer *</label>
                            <select
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.mcqs.${mcqIndex}.correct`, {
                                required: "Correct answer is required"
                              })}
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Explanation *</label>
                            <textarea
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.mcqs.${mcqIndex}.explanation`, {
                                required: "Explanation is required"
                              })}
                              placeholder="Explain why this is the correct answer"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coding Challenges (Exactly 2) */}
                    <div className="coding-section">
                      <h6><Code size={16} /> Coding Challenges (Exactly 2 Required)</h6>
                      {[0, 1].map((codeIndex) => (
                        <div key={codeIndex} className="code-card">
                          <h6>Coding Challenge {codeIndex + 1}</h6>
                          
                          <div className="form-group">
                            <label>Challenge Title *</label>
                            <input
                              type="text"
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.codeChallenges.${codeIndex}.title`, {
                                required: "Challenge title is required"
                              })}
                              placeholder="Enter challenge title"
                            />
                          </div>

                          <div className="form-group">
                            <label>Description *</label>
                            <textarea
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.codeChallenges.${codeIndex}.description`, {
                                required: "Challenge description is required"
                              })}
                              placeholder="Describe the coding challenge"
                              rows={3}
                            />
                          </div>

                          <div className="form-group">
                            <label>Sample Input</label>
                            <textarea
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.codeChallenges.${codeIndex}.sampleInput`)}
                              placeholder="Enter sample input"
                              rows={2}
                            />
                          </div>

                          <div className="form-group">
                            <label>Sample Output</label>
                            <textarea
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.codeChallenges.${codeIndex}.sampleOutput`)}
                              placeholder="Enter expected output"
                              rows={2}
                            />
                          </div>

                          <div className="form-group">
                            <label>Language</label>
                            <select
                              {...register(`topics.${topicIndex}.lessons.${lessonIndex}.codeChallenges.${codeIndex}.language`)}
                            >
                              <option value="python">Python</option>
                              <option value="javascript">JavaScript</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Review Section */}
                    <div className="form-group">
                      <label>Review Content * <CheckCircle size={16} /></label>
                      <textarea
                        {...register(`topics.${topicIndex}.lessons.${lessonIndex}.review`, {
                          required: "Review content is required"
                        })}
                        placeholder="Enter lesson review and summary"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Section */}
        <div className="form-actions">
          {submitError && (
            <div className="error-message">
              <pre>{submitError}</pre>
            </div>
          )}
          
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Course..." : "Create Course"}
          </Button>
          
          <Button
            type="button"
            onClick={() => navigate("/admin/courses")}
            variant="outline"
            loading={false}
            disabled={false}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCourse;
