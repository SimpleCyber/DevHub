"""
Detailed test: Print full raw response from deployed backend and compare with local.
"""
import requests
import json

USERNAME = "satyam-yada"

print("=" * 70)
print("DETAILED: Deployed backend raw response")
print("=" * 70)

deployed_url = f"https://devhub-k9dg.onrender.com/api/linkedin/{USERNAME}/"

try:
    response = requests.get(deployed_url, timeout=60)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 70)
print("DETAILED: Local backend raw response")
print("=" * 70)

local_url = f"http://127.0.0.1:8000/api/linkedin/{USERNAME}/"

try:
    response = requests.get(local_url, timeout=30)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 70)
print("ANALYSIS: Comparing key fields")
print("=" * 70)

try:
    deployed_resp = requests.get(deployed_url, timeout=60).json()
    local_resp = requests.get(local_url, timeout=30).json()
    
    fields = ["Username", "ProfilePicture", "Bio", "Headline", "Location"]
    for field in fields:
        d_val = deployed_resp.get(field)
        l_val = local_resp.get(field)
        match = "✅" if d_val == l_val else "❌ MISMATCH"
        print(f"{field:20s} Deployed={str(d_val)[:50]:50s} Local={str(l_val)[:50]:50s} {match}")
    
    # Arrays
    for field in ["Education", "Position", "Skills"]:
        d_len = len(deployed_resp.get(field, []))
        l_len = len(local_resp.get(field, []))
        match = "✅" if d_len == l_len else "❌ MISMATCH"
        print(f"{field:20s} Deployed count={d_len:3d}  Local count={l_len:3d}  {match}")
        
except Exception as e:
    print(f"Comparison error: {e}")
