# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import torch
# import torch.nn as nn
# import torch.nn.functional as F
# import numpy as np
# import io
# from sklearn.decomposition import PCA
# import os

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ==========================================
# # 1. MODEL ARCHITECTURE
# # ==========================================
# class PointNetSeg(nn.Module):
#     def __init__(self, num_classes=50):
#         super(PointNetSeg, self).__init__()
#         self.conv1 = nn.Conv1d(3, 64, 1); self.bn1 = nn.BatchNorm1d(64)
#         self.conv2 = nn.Conv1d(64, 128, 1); self.bn2 = nn.BatchNorm1d(128)
#         self.conv3 = nn.Conv1d(128, 1024, 1); self.bn3 = nn.BatchNorm1d(1024)
#         self.conv4 = nn.Conv1d(1088, 512, 1); self.bn4 = nn.BatchNorm1d(512)
#         self.conv5 = nn.Conv1d(512, 256, 1); self.bn5 = nn.BatchNorm1d(256)
#         self.conv6 = nn.Conv1d(256, num_classes, 1)

#     def forward(self, x):
#         num_points = x.size(2)
#         x = F.relu(self.bn1(self.conv1(x)))
#         local_features = x
#         x = F.relu(self.bn2(self.conv2(x)))
#         x = F.relu(self.bn3(self.conv3(x)))
#         global_feature = torch.max(x, 2, keepdim=True)[0].repeat(1, 1, num_points)
#         x = F.relu(self.bn4(self.conv4(torch.cat([local_features, global_feature], dim=1))))
#         x = F.relu(self.bn5(self.conv5(x)))
#         return self.conv6(x)

# # ==========================================
# # 2. LOAD MODEL
# # ==========================================
# MODEL_PATH = "best_pointnet_model (1).pth" 
# device = torch.device("cpu")
# model = PointNetSeg(num_classes=50)

# if os.path.exists(MODEL_PATH):
#     try:
#         model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
#         print("✅ Model loaded successfully.")
#     except Exception as e:
#         print(f"❌ Error loading model weights: {e}")
# else:
#     print(f"❌ WARNING: {MODEL_PATH} not found in backend folder.")

# model.eval()

# # ==========================================
# # 3. ROBUST MATH FUNCTIONS
# # ==========================================
# def normalize_points(points):
#     """
#     Normalizes point cloud to unit sphere [-1, 1].
#     Returns: normalized_points
#     """
#     points = points.astype(np.float32) # Force float to prevent int division errors
#     centroid = np.mean(points, axis=0)
#     points -= centroid
#     max_dist = np.max(np.sqrt(np.sum(points ** 2, axis=1)))
    
#     if max_dist == 0: max_dist = 1.0 # Prevent division by zero
    
#     return points / max_dist

# def fit_curve(centroids_list):
#     """Fits a parabolic curve to the centroids"""
#     if len(centroids_list) < 3: return [], [], []
    
#     # Sort by X to ensure line draws smoothly left-to-right
#     sorted_data = sorted(centroids_list, key=lambda p: p[0])
#     data = np.array(sorted_data)
    
#     x = data[:, 0]
#     y = data[:, 1]
#     z_mean = np.mean(data[:, 2])
    
#     try:
#         # Fit 2nd degree polynomial (Parabola)
#         coeffs = np.polyfit(x, y, 2)
#         poly = np.poly1d(coeffs)
        
#         # Generate smooth line points
#         x_line = np.linspace(float(min(x)), float(max(x)), 50)
#         y_line = poly(x_line)
#         return x_line.tolist(), y_line.tolist(), [float(z_mean)] * 50
#     except:
#         return [], [], []

# def get_diagnosis(raw_centroids, raw_points, labels):
#     """
#     Performs diagnosis using REAL WORLD coordinates (Raw).
#     """
#     unique_teeth = sorted(np.unique(labels))
#     score_crowding = 0
#     score_spacing = 0
#     score_displacement = 0 
#     details = []
    
