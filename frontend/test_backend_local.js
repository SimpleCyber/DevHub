const axios = require("axios");

async function testBackendLocal(username) {
  const url = `http://127.0.0.1:8000/api/linkedin/${username}/`;
  console.log(`Testing backend API at: ${url}`);

  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log("\n--- Backend Response Data ---");
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("\nAPI returned an error:", data.error);
    } else {
      console.log("\nSuccess! Data structure looks correct.");
      // Basic validation
      if (data.Username === username) console.log("✅ Username matches");
      if (data.Skills && Array.isArray(data.Skills))
        console.log(`✅ Skills found: ${data.Skills.length}`);
      if (data.Position && Array.isArray(data.Position))
        console.log(`✅ Positions found: ${data.Position.length}`);
      if (data.Education && Array.isArray(data.Education))
        console.log(`✅ Education found: ${data.Education.length}`);
    }
  } catch (error) {
    console.error("\nError fetching from backend:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testBackendLocal("yadav-satyam04");
