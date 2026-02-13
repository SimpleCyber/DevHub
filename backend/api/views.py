import requests
from django.http import JsonResponse
import os
import google.generativeai as genai
from gtts import gTTS
from io import BytesIO
import base64
from dotenv import load_dotenv

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging



# Load environment variables from a .env file
load_dotenv()


GIT_HUB_KEY = os.getenv("GIT_HUB_KEY")
LINKEDIN_API_KEY = os.getenv("LINKEDIN_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API Key (Directly using the provided key)
genai.configure(api_key=GEMINI_API_KEY)


def fetch_leetcode_profile(request, username):

    url = "https://leetcode.com/graphql/"

    query = """
    query userProfile($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                realName
                aboutMe
                company
                school
                websites
                countryName
                userAvatar
                reputation
                ranking
            }
            badges {
                name
                icon
                displayName
            }
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                    submissions
                }
            }
        }
        allQuestionsCount {
            difficulty
            count
        }
        recentSubmissionList(username: $username) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
        }
    }
    """
    # Variables for the GraphQL query
    variables = {"username": username}

    try:
        # Send POST request to LeetCode GraphQL API
        response = requests.post(url, json={"query": query, "variables": variables})
        response.raise_for_status()
        response_data = response.json()
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)
    except ValueError:
        return JsonResponse({"error": "Failed to parse JSON response"}, status=500)

    data = response_data.get("data", {})
    matched_user = data.get("matchedUser")

    if matched_user:
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "User not found"}, status=404)


def fetch_github_data(request, username):
    base_url = "https://api.github.com"
    headers = {"Authorization": GIT_HUB_KEY}

    # Fetch Profile Data
    user_url = f"{base_url}/users/{username}"
    user_response = requests.get(user_url, headers=headers)
    if user_response.status_code != 200:
        return JsonResponse(
            {"error": "GitHub user not found"}, status=user_response.status_code
        )
    user_data = user_response.json()

    # Extract Profile Info
    profile = {
        "avatar": user_data.get("avatar_url"),
        "username": user_data.get("login"),
        "full_name": user_data.get("name"),
        "email": user_data.get("email"),
        "location": user_data.get("location"),
        "followers": user_data.get("followers"),
        "following": user_data.get("following"),
        "public_repos": user_data.get("public_repos"),
        "bio":user_data.get("bio"),
    }

    # Fetch Repositories
    repos_url = f"{base_url}/users/{username}/repos"
    repos_response = requests.get(
        repos_url, headers=headers, params={"sort": "created", "per_page": 100}
    )
    repos_data = repos_response.json()

    # Filter Top 5 Non-Forked Repositories
    top_repos = []
    for repo in repos_data:
        if not repo.get("fork") and len(top_repos) < 4:
            top_repos.append(
                {
                    "name": repo.get("name"),
                    "html_url": repo.get("html_url"),
                    "language": repo.get("language"),
                    "topics": repo.get("topics"),
                    "created_at": repo.get("created_at"),
                    "updated_at": repo.get("updated_at"),
                }
            )

    # Fetch Contributions and Commit Activity
    contribution_stats = []
    for repo in top_repos:
        owner = username
        repo_name = repo["name"]
        stats_url = f"{base_url}/repos/{owner}/{repo_name}/stats/contributors"
        stats_response = requests.get(stats_url, headers=headers)
        if stats_response.status_code == 200:
            repo_stats = stats_response.json()
            for contributor in repo_stats:
                if contributor.get("author", {}).get("login") == username:
                    contribution_stats.append(
                        {
                            "repo": repo_name,
                            "total": contributor.get("total"),
                            "weeks": contributor.get("weeks"),
                        }
                    )

    # Fetch Detailed Repository Statistics for Commits, PRs, Issues
    detailed_stats = []
    for repo in top_repos:
        owner = username
        repo_name = repo["name"]

        # Commits
        commits_url = f"{base_url}/repos/{owner}/{repo_name}/commits"
        commits_response = requests.get(
            commits_url, headers=headers, params={"per_page": 5}
        )
        commits = commits_response.json() if commits_response.status_code == 200 else []

        # Pull Requests
        prs_url = f"{base_url}/repos/{owner}/{repo_name}/pulls"
        prs_response = requests.get(
            prs_url, headers=headers, params={"state": "all", "per_page": 5}
        )
        pull_requests = prs_response.json() if prs_response.status_code == 200 else []

        # Issues
        issues_url = f"{base_url}/repos/{owner}/{repo_name}/issues"
        issues_response = requests.get(
            issues_url, headers=headers, params={"state": "all", "per_page": 5}
        )
        issues = issues_response.json() if issues_response.status_code == 200 else []

        detailed_stats.append(
            {
                "repo": repo_name,
                "commits": commits,
                "pull_requests": pull_requests,
                "issues": issues,
            }
        )

    # Combine All Data
    result = {
        "profile": profile,
        "top_repositories": top_repos,
        "contributions": contribution_stats,
        "detailed_statistics": detailed_stats,
    }

    return JsonResponse(result, safe=False)