#     # 1. Estimate widths
#     widths = {}
#     for tid in unique_teeth:
#         if tid == 0: continue
#         t_pts = raw_points[labels == tid]
#         if len(t_pts) < 5: continue
#         try:
#             pca = PCA(n_components=2)
#             pca.fit(t_pts)
#             # 4 sigma covers ~95% of the width
#             widths[tid] = 4 * np.sqrt(pca.explained_variance_[1])
#         except:
#             continue

#     # 2. Check Neighbors (Crowding/Spacing)
#     tooth_ids = sorted(list(widths.keys()))
#     for i in range(len(tooth_ids)-1):
#         curr, next_t = tooth_ids[i], tooth_ids[i+1]
#         if abs(curr - next_t) > 1: continue 
        
#         c1 = np.array(raw_centroids[int(curr)])
#         c2 = np.array(raw_centroids[int(next_t)])
#         dist = np.linalg.norm(c1 - c2)
#         expected = (widths[curr] + widths[next_t]) / 2.0
        
#         if dist < expected * 0.85:
#             score_crowding += 1
#             details.append(f"Overlap: Tooth {curr} & {next_t}")
#         elif dist > expected * 1.2:
#             score_spacing += 1
#             details.append(f"Gap: Tooth {curr} & {next_t}")

#     # 3. Check Displacement (Curve fit on Raw Data)
#     all_raw_c = np.array(list(raw_centroids.values()))
#     if len(all_raw_c) > 3:
#         try:
#             x = all_raw_c[:, 0]
#             y = all_raw_c[:, 1]
#             coeffs = np.polyfit(x, y, 2)
#             poly = np.poly1d(coeffs)
            
#             for tid, centroid in raw_centroids.items():
#                 cx, cy = centroid[0], centroid[1]
#                 target_y = poly(cx)
#                 deviation = abs(cy - target_y)
                
#                 # Threshold: >2.0 units (approx mm) is displacement
#                 if deviation > 2.0: 
#                     score_displacement += 1
#                     details.append(f"Displacement: Tooth {tid} is off-curve")
#         except:
#             pass

#     diagnosis = "Normal Alignment"
#     if score_displacement >= 2: diagnosis = "Arch Misalignment"
#     elif score_crowding >= 2: diagnosis = "Severe Crowding"
#     elif score_crowding >= 1: diagnosis = "Mild Crowding"
#     elif score_spacing >= 2: diagnosis = "Generalized Spacing"
    
#     return diagnosis, details


# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):
#     # A. LOAD DATA
#     contents = await file.read()
#     data = np.load(io.BytesIO(contents))
#     raw_points = data['points'].astype(np.float32)
    
#     # Ground Truth Labels
#     ground_truth = data['labels'].tolist()[::5] if 'labels' in data else []
    
#     # B. NORMALIZE
#     norm_points = normalize_points(raw_points)
    
#     # C. PREDICT
#     inp = torch.from_numpy(norm_points).float().unsqueeze(0).transpose(2, 1)
#     with torch.no_grad():
#         preds = model(inp).max(1)[1].cpu().numpy()[0]
    
#     # D. CENTROIDS
#     unique_ids = np.unique(preds)
#     raw_centroids = {}
#     display_centroids = {} 
    
#     for tid in unique_ids:
#         if tid == 0: continue
#         mask = (preds == tid)
#         raw_c = np.mean(raw_points[mask], axis=0)
#         raw_centroids[int(tid)] = raw_c.tolist()
#         disp_c = np.mean(norm_points[mask], axis=0)
#         display_centroids[int(tid)] = disp_c.tolist()

#     diag_title, diag_details = get_diagnosis(raw_centroids, raw_points, preds)
    
#     # E. CALCULATE CURVE & ALIGNED POSITIONS
#     # 1. Get the curve points
#     cx, cy, cz = fit_curve(list(display_centroids.values()))
    
