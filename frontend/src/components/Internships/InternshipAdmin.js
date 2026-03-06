import React, { useState, useEffect } from "react";
import { db } from "../utils/firebaseStorage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const InternshipAdmin = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    jobRole: "",
    salaryRange: "",
    experience: "",
    batchYears: "",
    jobType: "",
    employmentType: "",
    location: "",
    imageUrl: "",
    applyLink: "",
    skills: "",
    responsibilities: "",
    description: "",
    postDate: new Date().toISOString(),
  });

  const [internships, setInternships] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "internships"));
        const fetchedInternships = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by postDate in descending order (latest first)
        const sortedInternships = fetchedInternships.sort(
          (a, b) => new Date(b.postDate) - new Date(a.postDate),
        );

        setInternships(sortedInternships);
      } catch (error) {
        console.error("Error fetching internships: ", error);
      }
    };

    fetchInternships();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      adminCredentials.username === process.env.adminCredentials.username &&
      adminCredentials.password === process.env.REACT_APP_ADMIN_PASSWORD
    ) {
      setIsAdmin(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const internshipData = {
        ...formData,
        skills: formData.skills.split(",").map((skill) => skill.trim()),
        responsibilities: formData.responsibilities
          .split(",")
          .map((resp) => resp.trim()),
      };

      if (editId) {
        await updateDoc(doc(db, "internships", editId), internshipData);
        alert("Internship updated successfully!");
        setInternships(
          internships.map((item) =>
            item.id === editId ? { id: editId, ...internshipData } : item,
          ),
        );
        setEditId(null);
      } else {
        const docRef = await addDoc(
          collection(db, "internships"),
          internshipData,
        );
        alert("Internship added successfully!");
        setInternships([...internships, { id: docRef.id, ...internshipData }]);
      }

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);
      const formattedDeadline = deadline.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const profilesSnapshot = await getDocs(collection(db, "profiles"));
      const recipients = profilesSnapshot.docs
        .map((doc) => doc.data())
        .filter((profile) => profile.email && profile.name)
        .map((profile) => ({
          name: profile.name,
          email: profile.email,
        }));

      const notificationPayload = {
        email_config: {
          subject: `Exciting Opportunity: ${internshipData.jobRole} at ${internshipData.companyName}`,
        },
        job_details: {
          role: internshipData.jobRole,
          location: internshipData.location,
          state: internshipData.location.split(",")[1]?.trim() || "",
          salary_range: internshipData.salaryRange,
          experience: internshipData.experience,
          batch_years: internshipData.batchYears,
          job_type: internshipData.jobType,
          employment_type: internshipData.employmentType,
          deadline: formattedDeadline,
          apply_url: internshipData.applyLink,
        },
        company_info: {
          name: internshipData.companyName,
          description:
            internshipData.description ||
            "Exciting opportunity at a great company!",
        },
        skills: internshipData.skills,
        recipients,
      };

      try {
        const response = await fetch(
          "https://devhub-k9dg.onrender.com/api/send-job-notification/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notificationPayload),
          },
        );

        if (!response.ok) throw new Error("Notification failed");
        const result = await response.json();
        console.log("Notification sent:", result);
      } catch (notifyErr) {
        console.error("Notification error:", notifyErr);
      }

      // Reset form
      setFormData({
        companyName: "",
        jobRole: "",
        salaryRange: "",
        experience: "",
        batchYears: "",
        jobType: "",
        employmentType: "",
        location: "",
        imageUrl: "",
        applyLink: "",
        skills: "",
        responsibilities: "",
        description: "",
        postDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error submitting internship: ", error);
      alert("Failed to submit internship");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "internships", id));
      alert("Internship deleted successfully!");
      setInternships(internships.filter((internship) => internship.id !== id));
    } catch (error) {
      console.error("Error deleting internship:", error);
      alert("Failed to delete internship");
    }
  };

  const handleEdit = (internship) => {
    setEditId(internship.id);
    setFormData({
      ...internship,
      skills: internship.skills.join(", "),
      responsibilities: internship.responsibilities.join(", "),
    });
  };

  // Login Form
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={adminCredentials.username}
                onChange={(e) =>
                  setAdminCredentials((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={adminCredentials.password}
                onChange={(e) =>
                  setAdminCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white shadow-2xl rounded-xl p-8 border-t-4 border-blue-500">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Add Internship
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Company Name
                </label>
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
                <label className="block text-gray-700 font-bold mb-2">
                  Job Role
                </label>
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
                <label className="block text-gray-700 font-bold mb-2">
                  Salary Range
                </label>
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
                <label className="block text-gray-700 font-bold mb-2">
                  Experience Required
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Batch Years
                </label>
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
                <label className="block text-gray-700 font-bold mb-2">
                  Job Type
                </label>
                <input
                  type="text"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Employment Type
                </label>
                <input
                  type="text"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Company Logo URL
                </label>
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
              <label className="block text-gray-700 font-bold mb-2">
                Apply Link
              </label>
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
              <label className="block text-gray-700 font-bold mb-2">
                Skills (comma-separated)
              </label>
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
              <label className="block text-gray-700 font-bold mb-2">
                Job Description
              </label>
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

        {/* Internships List Section */}
        <div className="bg-white shadow-2xl rounded-xl p-8 border-t-4 border-green-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Internships
          </h2>
          {internships.length > 0 ? (
            <div className="space-y-4">
              {internships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {internship.companyName} - {internship.jobRole}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {internship.location} | {internship.salaryRange}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(internship)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-300 transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(internship.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300 transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No internships available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipAdmin;