def fetch_linkedin_data(request, username):
    url = "https://fresh-linkedin-profile-data.p.rapidapi.com/enrich-lead"

    # 🌿🌿🌿 Determine whether input is a URL or username
    if username.startswith("http"):
        linkedin_url = username
    else:
        linkedin_url = f"https://www.linkedin.com/in/{username}/"

    querystring = {
        "linkedin_url": linkedin_url,
        "include_skills": "true",
        "include_certifications": "false",
        "include_publications": "false",
        "include_honors": "false",
        "include_volunteers": "false",
        "include_projects": "false",
        "include_patents": "false",
        "include_courses": "false",
        "include_organizations": "false",
        "include_profile_status": "false",
        "include_company_public_url": "false"
    }

    headers = {
        "x-rapidapi-key": "63e87f7f8bmsh602fffeb8cef799p15e30ejsn889cc10bbe2b",
        "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
    }

    # 🌿🌿🌿 Perform API request
    try:
        response = requests.get(url, headers=headers, params=querystring)
    except requests.RequestException as e:
        return JsonResponse(
            {"error": f"An error occurred while making the request: {str(e)}"},
            status=500,
        )

    # 🌿🌿🌿 Handle response status codes
    if response.status_code == 200:
        try:
            api_data = response.json()
            data = api_data.get('data') # API returns wrapped data
            if not data:
                return JsonResponse({"error": "No data found in API response"}, status=404)
                
        except ValueError:
            return JsonResponse(
                {"error": "Invalid JSON response received from API"}, status=500
            )

        # 🌿🌿🌿 Extract required data & Map to schema
        
        # Helper to join location parts
        location_parts = [data.get('city'), data.get('country')]
        location = ", ".join(filter(None, location_parts)) or 'Remote'
        
        # Parse skills - handle if string or list
        raw_skills = data.get('skills', [])
        skills_list = []
        if isinstance(raw_skills, list):
             skills_list = [{"Name": s.get('name') if isinstance(s, dict) else s, "PassedSkillAssessment": False} for s in raw_skills]
        elif isinstance(raw_skills, str):
             if raw_skills.strip():
                 # Split by comma if it's a comma-separated string
                 if "," in raw_skills:
                     skills_list = [{"Name": s.strip(), "PassedSkillAssessment": False} for s in raw_skills.split(",")]
                 else:
                     skills_list = [{"Name": raw_skills.strip(), "PassedSkillAssessment": False}]
        
        result = {
            "Username": data.get("full_name") or username,
            "ProfilePicture": data.get("profile_image_url") or "",
            "Bio": data.get("summary"),
            "Headline": data.get("headline"),
            "Location": location,
            "Education": [
                {
                    "SchoolName": edu.get("school"),
                    "Degree": edu.get("degree"),
                    "FieldOfStudy": edu.get("field_of_study"),
                    "Grade": None, # Not provided by this API usually
                    "StartYear": edu.get("start_year"),
                    "StartMonth": edu.get("start_month"),
                    "EndYear": edu.get("end_year"),
                    "EndMonth": edu.get("end_month"),
                    "URL": edu.get("school_linkedin_url"),
                }
                for edu in data.get("educations", [])
            ],
            "Position": [
                {
                    "CompanyName": pos.get("company"),
                    "employmentType": pos.get("title"), # Mapping title roughly
                    "Industry": None,
                    "Location": pos.get("location"),
                    "StartYear": pos.get("start_year"),
                    "StartMonth": pos.get("start_month"),
                    "EndYear": pos.get("end_year"),
                    "EndMonth": pos.get("end_month"),
                    "CompanyLogo": pos.get("company_logo_url"),
                    "Description": pos.get("description"),
                }
                for pos in data.get("experiences", [])
            ],
            "Skills": skills_list
        }

        return JsonResponse(result, safe=False)
    else:
        return JsonResponse(
            {
                "error": f"Failed to fetch data. Status code: {response.status_code}, Response: {response.text}"
            },
            status=500,
        )