#     # 2. Calculate "Aligned" Centroids (Snap to closest point on curve)
#     aligned_centroids = {}
#     if len(cx) > 0:
#         curve_points = np.column_stack((cx, cy, cz))
        
#         for tid, centroid in display_centroids.items():
#             # Find the index of the closest point on the green line
#             dists = np.linalg.norm(curve_points - np.array(centroid), axis=1)
#             closest_idx = np.argmin(dists)
#             # This is the "Ideal" position for this tooth
#             aligned_centroids[int(tid)] = curve_points[closest_idx].tolist()
#     else:
#         aligned_centroids = display_centroids # Fallback

#     # G. RETURN JSON
#     return {
#         "points": norm_points.tolist()[::5],
#         "labels": preds.tolist()[::5],
#         "ground_truth": ground_truth,
#         "centroids": list(display_centroids.values()),
#         "aligned_centroids": list(aligned_centroids.values()), # <--- NEW: The "After" positions
#         "centroid_ids": list(display_centroids.keys()),
#         "curve": {"x": cx, "y": cy, "z": cz},
#         "diagnosis": {"title": diag_title, "details": diag_details}
#     }


# Working one


# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import torch
# import torch.nn as nn
# import torch.nn.functional as F
# import numpy as np
# import io
# from sklearn.decomposition import PCA
# import os

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ==========================================
# # 1. MODEL ARCHITECTURE
# # ==========================================
# class PointNetSeg(nn.Module):
#     def __init__(self, num_classes=50):
#         super(PointNetSeg, self).__init__()
#         self.conv1 = nn.Conv1d(3, 64, 1); self.bn1 = nn.BatchNorm1d(64)
#         self.conv2 = nn.Conv1d(64, 128, 1); self.bn2 = nn.BatchNorm1d(128)
#         self.conv3 = nn.Conv1d(128, 1024, 1); self.bn3 = nn.BatchNorm1d(1024)
#         self.conv4 = nn.Conv1d(1088, 512, 1); self.bn4 = nn.BatchNorm1d(512)
#         self.conv5 = nn.Conv1d(512, 256, 1); self.bn5 = nn.BatchNorm1d(256)
#         self.conv6 = nn.Conv1d(256, num_classes, 1)

#     def forward(self, x):
#         num_points = x.size(2)
#         x = F.relu(self.bn1(self.conv1(x)))
#         local_features = x
#         x = F.relu(self.bn2(self.conv2(x)))
#         x = F.relu(self.bn3(self.conv3(x)))
#         global_feature = torch.max(x, 2, keepdim=True)[0].repeat(1, 1, num_points)
#         x = F.relu(self.bn4(self.conv4(torch.cat([local_features, global_feature], dim=1))))
#         x = F.relu(self.bn5(self.conv5(x)))
#         return self.conv6(x)

# # ==========================================
# # 2. LOAD MODEL
# # ==========================================
# MODEL_PATH = "best_pointnet_model (1).pth" 
# device = torch.device("cpu")
# model = PointNetSeg(num_classes=50)

# if os.path.exists(MODEL_PATH):
#     try:
#         model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
#         print("✅ Model loaded successfully.")
#     except Exception as e:
#         print(f"❌ Error loading model weights: {e}")
# else:
#     print(f"❌ WARNING: {MODEL_PATH} not found in backend folder.")

# model.eval()

# # ==========================================
# # 3. ROBUST MATH FUNCTIONS
# # ==========================================
# def normalize_points(points):
#     """
#     Normalizes point cloud to unit sphere [-1, 1].
#     Returns: normalized_points
#     """
#     points = points.astype(np.float32) # Force float to prevent int division errors
#     centroid = np.mean(points, axis=0)
#     points -= centroid
#     max_dist = np.max(np.sqrt(np.sum(points ** 2, axis=1)))
    
#     if max_dist == 0: max_dist = 1.0 # Prevent division by zero
    
#     return points / max_dist

# def fit_curve(centroids_list):
#     """Fits a parabolic curve to the centroids"""
#     if len(centroids_list) < 3: return [], [], []
    
