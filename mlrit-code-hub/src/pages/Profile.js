import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  isSameMonth,
} from "date-fns";
import "./Profile.css";
import { FaUserCircle, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { SiLeetcode, SiCodechef, SiGithub, SiHackerrank } from 'react-icons/si';

const REQUIRED_FIELDS = [
  "name", "email", "college", "year", "department", "rollNumber", "dob", "gender"
];

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({ name: "", email: "" });
  const [previewPic, setPreviewPic] = useState("");
  const [loading, setLoading] = useState(true);
  const [submissionsData, setSubmissionsData] = useState({});
  const [showProfileNotification, setShowProfileNotification] = useState(false);
  const [profileUpdateForm, setProfileUpdateForm] = useState({
    name: "",
    email: "",
    college: "",
    year: "",
    department: "",
    rollNumber: "",
    dob: "",
    gender: "",
    codingProfiles: {
      leetcode: "",
      codechef: "",
      github: ""
    }
  });
  const [stats, setStats] = useState({ totalSolved: 0, totalScore: 0, rank: null });
  const [editPersonal, setEditPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    college: "",
    year: "",
    department: "",
    rollNumber: "",
    dob: "",
    gender: ""
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
      setProfileUpdateForm({
        name: user.name || "",
        email: user.email || "",
        college: user.college || "",
        year: user.year ? String(user.year) : "",
        department: user.department || "",
        rollNumber: user.rollNumber || "",
        dob: user.dob ? user.dob.slice(0, 10) : "",
        gender: user.gender || "",
        codingProfiles: {
          leetcode: user.codingProfiles?.leetcode || "",
          codechef: user.codingProfiles?.codechef || "",
          github: user.codingProfiles?.github || ""
        }
      });
      setPersonalForm({
        name: user.name || "",
        email: user.email || "",
        college: user.college || "",
        year: user.year ? String(user.year) : "",
        department: user.department || "",
        rollNumber: user.rollNumber || "",
        dob: user.dob ? user.dob.slice(0, 10) : "",
        gender: user.gender || ""
      });
      setLoading(false);
      fetchSubmissionsData();
      fetchStats();
      // Check for incomplete profile
      const incomplete = REQUIRED_FIELDS.some(
        (field) => !user[field] || user[field] === ""
      );
      setShowProfileNotification(incomplete);
    }
  }, [user]);

  const fetchSubmissionsData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/submissions/last-6-months", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissionsData(res.data);
    } catch (err) {
      console.error("Error fetching submissions data:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Find this user in the leaderboard
      const entry = res.data.find((entry) => entry.email === user.email);
      if (entry) {
        setStats({
          totalSolved: entry.totalSolved,
          totalScore: entry.totalScore,
          rank: entry.rank
        });
      }
    } catch (err) {
      // fallback: no stats
    }
  };

  const getColor = (submissions) => {
    if (!submissions) return "#e5e7eb";
    if (submissions <= 2) return "#a7f3d0";
    if (submissions <= 5) return "#34d399";
    return "#10b981";
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      alert("Profile updated");
    } catch {
      alert("Update failed");
    }
  };

  const handleProfileUpdateFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("codingProfiles.")) {
      const key = name.split(".")[1];
      setProfileUpdateForm((prev) => ({
        ...prev,
        codingProfiles: { ...prev.codingProfiles, [key]: value }
      }));
    } else {
      setProfileUpdateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = { ...profileUpdateForm };
      if (payload.year) payload.year = Number(payload.year);
      const res = await axios.put("http://localhost:5000/api/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setShowProfileNotification(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Profile update failed");
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewPic(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/profile/upload-pic", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({ ...prev, profilePic: res.data.url }));
    } catch {
      alert("Image upload failed");
    }
  };

  const generateCalendar = () => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 6);
    const start = startOfWeek(startDate, { weekStartsOn: 0 });
    const end = endOfWeek(endDate, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start, end });
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    return weeks;
  };

  const handleEditPersonal = () => setEditPersonal(true);
  const handleCancelPersonal = () => {
    setEditPersonal(false);
    setPersonalForm({
      name: user.name || "",
      email: user.email || "",
      college: user.college || "",
      year: user.year ? String(user.year) : "",
      department: user.department || "",
      rollNumber: user.rollNumber || "",
      dob: user.dob ? user.dob.slice(0, 10) : "",
      gender: user.gender || ""
    });
  };
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSavePersonal = async () => {
    try {
      const token = localStorage.getItem("token");
      // Merge personalForm and codingProfiles for update
      const payload = {
        ...personalForm,
        codingProfiles: {
          leetcode: profileUpdateForm.codingProfiles.leetcode,
          codechef: profileUpdateForm.codingProfiles.codechef,
          github: profileUpdateForm.codingProfiles.github
        }
      };
      if (payload.year) payload.year = Number(payload.year);
      const res = await axios.put("http://localhost:5000/api/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditPersonal(false);
      alert("Personal info updated!");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return <div className="profile">Loading...</div>;

  return (
    <div className="profile-hero-bg">
      <div className="profile-hero-header">
        <div className="profile-hero-gradient" />
        <div className="profile-hero-content container">
          <div className="profile-main-card">
            <div className="profile-avatar-block">
              {user.profilePic ? (
                <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="profile-avatar-img" />
              ) : (
                <FaUserCircle className="profile-avatar-icon" />
              )}
              <input type="file" onChange={handlePicUpload} className="profile-avatar-upload" />
            </div>
            <div className="profile-main-info">
              {editPersonal ? (
                <form className="profile-edit-form" onSubmit={e => { e.preventDefault(); handleSavePersonal(); }}>
                  <div className="profile-main-row">
                    <label>Name</label>
                    <input name="name" value={personalForm.name} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>Email</label>
                    <input name="email" value={personalForm.email} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>Roll No</label>
                    <input name="rollNumber" value={personalForm.rollNumber} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>Date of Birth</label>
                    <input name="dob" type="date" value={personalForm.dob} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>Gender</label>
                    <select name="gender" value={personalForm.gender} onChange={handlePersonalChange} required>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="profile-main-row">
                    <label>College</label>
                    <input name="college" value={personalForm.college} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>Year</label>
                    <input name="year" value={personalForm.year ? String(personalForm.year) : ''} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>Department</label>
                    <input name="department" value={personalForm.department} onChange={handlePersonalChange} required />
                  </div>
                  <div className="profile-main-row">
                    <label>LeetCode</label>
                    <input name="codingProfiles.leetcode" value={profileUpdateForm.codingProfiles.leetcode ? String(profileUpdateForm.codingProfiles.leetcode) : ''} onChange={handleProfileUpdateFormChange} />
                  </div>
                  <div className="profile-main-row">
                    <label>CodeChef</label>
                    <input name="codingProfiles.codechef" value={profileUpdateForm.codingProfiles.codechef ? String(profileUpdateForm.codingProfiles.codechef) : ''} onChange={handleProfileUpdateFormChange} />
                  </div>
                  <div className="profile-main-row">
                    <label>GitHub</label>
                    <input name="codingProfiles.github" value={profileUpdateForm.codingProfiles.github ? String(profileUpdateForm.codingProfiles.github) : ''} onChange={handleProfileUpdateFormChange} />
                  </div>
                  <div className="profile-main-row" style={{ gap: '1rem' }}>
                    <button type="submit" className="profile-main-edit">Save</button>
                    <button type="button" className="profile-main-edit" onClick={handleCancelPersonal}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-main-row">
                    <span className="profile-main-name">{user.name}</span>
                    <span className="profile-main-status"><FaCheckCircle style={{ color: 'var(--mlrit-purple)' }} /> Published</span>
                    <button className="profile-main-edit" onClick={handleEditPersonal}><FaEdit /> Edit</button>
                  </div>
                  <div className="profile-main-row profile-main-meta">
                    <span>Roll No: <b>{user.rollNumber}</b></span>
                    <span>Year: <b>{user.year ? String(user.year) : ''}</b></span>
                    <span>Dept: <b>{user.department}</b></span>
                    <span>College: <b>{user.college}</b></span>
                  </div>
                  <div className="profile-main-row profile-main-meta">
                    <span>Email: <b>{user.email}</b></span>
                    <span>Gender: <b>{user.gender}</b></span>
                    <span>DOB: <b>{user.dob ? user.dob.slice(0, 10) : '-'}</b></span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container profile-content-grid">
        {/* Platform Stats Card */}
        <div className="profile-section-card profile-stats-card">
          <div className="profile-section-header">Platform Stats</div>
          <div className="profile-stats-grid">
            <div className="profile-stat-block">
              <span className="profile-stat-label">Problems Solved</span>
              <span className="profile-stat-value">{stats.totalSolved}</span>
            </div>
            <div className="profile-stat-block">
              <span className="profile-stat-label">Total Score</span>
              <span className="profile-stat-value">{stats.totalScore}</span>
            </div>
            <div className="profile-stat-block">
              <span className="profile-stat-label">Rank</span>
              <span className="profile-stat-value">{stats.rank ? `#${stats.rank}` : '-'}</span>
            </div>
          </div>
        </div>
        {/* Coding Profiles Card */}
        <div className="profile-section-card profile-coding-card">
          <div className="profile-section-header">Coding Profiles</div>
          <div className="profile-coding-grid">
            <div className="profile-coding-block">
              <SiLeetcode className="profile-coding-icon leetcode" />
              <span>LeetCode</span>
              <span>{user.codingProfiles?.leetcode ? (<a href={`https://leetcode.com/${user.codingProfiles.leetcode}`} target="_blank" rel="noopener noreferrer">{user.codingProfiles.leetcode}</a>) : '-'}</span>
            </div>
            <div className="profile-coding-block">
              <SiCodechef className="profile-coding-icon codechef" />
              <span>CodeChef</span>
              <span>{user.codingProfiles?.codechef ? (<a href={`https://www.codechef.com/users/${user.codingProfiles.codechef}`} target="_blank" rel="noopener noreferrer">{user.codingProfiles.codechef}</a>) : '-'}</span>
            </div>
            <div className="profile-coding-block">
              <SiHackerrank className="profile-coding-icon hackerrank" />
              <span>HackerRank</span>
              <span>-</span>
            </div>
            <div className="profile-coding-block">
              <SiGithub className="profile-coding-icon github" />
              <span>GitHub</span>
              <span>{user.codingProfiles?.github ? (<a href={`https://github.com/${user.codingProfiles.github}`} target="_blank" rel="noopener noreferrer">{user.codingProfiles.github}</a>) : '-'}</span>
            </div>
          </div>
        </div>
        {/* Submissions Heatmap Card */}
        <div className="profile-section-card profile-activity-card">
          <div className="profile-section-header">Submissions Heat Map (Last 6 Months)</div>
          <div className="profile-section-fields">
            <div className="submissions-heatmap leetcode-profile-heatmap">
              <div className="heatmap-container">
                <div className="day-labels">
                  {["Mon", "Wed", "Fri"].map((day, i) => (
                    <div key={i} className="day-label">{day}</div>
                  ))}
                </div>
                <div className="heatmap-scroll">
                  <div className="month-labels">
                    {generateCalendar().map((week, index) => {
                      const firstDay = week[0];
                      return (
                        <div key={index} className="month-label">
                          {(index === 0 || !isSameMonth(firstDay, week[6])) ? format(firstDay, "MMM") : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="heatmap-grid">
                    {generateCalendar().map((week, weekIndex) => (
                      <div key={weekIndex} className="heatmap-column">
                        {week.map((day, i) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          const count = submissionsData[dateStr] || 0;
                          return (
                            <div
                              key={i}
                              className="heatmap-cell"
                              title={`${dateStr}: ${count} submissions`}
                              style={{ backgroundColor: getColor(count) }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;