logger = logging.getLogger(__name__)



def generate_html_email(job_details, company_info, skills, recipient):
    """
    Generate HTML email content based on job details
    
    Args:
        job_details (dict): Job-related information
        company_info (dict): Company-related information
        skills (list): Required skills for the job
        recipient (dict): Recipient information
        
    Returns:
        str: HTML content for the email
    """
    # CSS styles
    css_styles = """
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    body {
        font-family: 'Poppins', Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
    }
    
    .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .header {
        padding: 28px 24px;
        text-align: center;
        color: white;
    }
    
    .header h1 {
        margin: 0;
        font-weight: 600;
        font-size: 26px;
    }
    
    .header h2 {
        font-weight: 400;
        margin-top: 10px;
        font-size: 18px;
        opacity: 0.9;
    }
    
    .content {
        padding: 30px;
    }
    
    .company-logo {
        text-align: center;
        margin-bottom: 25px;
    }
    
    .info-card {
        background-color: #ffffff;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 25px;
        overflow: hidden;
        border: 1px solid #eaeaea;
    }
    
    .card-header {
        background-color: #f8f9fa;
        padding: 15px 20px;
        border-bottom: 1px solid #eaeaea;
    }
    
    .card-header h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    }
    
    .card-body {
        padding: 0;
    }
    
    .detail-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .detail-table tr {
        border-bottom: 1px solid #eaeaea;
    }
    
    .detail-table tr:last-child {
        border-bottom: none;
    }
    
    .detail-table td {
        padding: 12px 20px;
    }
    
    .detail-table td:first-child {
        font-weight: 500;
        color: #555;
        width: 40%;
    }
    
    .detail-table td:last-child {
        color: #333;
    }
    
    .skills-container {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .skill-badge {
        background-color: #e8f0fe;
        color: #4285f4;
        border-radius: 50px;
        padding: 6px 14px;
        font-size: 14px;
        font-weight: 500;
        display: inline-block;
    }
    
    .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #4285f4, #0d6efd);
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 600;
        font-size: 16px;
        text-align: center; 
        margin-top: 10px;
        box-shadow: 0 4px 8px rgba(66, 133, 244, 0.25);
        transition: all 0.3s ease;
    }
    
    .cta-button:hover {
        background: linear-gradient(135deg, #0d6efd, #0a58ca);
        box-shadow: 0 6px 12px rgba(66, 133, 244, 0.35);
        transform: translateY(-2px);
    }
    
    .card-section {
        margin-bottom: 30px;
    }
    
    .divider {
        height: 1px;
        background-color: #eaeaea;
        margin: 25px 0;
    }
    
    .key-info {
        text-align: center;
        margin: 20px 0 30px;
        background-color: #f8f9fa;
        border-radius: 6px;
        padding: 15px;
    }
    
    .key-info-item {
        display: inline-block;
        margin: 0 12px;
        text-align: center;
    }
    
    .key-info-item .label {
        font-size: 13px;
        color: #777;
        margin-bottom: 5px;
    }
    
    .key-info-item .value {
        font-weight: 600;
        color: #333;
        font-size: 16px;
    }
    
    .footer {
        padding: 20px;
        text-align: center;
        background-color: #f8f9fa;
        border-top: 1px solid #eaeaea;
        font-size: 13px;
        color: #777;
    }
    
    .social-links {
        margin: 15px 0;
    }
    
    .social-icon {
        display: inline-block;
        width: 32px;
        height: 32px;
        background-color: #e8e8e8;
        border-radius: 50%;
        margin: 0 5px;
        line-height: 32px;
        text-align: center;
    }
    
    .company-info {
        margin-top: 10px;
        font-size: 12px;
    }
    
    .section-title {
        color: #333;
        margin-top: 0;
        margin-bottom: 15px;
        font-weight: 600;
        font-size: 18px;
    }
    
    .action-center {
        text-align: center;
        margin: 30px 0;
    }
    
    @media only screen and (max-width: 600px) {
        .content {
            padding: 20px;
        }
        
        .key-info-item {
            display: flex;
            align-items: flex-start; 
            gap: 10px;
            margin: 10px 0;
            line-height: 1.5;
        }
    }
    """
    
    # Generate skills HTML from the skills list
    skills_html = ""
    for skill in skills:
        skills_html += f'<span class="skill-badge">{skill}</span>\n'
    
    # Build the HTML content with variables
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevHub: Exciting Internship Opportunity</title>
        <style>
            {css_styles}
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header Section -->
            <div class="header">
                <h1>✨ DevHub Internship Alert</h1>
                <h2>{job_details.get('role', 'Job')} Opportunity at {company_info.get('name', 'Company')}</h2>
            </div>
            <h3>Hey "{recipient.get('name', 'Candidate')}" unique opportunity is waiting for you</h3>
            
            <!-- Content Section -->
            <div class="content">
                
                <!-- Key Information -->
                <div class="key-info" style="background-color: #e6f4ea; border-left: 4px solid #4caf50; padding: 12px 15px; margin-bottom: 25px; border-radius: 2px;">
                    <div class="key-info-item">
                        <div class="label">Location : </div>
                        <div class="value">{job_details.get('location', 'N/A')}</div>
                    </div>
                    <div class="key-info-item">
                        <div class="label">Salary : </div>
                        <div class="value">{job_details.get('salary_range', 'N/A')}</div>
                    </div>
                    <div class="key-info-item">
                        <div class="label">Job Type :</div>
                        <div class="value">{job_details.get('employment_type', 'N/A')}</div>
                    </div>
                </div>

                <!-- Application Deadline -->
                <div style="background-color: #fff4e5; border-left: 4px solid #ff9800; padding: 12px 15px; margin-bottom: 25px; border-radius: 2px;">
                    <p style="margin: 0; color: #ad5700; font-weight: 500;">
                        Application Deadline: {job_details.get('deadline', 'N/A')}
                    </p>
                </div>

                <!-- Job Details Card -->
                <div class="info-card card-section">
                    <div class="card-header">
                        <h3>Job Details</h3>
                    </div>
                    <div class="card-body">
                        <table class="detail-table">
                            <tr class="highlight">
                                <td>Job Role</td>
                                <td>{job_details.get('role', 'N/A')}</td>
                            </tr>
                            <tr>
                                <td>Salary Range</td>
                                <td>{job_details.get('salary_range', 'N/A')} LPA</td>
                            </tr>
                            <tr class="highlight">
                                <td>Experience Required</td>
                                <td>{job_details.get('experience', 'N/A')}</td>
                            </tr>
                            <tr>
                                <td>Batch Years</td>
                                <td>{job_details.get('batch_years', 'N/A')}</td>
                            </tr>
                            <tr class="highlight">
                                <td>Location</td>
                                <td>{job_details.get('location', 'N/A')}, {job_details.get('state', 'N/A')}</td>
                            </tr>
                            <tr>
                                <td>Job Type</td>
                                <td>{job_details.get('job_type', 'N/A')}</td>
                            </tr>
                            <tr class="highlight">
                                <td>Employment Type</td>
                                <td>{job_details.get('employment_type', 'N/A')}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <!-- Skills Card -->
                <div class="info-card card-section">
                    <div class="card-header">
                        <h3>Technical Skills Required</h3>
                    </div>
                    <div class="card-body" style="padding: 20px;">
                        <div class="skills-container">
                            {skills_html}
                        </div>
                    </div>
                </div>
                
                <!-- About Company Section -->
                <div class="card-section">
                    <h3 class="section-title">About {company_info.get('name', 'Company')}</h3>
                    <p style="color: #555; margin-top: 0;">
                        {company_info.get('description', 'No company description available.')}
                    </p>
                </div>
                
                <div class="divider"></div>
                
                <!-- CTA Section -->
                <div class="action-center">
                    <a href="{job_details.get('apply_url', '#')}" class="cta-button">APPLY NOW</a>
                </div>
                
            </div>
            
            <!-- Footer Section -->
            <div class="footer">
                <div style="font-weight: 600; color: #555; margin-bottom: 5px;">DevHub Internship Platform</div>
                <p style="margin-bottom: 15px;">Connecting talented developers with top opportunities</p>
                
                <div>
                    <a href="mailto:{settings.DEFAULT_FROM_EMAIL}" style="color: #4285f4; text-decoration: none;">{settings.DEFAULT_FROM_EMAIL}</a>
                </div>
                
                <div class="company-info">
                    © {settings.CURRENT_YEAR} DevHub. All rights reserved.<br>
                    Unsubscribe | Privacy Policy | Terms of Service
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content


