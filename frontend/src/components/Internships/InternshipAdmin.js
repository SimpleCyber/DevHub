import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebaseStorage';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const InternshipAdmin = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    salaryRange: '',
    experience: '',
    batchYears: '',
    jobType: '',
    employmentType: '',
    location: '',
    imageUrl: '',
    applyLink: '',
    skills: '',
    responsibilities: '',
    description: '',
    postDate: new Date().toISOString(),
  });

  const [internships, setInternships] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });

  // Fetch internships from Firestore
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'internships'));
        const fetchedInternships = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInternships(fetchedInternships);
      } catch (error) {
        console.error('Error fetching internships: ', error);
      }
    };

    fetchInternships();
  }, []);

  // Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminCredentials.username === "satyan" && adminCredentials.password === "satyan") {
      setIsAdmin(true);
    } else {
      alert('Invalid credentials');
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Submit (Add Internship)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const internshipData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        responsibilities: formData.responsibilities.split(',').map(resp => resp.trim()),
      };

      const docRef = await addDoc(collection(db, 'internships'), internshipData);
      alert('Internship added successfully!');

      // Update local state
      setInternships([...internships, { id: docRef.id, ...internshipData }]);

      // Reset form
      setFormData({
        companyName: '',
        jobRole: '',
        salaryRange: '',
        experience: '',
        batchYears: '',
        jobType: '',
        employmentType: '',
        location: '',
        imageUrl: '',
        applyLink: '',
        skills: '',
        responsibilities: '',
        description: '',
        postDate: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error adding internship: ', error);
      alert('Failed to add internship');
    }
  };

  // Handle Delete Internship
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'internships', id));
      alert('Internship deleted successfully!');
      
      // Update local state after deletion
      setInternships(internships.filter(internship => internship.id !== id));
    } catch (error) {
      console.error('Error deleting internship:', error);
      alert('Failed to delete internship');
    }
  };

  // Login Form
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Username</label>
              <input
                type="text"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials(prev => ({
                  ...prev, username: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Password</label>
              <input
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({
                  ...prev, password: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Add Internship</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Job Role</label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Salary Range</label>
              <input
                type="text"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Experience Required</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Batch Years</label>
              <input
                type="text"
                name="batchYears"
                value={formData.batchYears}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="2024, 2025, 2026"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Job Type</label>
              <input
                type="text"
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Employment Type</label>
              <input
                type="text"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Company Logo URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Apply Link</label>
            <input
              type="url"
              name="applyLink"
              value={formData.applyLink}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Skills (comma-separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="React, Node.js, JavaScript"
            />
          </div>
          
         
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="5"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition duration-300"
          >
            Add Internship
          </button>
        </form>
      </div>
    </div>
  

      {/* Display Internships */}
      <div className="max-w-4xl mx-auto mt-12 bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Internships</h2>
        {internships.length > 0 ? (
          <ul>
            {internships.map((internship) => (
              <li key={internship.id} className="flex justify-between items-center border-b py-3">
                <div>
                  <h3 className="text-lg font-bold">{internship.companyName} - {internship.jobRole}</h3>
                  <p className="text-sm text-gray-600">{internship.location} | {internship.salaryRange}</p>
                </div>
                <button onClick={() => handleDelete(internship.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">No internships available.</p>
        )}
      </div>
    </div>
  );
};

export default InternshipAdmin;