#     # Sort by X to ensure line draws smoothly left-to-right
#     sorted_data = sorted(centroids_list, key=lambda p: p[0])
#     data = np.array(sorted_data)
    
#     x = data[:, 0]
#     y = data[:, 1]
#     z_mean = np.mean(data[:, 2])
    
#     try:
#         # Fit 2nd degree polynomial (Parabola)
#         coeffs = np.polyfit(x, y, 2)
#         poly = np.poly1d(coeffs)
        
#         # Generate smooth line points
#         x_line = np.linspace(float(min(x)), float(max(x)), 50)
#         y_line = poly(x_line)
#         return x_line.tolist(), y_line.tolist(), [float(z_mean)] * 50
#     except:
#         return [], [], []

# def get_diagnosis(raw_centroids, raw_points, labels):
#     """
#     Performs diagnosis using REAL WORLD coordinates (Raw).
#     """
#     unique_teeth = sorted(np.unique(labels))
#     score_crowding = 0
#     score_spacing = 0
#     score_displacement = 0 
#     details = []
    
#     # 1. Estimate widths
#     widths = {}
#     for tid in unique_teeth:
#         if tid == 0: continue
#         t_pts = raw_points[labels == tid]
#         if len(t_pts) < 5: continue
#         try:
#             pca = PCA(n_components=2)
#             pca.fit(t_pts)
#             # 4 sigma covers ~95% of the width
#             widths[tid] = 4 * np.sqrt(pca.explained_variance_[1])
#         except:
#             continue

#     # 2. Check Neighbors (Crowding/Spacing)
#     tooth_ids = sorted(list(widths.keys()))
#     for i in range(len(tooth_ids)-1):
#         curr, next_t = tooth_ids[i], tooth_ids[i+1]
#         if abs(curr - next_t) > 1: continue 
        
#         c1 = np.array(raw_centroids[int(curr)])
#         c2 = np.array(raw_centroids[int(next_t)])
#         dist = np.linalg.norm(c1 - c2)
#         expected = (widths[curr] + widths[next_t]) / 2.0
        
#         if dist < expected * 0.85:
#             score_crowding += 1
#             details.append(f"Overlap: Tooth {curr} & {next_t}")
#         elif dist > expected * 1.2:
#             score_spacing += 1
#             details.append(f"Gap: Tooth {curr} & {next_t}")

#     # 3. Check Displacement (Curve fit on Raw Data)
#     all_raw_c = np.array(list(raw_centroids.values()))
#     if len(all_raw_c) > 3:
#         try:
#             x = all_raw_c[:, 0]
#             y = all_raw_c[:, 1]
#             coeffs = np.polyfit(x, y, 2)
#             poly = np.poly1d(coeffs)
            
#             for tid, centroid in raw_centroids.items():
#                 cx, cy = centroid[0], centroid[1]
#                 target_y = poly(cx)
#                 deviation = abs(cy - target_y)
                
#                 # Threshold: >2.0 units (approx mm) is displacement
#                 if deviation > 2.0: 
#                     score_displacement += 1
#                     details.append(f"Displacement: Tooth {tid} is off-curve")
#         except:
#             pass

#     diagnosis = "Normal Alignment"
#     if score_displacement >= 2: diagnosis = "Arch Misalignment"
#     elif score_crowding >= 2: diagnosis = "Severe Crowding"
#     elif score_crowding >= 1: diagnosis = "Mild Crowding"
#     elif score_spacing >= 2: diagnosis = "Generalized Spacing"
    
#     return diagnosis, details


# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):
#     # A. LOAD DATA
#     contents = await file.read()
#     data = np.load(io.BytesIO(contents))
#     raw_points = data['points'].astype(np.float32)
    
#     # Ground Truth Labels
#     ground_truth = data['labels'].tolist()[::5] if 'labels' in data else []
    
#     # B. NORMALIZE
#     norm_points = normalize_points(raw_points)
    