def send_email_notification(email_config, job_details, company_info, skills, recipient):
    """
    Send email notification about job opportunity
    
    Args:
        email_config (dict): Email configuration details
        job_details (dict): Job-related information
        company_info (dict): Company-related information
        skills (list): Required skills for the job
        recipient (dict): Recipient information
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create the email message
        message = MIMEMultipart()
        message["From"] = email_config.get("sender", settings.DEFAULT_FROM_EMAIL)
        message["To"] = recipient.get("email")
        message["Subject"] = email_config.get("subject", f"Job Opportunity: {job_details.get('role')} at {company_info.get('name')}")
        
        # Generate and attach the HTML body
        html_body = generate_html_email(job_details, company_info, skills, recipient)
        message.attach(MIMEText(html_body, "html"))
        
        # Connect to email server and send
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.send_message(message)
            
        logger.info(f"Email sent successfully to {recipient.get('email')}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {recipient.get('email')}: {str(e)}")
        return False


@csrf_exempt
@require_http_methods(["POST"])
def send_job_notification(request):
    """
    Django view to send job notifications
    
    Request body format:
    {
        "email_config": {
            "subject": "Custom email subject"
        },
        "job_details": {
            "role": "Data Analysis",
            "company": "Yash Technologies",
            "location": "Bangalore",
            "state": "Karnataka",
            "salary_range": "₹3L - ₹6L",
            "experience": "0-2 years",
            "batch_years": "2023, 2024",
            "job_type": "Fresher",
            "employment_type": "Full Time",
            "deadline": "May 20, 2025",
            "apply_url": "https://example.com/apply"
        },
        "company_info": {
            "name": "Yash Technologies",
            "description": "Company description..."
        },
        "skills": ["Python", "SQL", "Langchain", "OpenAI"],
        "recipients": [
            {
                "name": "John Doe",
                "email": "john@example.com"
            },
            {
                "name": "Jane Smith",
                "email": "jane@example.com"
            }
        ]
    }
    """
    try:
        # Parse request body
        data = json.loads(request.body)
        
        # Extract data
        email_config = data.get("email_config", {})
        job_details = data.get("job_details", {})
        company_info = data.get("company_info", {})
        skills = data.get("skills", [])
        recipients = data.get("recipients", [])
        
        # Validate required fields
        if not job_details or not company_info or not recipients:
            return JsonResponse({"success": False, "message": "Missing required data"}, status=400)
        
        # Validate each recipient has an email
        invalid_recipients = [r for r in recipients if not r.get("email")]
        if invalid_recipients:
            return JsonResponse({"success": False, "message": "Some recipients are missing email addresses"}, status=400)
        
        # Send emails to all recipients
        results = []
        for recipient in recipients:
            success = send_email_notification(email_config, job_details, company_info, skills, recipient)
            results.append({
                "email": recipient.get("email"),
                "success": success
            })
        
        # Calculate success rate
        success_count = sum(1 for r in results if r["success"])
        
        return JsonResponse({
            "success": True, 
            "message": f"Sent {success_count} of {len(recipients)} emails successfully",
            "results": results
        })
        
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON data"}, status=400)
    except Exception as e:
        logger.error(f"Error sending job notifications: {str(e)}")
        return JsonResponse({"success": False, "message": str(e)}, status=500)