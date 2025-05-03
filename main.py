import requests
import json

def example_api_call():
    url = "https://devhub1.vercel.app/api/send-job-notification/"
    
    payload = {
        "email_config": {
            "subject": "Exciting Internship: Data Analysis at Yash Technologies"
        },
        "job_details": {
            "role": "Data Analysis",
            "location": "Bangalore",
            "state": "Karnataka",
            "salary_range": "₹3L - ₹6L",
            "experience": "0-2 years",
            "batch_years": "2023, 2024",
            "job_type": "Fresher",
            "employment_type": "Full Time",
            "deadline": "May 20, 2025",
            "apply_url": "https://devhub1.vercel.app"
        },
        "company_info": {
            "name": "Yash Technologies",
            "description": "Yash Technologies is a leading technology consulting and integration partner helping businesses accelerate digital transformation. With a focus on innovation and excellence, they provide a dynamic environment for fresh talent to grow."
        },
        "skills": ["Python", "SQL", "Langchain", "OpenAI", "Django", "DRF", "Tensorflow", "Pytorch"],
        "recipients": [
            {
                "name": "Satyam",
                "email": "satyamyadav9uv@gmail.com"
            },
            {
                "name": "Another Candidate",
                "email": "another@example.com"
            }
        ]
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    
    print(response.status_code)
    print(response.json())