#     # C. PREDICT
#     inp = torch.from_numpy(norm_points).float().unsqueeze(0).transpose(2, 1)
#     with torch.no_grad():
#         preds = model(inp).max(1)[1].cpu().numpy()[0]
    
#     # D. CENTROIDS
#     unique_ids = np.unique(preds)
#     raw_centroids = {}
#     display_centroids = {} 
    
#     for tid in unique_ids:
#         if tid == 0: continue
#         mask = (preds == tid)
#         raw_c = np.mean(raw_points[mask], axis=0)
#         raw_centroids[int(tid)] = raw_c.tolist()
#         disp_c = np.mean(norm_points[mask], axis=0)
#         display_centroids[int(tid)] = disp_c.tolist()

#     diag_title, diag_details = get_diagnosis(raw_centroids, raw_points, preds)
    
#     # E. CALCULATE CURVE & ALIGNED POSITIONS
#     # 1. Get the curve points
#     cx, cy, cz = fit_curve(list(display_centroids.values()))
    
#     # 2. Calculate "Aligned" Centroids (Snap to closest point on curve)
#     aligned_centroids = {}
#     if len(cx) > 0:
#         curve_points = np.column_stack((cx, cy, cz))
        
#         for tid, centroid in display_centroids.items():
#             # Find the index of the closest point on the green line
#             dists = np.linalg.norm(curve_points - np.array(centroid), axis=1)
#             closest_idx = np.argmin(dists)
#             # This is the "Ideal" position for this tooth
#             aligned_centroids[int(tid)] = curve_points[closest_idx].tolist()
#     else:
#         aligned_centroids = display_centroids # Fallback

#     # G. RETURN JSON
#     return {
#         "points": norm_points.tolist()[::5],
#         "labels": preds.tolist()[::5],
#         "ground_truth": ground_truth,
#         "centroids": list(display_centroids.values()),
#         "aligned_centroids": list(aligned_centroids.values()), # <--- NEW: The "After" positions
#         "centroid_ids": list(display_centroids.keys()),
#         "curve": {"x": cx, "y": cy, "z": cz},
#         "diagnosis": {"title": diag_title, "details": diag_details}
#     }

# # ==========================================
# # 4. NEW: METRICS ENDPOINT
# # ==========================================
# @app.get("/metrics")
# async def get_metrics():
#     """Returns the evaluated model metrics."""
#     return {
#         "accuracy": 80.32,
#         "precision": 82.49, # Multiplied by 100 in frontend for display
#         "recall": 80.32,
#         "f1_score": 80.72,
#         "total_points": "163,840"
#     }



# With login page

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from datetime import datetime, timedelta
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import io
from sklearn.decomposition import PCA
import os

# ==========================================
# 0. INSTALL DEPENDENCIES (run once):
#    pip install python-jose[cryptography] bcrypt
#    Do NOT use passlib -- incompatible with bcrypt>=4 on Python 3.13
# ==========================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# AUTH CONFIG
# ==========================================
SECRET_KEY         = "dental-ai-secret-change-this-in-production"
ALGORITHM          = "HS256"
TOKEN_EXPIRE_HOURS = 8

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def _hash(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt())

def verify_password(plain: str, hashed) -> bool:
    if isinstance(hashed, str):
        hashed = hashed.encode("utf-8")
    return bcrypt.checkpw(plain.encode("utf-8"), hashed)

# ── User database ─────────────────────────────────────────────
# To add a new doctor, open a Python shell and run:
#   import bcrypt; bcrypt.hashpw(b"theirpassword", bcrypt.gensalt())
# Then paste the result as a bytes literal below.
USERS_DB = {
    "doctor": {
        "username": "doctor",
        "name":     "Dr. Sharma",
        "role":     "doctor",
        "hashed_password": _hash("dental123"),
    },
    "admin": {
        "username": "admin",
        "name":     "Admin",
        "role":     "admin",
        "hashed_password": _hash("admin123"),
    },
}

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency: validates JWT and returns the user dict."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = USERS_DB.get(username)
    if user is None:
        raise credentials_exception
    return user

