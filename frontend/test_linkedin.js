const axios = require("axios");

async function testLinkedIn(username) {
  try {
    const options = {
      method: "GET",
      url: "https://fresh-linkedin-profile-data.p.rapidapi.com/enrich-lead",
      params: {
        linkedin_url: `https://www.linkedin.com/in/${username}/`,
        include_skills: "true",
        include_certifications: "false",
        include_publications: "false",
        include_honors: "false",
        include_volunteers: "false",
        include_projects: "false",a
        include_patents: "false",
        include_courses: "false",
        include_organizations: "false",
        include_profile_status: "false",
        include_company_public_url: "false",
      },
      headers: {
        "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
        "x-rapidapi-key": "63e87f7f8bmsh602fffeb8cef799p15e30ejsn889cc10bbe2b",
      },
    };

    console.log(`Fetching data for ${username}...`);
    const response = await axios.request(options);
    const data = response.data.data;

    if (!data) {
      console.log("No data found");
      return;
    }

    console.log("Raw Data fetched successfully.");

    // Transformation Logic
    const transformedData = {
      Username: data.full_name || username,
      ProfilePicture: data.profile_image_url || "",
      Location:
        [data.city, data.country].filter(Boolean).join(", ") || "Remote",
      Skills: (data.skills || []).map((skill) => ({
        Name: skill.name || skill,
        PassedSkillAssessment: false,
      })),
      Position: (data.experiences || []).map((exp) => ({
        CompanyName: exp.company,
        CompanyLogo: exp.company_logo_url || "",
        employmentType: exp.title,
        StartYear: exp.start_year,
        StartMonth: exp.start_month,
        EndYear: exp.end_year,
        EndMonth: exp.end_month,
        Location: exp.location,
        Description: exp.description,
      })),
      Education: (data.educations || []).map((edu) => ({
        SchoolName: edu.school,
        FieldOfStudy: `${edu.degree || ""} ${edu.field_of_study || ""}`.trim(),
        StartYear: edu.start_year,
        StartMonth: edu.start_month,
        EndYear: edu.end_year,
        EndMonth: edu.end_month,
        URL: edu.school_linkedin_url,
      })),
    };

    console.log("\n--- Transformed Data Output ---");
    console.log(JSON.stringify(transformedData, null, 2));
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message,
    );
  }
}

// Run the test
testLinkedIn("yadav-satyam04");
