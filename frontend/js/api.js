// Base URL of your backend
const API_URL = 'http://localhost:5000/api';

// ─────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────

// Register Candidate
async function registerCandidate(data) {
  const res = await fetch(`${API_URL}/auth/register/candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Register Company
async function registerCompany(data) {
  const res = await fetch(`${API_URL}/auth/register/company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Login
async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// ─────────────────────────────────────────
// JOBS FUNCTIONS
// ─────────────────────────────────────────

// Get all approved jobs
async function getAllJobs(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/jobs?${params}`);
  return res.json();
}

// Get company's own jobs
async function getMyJobs() {
  const res = await fetch(`${API_URL}/jobs/my-jobs`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Post a new job
async function postJob(data) {
  const res = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Apply for a job
async function applyForJob(jobId, coverLetter = '') {
  const res = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ coverLetter })
  });
  return res.json();
}

// Get my applications (candidate)
async function getMyApplications() {
  const res = await fetch(`${API_URL}/applications/my-applications`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Approve or reject job (admin)
async function approveJob(jobId, status) {
  const res = await fetch(`${API_URL}/jobs/${jobId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}

// Delete job
async function deleteJob(jobId) {
  const res = await fetch(`${API_URL}/jobs/${jobId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

// Save token after login
function saveToken(token) {
  localStorage.setItem('token', token);
}

// Get saved token
function getToken() {
  return localStorage.getItem('token');
}

// Save user info
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get saved user
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Logout - clear everything
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Check if logged in
function isLoggedIn() {
  return !!getToken();
}

// Redirect if not logged in
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}