# ==========================================
# AUTH ENDPOINTS
# ==========================================
@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = USERS_DB.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_token({"sub": user["username"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "name": user["name"],
        "role": user["role"],
    }

# ==========================================
# 1. MODEL ARCHITECTURE
# ==========================================
class PointNetSeg(nn.Module):
    def __init__(self, num_classes=50):
        super(PointNetSeg, self).__init__()
        self.conv1 = nn.Conv1d(3, 64, 1);   self.bn1 = nn.BatchNorm1d(64)
        self.conv2 = nn.Conv1d(64, 128, 1); self.bn2 = nn.BatchNorm1d(128)
        self.conv3 = nn.Conv1d(128, 1024, 1); self.bn3 = nn.BatchNorm1d(1024)
        self.conv4 = nn.Conv1d(1088, 512, 1); self.bn4 = nn.BatchNorm1d(512)
        self.conv5 = nn.Conv1d(512, 256, 1);  self.bn5 = nn.BatchNorm1d(256)
        self.conv6 = nn.Conv1d(256, num_classes, 1)

    def forward(self, x):
        num_points = x.size(2)
        x = F.relu(self.bn1(self.conv1(x)))
        local_features = x
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        global_feature = torch.max(x, 2, keepdim=True)[0].repeat(1, 1, num_points)
        x = F.relu(self.bn4(self.conv4(torch.cat([local_features, global_feature], dim=1))))
        x = F.relu(self.bn5(self.conv5(x)))
        return self.conv6(x)

# ==========================================
# 2. LOAD MODEL
# ==========================================
MODEL_PATH = "best_pointnet_model (1).pth"
device     = torch.device("cpu")
model      = PointNetSeg(num_classes=50)

if os.path.exists(MODEL_PATH):
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("✅ Model loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading model weights: {e}")
else:
    print(f"❌ WARNING: {MODEL_PATH} not found in backend folder.")

model.eval()

# ==========================================
# 3. MATH FUNCTIONS
# ==========================================
def normalize_points(points):
    points = points.astype(np.float32)
    centroid = np.mean(points, axis=0)
    points -= centroid
    max_dist = np.max(np.sqrt(np.sum(points ** 2, axis=1)))
    if max_dist == 0:
        max_dist = 1.0
    return points / max_dist

def fit_curve(centroids_list):
    if len(centroids_list) < 3:
        return [], [], []
    sorted_data = sorted(centroids_list, key=lambda p: p[0])
    data = np.array(sorted_data)
    x = data[:, 0]
    y = data[:, 1]
    z_mean = np.mean(data[:, 2])
    try:
        coeffs = np.polyfit(x, y, 2)
        poly   = np.poly1d(coeffs)
        x_line = np.linspace(float(min(x)), float(max(x)), 50)
        y_line = poly(x_line)
        return x_line.tolist(), y_line.tolist(), [float(z_mean)] * 50
    except Exception:
        return [], [], []

def get_diagnosis(raw_centroids, raw_points, labels):
    unique_teeth   = sorted(np.unique(labels))
    score_crowding = 0
    score_spacing  = 0
    score_displacement = 0
    details = []

    widths = {}
    for tid in unique_teeth:
        if tid == 0:
            continue
        t_pts = raw_points[labels == tid]
        if len(t_pts) < 5:
            continue
        try:
            pca = PCA(n_components=2)
            pca.fit(t_pts)
            widths[tid] = 4 * np.sqrt(pca.explained_variance_[1])
        except Exception:
            continue

    tooth_ids = sorted(list(widths.keys()))
    for i in range(len(tooth_ids) - 1):
        curr, next_t = tooth_ids[i], tooth_ids[i + 1]
        if abs(curr - next_t) > 1:
            continue
        c1   = np.array(raw_centroids[int(curr)])
        c2   = np.array(raw_centroids[int(next_t)])
        dist = np.linalg.norm(c1 - c2)
        expected = (widths[curr] + widths[next_t]) / 2.0
        if dist < expected * 0.85:
            score_crowding += 1
            details.append(f"Overlap: Tooth {curr} & {next_t}")
        elif dist > expected * 1.2:
            score_spacing += 1
            details.append(f"Gap: Tooth {curr} & {next_t}")

    all_raw_c = np.array(list(raw_centroids.values()))
    if len(all_raw_c) > 3:
        try:
            x = all_raw_c[:, 0]
            y = all_raw_c[:, 1]
            coeffs = np.polyfit(x, y, 2)
            poly   = np.poly1d(coeffs)
            for tid, centroid in raw_centroids.items():
                cx, cy    = centroid[0], centroid[1]
                target_y  = poly(cx)
                deviation = abs(cy - target_y)
                if deviation > 2.0:
                    score_displacement += 1
                    details.append(f"Displacement: Tooth {tid} is off-curve")
        except Exception:
            pass

    diagnosis = "Normal Alignment"
    if score_displacement >= 2:
        diagnosis = "Arch Misalignment"
    elif score_crowding >= 2:
        diagnosis = "Severe Crowding"
    elif score_crowding >= 1:
        diagnosis = "Mild Crowding"
    elif score_spacing >= 2:
        diagnosis = "Generalized Spacing"

    return diagnosis, details

# ==========================================
# 4. PROTECTED ENDPOINTS
# ==========================================
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),   # ← auth guard
):
    contents  = await file.read()
    data      = np.load(io.BytesIO(contents))
    raw_points = data['points'].astype(np.float32)
    ground_truth = data['labels'].tolist()[::5] if 'labels' in data else []

    norm_points = normalize_points(raw_points)
    inp = torch.from_numpy(norm_points).float().unsqueeze(0).transpose(2, 1)
    with torch.no_grad():
        preds = model(inp).max(1)[1].cpu().numpy()[0]

    unique_ids      = np.unique(preds)
    raw_centroids   = {}
    display_centroids = {}

    for tid in unique_ids:
        if tid == 0:
            continue
        mask  = (preds == tid)
        raw_c = np.mean(raw_points[mask], axis=0)
        raw_centroids[int(tid)] = raw_c.tolist()
        disp_c = np.mean(norm_points[mask], axis=0)
        display_centroids[int(tid)] = disp_c.tolist()

    diag_title, diag_details = get_diagnosis(raw_centroids, raw_points, preds)
    cx, cy, cz = fit_curve(list(display_centroids.values()))

    aligned_centroids = {}
    if len(cx) > 0:
        curve_points = np.column_stack((cx, cy, cz))
        for tid, centroid in display_centroids.items():
            dists       = np.linalg.norm(curve_points - np.array(centroid), axis=1)
            closest_idx = np.argmin(dists)
            aligned_centroids[int(tid)] = curve_points[closest_idx].tolist()
    else:
        aligned_centroids = display_centroids

    return {
        "points":            norm_points.tolist()[::5],
        "labels":            preds.tolist()[::5],
        "ground_truth":      ground_truth,
        "centroids":         list(display_centroids.values()),
        "aligned_centroids": list(aligned_centroids.values()),
        "centroid_ids":      list(display_centroids.keys()),
        "curve":             {"x": cx, "y": cy, "z": cz},
        "diagnosis":         {"title": diag_title, "details": diag_details},
    }

@app.get("/metrics")
async def get_metrics(current_user: dict = Depends(get_current_user)):  # ← auth guard
    return {
        "accuracy":     80.32,
        "precision":    82.49,
        "recall":       80.32,
        "f1_score":     80.72,
        "total_points": "163,840",
    }

# ==========================================
# 5. HEALTH CHECK (public — no auth needed)
# ==========================================
@app.get("/health")
async def health():
    return {"status": "ok"}