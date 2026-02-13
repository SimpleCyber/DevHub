"""
Test script to check LinkedIn API response locally.
Tests both the deployed backend and the RapidAPI directly.
"""
import requests
import json

USERNAME = "satyam-yada"

# ==============================
# Test 1: Local Backend API
# ==============================
print("=" * 60)
print(f"TEST 1: Calling LOCAL backend API for username: {USERNAME}")
print("=" * 60)

local_url = f"http://127.0.0.1:8000/api/linkedin/{USERNAME}/"
print(f"URL: {local_url}")

try:
    response = requests.get(local_url, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    try:
        data = response.json()
        print("\n--- Response JSON ---")
        print(json.dumps(data, indent=2))
        
        # Check key fields
        if "error" in data:
            print(f"\n❌ ERROR from API: {data['error']}")
        else:
            print(f"\n✅ Username: {data.get('Username', 'MISSING')}")
            print(f"✅ ProfilePicture: {data.get('ProfilePicture', 'MISSING')}")
            print(f"✅ Location: {data.get('Location', 'MISSING')}")
            print(f"✅ Skills count: {len(data.get('Skills', []))}")
            print(f"✅ Position count: {len(data.get('Position', []))}")
            print(f"✅ Education count: {len(data.get('Education', []))}")
    except json.JSONDecodeError:
        print(f"\n❌ Response is NOT valid JSON!")
        print(f"Raw response: {response.text[:500]}")
        
except requests.ConnectionError:
    print("❌ Could not connect to local backend. Is 'python manage.py runserver' running?")
except requests.Timeout:
    print("❌ Request timed out after 30 seconds")
except Exception as e:
    print(f"❌ Unexpected error: {e}")

# ==============================
# Test 2: Deployed Backend API
# ==============================
print("\n" + "=" * 60)
print(f"TEST 2: Calling DEPLOYED backend API for username: {USERNAME}")
print("=" * 60)

deployed_url = f"https://devhub-k9dg.onrender.com/api/linkedin/{USERNAME}/"
print(f"URL: {deployed_url}")

try:
    response = requests.get(deployed_url, timeout=60)
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print("\n--- Response JSON ---")
        print(json.dumps(data, indent=2))
        
        if "error" in data:
            print(f"\n❌ ERROR from API: {data['error']}")
        else:
            print(f"\n✅ Username: {data.get('Username', 'MISSING')}")
            print(f"✅ Skills count: {len(data.get('Skills', []))}")
            print(f"✅ Position count: {len(data.get('Position', []))}")
            print(f"✅ Education count: {len(data.get('Education', []))}")
    except json.JSONDecodeError:
        print(f"\n❌ Response is NOT valid JSON!")
        print(f"Raw response: {response.text[:500]}")
        
except requests.ConnectionError:
    print("❌ Could not connect to deployed backend.")
except requests.Timeout:
    print("❌ Request timed out after 60 seconds")
except Exception as e:
    print(f"❌ Unexpected error: {e}")

# ==============================
# Test 3: Direct RapidAPI Call
# ==============================
print("\n" + "=" * 60)
print(f"TEST 3: Calling RapidAPI DIRECTLY for username: {USERNAME}")
print("=" * 60)

rapid_url = "https://fresh-linkedin-profile-data.p.rapidapi.com/enrich-lead"
querystring = {
    "linkedin_url": f"https://www.linkedin.com/in/{USERNAME}/",
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

print(f"LinkedIn URL: {querystring['linkedin_url']}")

try:
    response = requests.get(rapid_url, headers=headers, params=querystring, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print("\n--- Raw RapidAPI Response ---")
        print(json.dumps(data, indent=2))
        
        # Check if data is wrapped
        inner_data = data.get('data')
        if inner_data:
            print(f"\n✅ full_name: {inner_data.get('full_name', 'MISSING')}")
            print(f"✅ headline: {inner_data.get('headline', 'MISSING')}")
            print(f"✅ city: {inner_data.get('city', 'MISSING')}")
            print(f"✅ skills: {inner_data.get('skills', 'MISSING')}")
            print(f"✅ experiences count: {len(inner_data.get('experiences', []))}")
            print(f"✅ educations count: {len(inner_data.get('educations', []))}")
        else:
            print(f"\n❌ No 'data' key in response! Keys: {list(data.keys())}")
    except json.JSONDecodeError:
        print(f"\n❌ Response is NOT valid JSON!")
        print(f"Raw response: {response.text[:500]}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
