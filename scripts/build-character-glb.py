"""
scripts/build-character-glb.py
Builds Dev Kumawat's actual 3D rigged glTF 2.0 binary model (public/models/dev-character.glb)
strictly following the supplied `character sheet.png` turnaround, proportions, and hex color palette:
  - Skin: #D7966B (with subtle jawline/chin stubble & facial shading texture)
  - Hair: #1A0F0B (voluminous sculpted wavy curls + tapered side fade)
  - Eyes: #4B2A10 (articulated Eye_L / Eye_R with radial dark-brown iris texture)
  - Eyelids & Brows: articulated Eyelid_L / Eyelid_R & Brow_L / Brow_R nodes
  - Jaw / Mouth: articulated Jaw node + sculpted Moustache + #BF785E lips for real-time lip-sync
  - Outfit: #111111 matte wool black blazer with #2B2B2B notched lapels, #1A1A1A black cotton shirt,
            minimal black belt with brushed buckle, tailored trousers, and formal black leather shoes
  - Articulated Hierarchical Rig + glTF Skin (`DevCharacterRig`) with zero floating parts.
"""

import io
import json
import math
import os
import struct
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = r"D:\Dev website"
OUT_DIR = os.path.join(ROOT, "public", "models")
os.makedirs(OUT_DIR, exist_ok=True)
OUT_GLB = os.path.join(OUT_DIR, "dev-character.glb")


# ---------------------------------------------------------------------------
# 1. Procedural High-Resolution PBR Textures (Derived from Character Sheet Palette)
# ---------------------------------------------------------------------------
def make_skin_texture() -> bytes:
    """512x512 UV head skin texture: #D7966B warm medium-brown + cheek warmth + subtle jawline/chin stubble."""
    w, h = 512, 512
    img = Image.new("RGB", (w, h), (215, 150, 107))  # #D7966B
    px = np.array(img, dtype=np.float32)

    yy, xx = np.mgrid[0:h, 0:w]
    u = xx / float(w)
    v = yy / float(h)  # v=0 top of head, v=1 bottom of chin/neck

    # Forehead & nose bridge warm highlight
    forehead = np.exp(-(((u - 0.5) / 0.22) ** 2 + ((v - 0.34) / 0.14) ** 2))
    px[:, :, 0] += forehead * 12
    px[:, :, 1] += forehead * 8
    px[:, :, 2] += forehead * 5

    # Subtle cheek warmth
    for cx in (0.37, 0.63):
        cheek = np.exp(-(((u - cx) / 0.09) ** 2 + ((v - 0.54) / 0.08) ** 2))
        px[:, :, 0] += cheek * 10
        px[:, :, 1] -= cheek * 4
        px[:, :, 2] -= cheek * 4

    # Eye socket soft shadow around u=0.41, 0.59, v=0.45
    for ex in (0.41, 0.59):
        sock = np.exp(-(((u - ex) / 0.055) ** 2 + ((v - 0.45) / 0.045) ** 2))
        px[:, :, 0] -= sock * 26
        px[:, :, 1] -= sock * 22
        px[:, :, 2] -= sock * 18

    # Light beard stubble zone (lower cheeks + jawline + chin: v in 0.58..0.86, front face u in 0.26..0.74)
    rng = np.random.default_rng(108)
    stubble_mask = (
        np.exp(-(((u - 0.5) / 0.24) ** 2))
        * np.clip((v - 0.56) / 0.10, 0.0, 1.0)
        * np.clip((0.90 - v) / 0.08, 0.0, 1.0)
    )
    # Exclude eye/forehead completely; add fine realistic stubble follicles
    grain = rng.uniform(0.0, 1.0, (h, w))
    follicles = (grain > 0.62).astype(np.float32) * stubble_mask
    shade = stubble_mask * 18.0 + follicles * 36.0
    px[:, :, 0] -= shade * 0.95
    px[:, :, 1] -= shade * 0.92
    px[:, :, 2] -= shade * 0.85

    # Subtle skin pore micro-variation
    pores = rng.normal(0.0, 2.2, (h, w))
    for c in range(3):
        px[:, :, c] += pores

    out = Image.fromarray(np.clip(px, 0, 255).astype(np.uint8), "RGB")
    out = out.filter(ImageFilter.GaussianBlur(radius=0.45))
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_eye_texture() -> bytes:
    """256x256 eyeball UV texture: crisp warm sclera + #4B2A10 dark brown iris + pupil + catchlight."""
    w, h = 256, 256
    yy, xx = np.mgrid[0:h, 0:w]
    u = xx / float(w)
    v = yy / float(h)
    # Front pole of sphere is at u=0.5, v=0.5
    dist = np.sqrt(((u - 0.5) * 2.0) ** 2 + ((v - 0.5) * 2.0) ** 2)

    px = np.zeros((h, w, 3), dtype=np.float32)
    # Warm natural sclera
    px[:, :, 0] = 246 - 18 * np.clip(dist, 0, 1)
    px[:, :, 1] = 243 - 20 * np.clip(dist, 0, 1)
    px[:, :, 2] = 240 - 20 * np.clip(dist, 0, 1)

    # Limbal ring + dark brown iris (#4B2A10 -> RGB 75, 42, 16)
    iris_r = 0.30
    pupil_r = 0.135
    in_iris = dist < iris_r
    angle = np.arctan2(v - 0.5, u - 0.5)
    fibers = 0.88 + 0.18 * np.sin(angle * 28.0)
    radial = np.clip((iris_r - dist) / iris_r, 0.0, 1.0)

    iris_col_r = (58 + 38 * radial) * fibers
    iris_col_g = (30 + 24 * radial) * fibers
    iris_col_b = (12 + 10 * radial) * fibers

    # Dark limbal outer ring
    limbal = (dist >= iris_r * 0.86) & in_iris
    px[in_iris, 0] = iris_col_r[in_iris]
    px[in_iris, 1] = iris_col_g[in_iris]
    px[in_iris, 2] = iris_col_b[in_iris]
    px[limbal] *= 0.52

    # Pupil
    in_pupil = dist < pupil_r
    px[in_pupil] = [10, 8, 8]

    # Crisp studio keylight catchlight
    cl = ((u - 0.455) ** 2 + (v - 0.445) ** 2) < (0.024 ** 2)
    px[cl] = [255, 252, 248]

    out = Image.fromarray(np.clip(px, 0, 255).astype(np.uint8), "RGB")
    out = out.filter(ImageFilter.GaussianBlur(radius=0.4))
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_wool_fabric_texture() -> bytes:
    """256x256 matte wool suit texture (#111111 with fine diagonal twill micro-weave)."""
    w, h = 256, 256
    rng = np.random.default_rng(77)
    yy, xx = np.mgrid[0:h, 0:w]
    twill = 2.2 * np.sin((xx + yy) * (2.0 * math.pi / 6.0))
    noise = rng.normal(0.0, 1.8, (h, w))
    val = np.clip(19.0 + twill + noise, 10, 34).astype(np.uint8)
    rgb = np.stack([val, val, np.clip(val + 1, 10, 36)], axis=-1)
    out = Image.fromarray(rgb, "RGB")
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# 2. Geometry Builders (Positions, Smooth Normals, UVs, Indices)
# ---------------------------------------------------------------------------
class MeshPart:
    def __init__(self, positions, normals, uvs, indices):
        self.positions = np.asarray(positions, dtype=np.float32)
        self.normals = np.asarray(normals, dtype=np.float32)
        self.uvs = np.asarray(uvs, dtype=np.float32)
        self.indices = np.asarray(indices, dtype=np.uint32)


def merge_parts(parts: list[MeshPart]) -> MeshPart:
    pos_list, nrm_list, uv_list, idx_list = [], [], [], []
    offset = 0
    for p in parts:
        pos_list.append(p.positions)
        nrm_list.append(p.normals)
        uv_list.append(p.uvs)
        idx_list.append(p.indices + offset)
        offset += len(p.positions)
    return MeshPart(
        np.vstack(pos_list),
        np.vstack(nrm_list),
        np.vstack(uv_list),
        np.concatenate(idx_list),
    )


def compute_smooth_normals(positions: np.ndarray, indices: np.ndarray) -> np.ndarray:
    normals = np.zeros_like(positions, dtype=np.float64)
    tris = indices.reshape(-1, 3)
    v0 = positions[tris[:, 0]]
    v1 = positions[tris[:, 1]]
    v2 = positions[tris[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    np.add.at(normals, tris[:, 0], fn)
    np.add.at(normals, tris[:, 1], fn)
    np.add.at(normals, tris[:, 2], fn)
    lengths = np.linalg.norm(normals, axis=1, keepdims=True)
    normals = np.divide(normals, np.maximum(lengths, 1e-8))
    return normals.astype(np.float32)


def make_uv_sphere(rx, ry, rz, cx=0.0, cy=0.0, cz=0.0, seg_u=32, seg_v=24, deform_fn=None) -> MeshPart:
    positions = []
    uvs = []
    for iv in range(seg_v + 1):
        v = iv / float(seg_v)
        phi = v * math.pi  # 0 at top (+Y), pi at bottom (-Y)
        sin_p = math.sin(phi)
        cos_p = math.cos(phi)
        for iu in range(seg_u + 1):
            u = iu / float(seg_u)
            # u=0.5 faces +Z (front of character!)
            theta = (u - 0.5) * 2.0 * math.pi
            nx = sin_p * math.sin(theta)
            ny = cos_p
            nz = sin_p * math.cos(theta)
            px, py, pz = nx * rx, ny * ry, nz * rz
            if deform_fn is not None:
                px, py, pz = deform_fn(px, py, pz, u, v, theta, phi)
            positions.append([px + cx, py + cy, pz + cz])
            uvs.append([u, v])

    indices = []
    stride = seg_u + 1
    for iv in range(seg_v):
        for iu in range(seg_u):
            a = iv * stride + iu
            b = (iv + 1) * stride + iu
            c = (iv + 1) * stride + (iu + 1)
            d = iv * stride + (iu + 1)
            indices.extend([a, b, d, b, c, d])

    pos_arr = np.array(positions, dtype=np.float32)
    idx_arr = np.array(indices, dtype=np.uint32)
    nrm_arr = compute_smooth_normals(pos_arr, idx_arr)
    return MeshPart(pos_arr, nrm_arr, np.array(uvs, dtype=np.float32), idx_arr)


def make_lofted_tube(ring_profiles, seg_u=24, cap_start=True, cap_end=True) -> MeshPart:
    """
    ring_profiles: list of (cx, cy, cz, rx, rz, tilt_x) ordered from bottom to top or start to end.
    """
    positions = []
    uvs = []
    n_rings = len(ring_profiles)
    for ir, prof in enumerate(ring_profiles):
        cx, cy, cz, rx, rz = prof[:5]
        v = ir / max(n_rings - 1, 1)
        for iu in range(seg_u + 1):
            u = iu / float(seg_u)
            theta = (u - 0.5) * 2.0 * math.pi
            px = cx + rx * math.sin(theta)
            pz = cz + rz * math.cos(theta)
            py = cy
            positions.append([px, py, pz])
            uvs.append([u, v])

    indices = []
    stride = seg_u + 1
    for ir in range(n_rings - 1):
        for iu in range(seg_u):
            a = ir * stride + iu
            b = (ir + 1) * stride + iu
            c = (ir + 1) * stride + (iu + 1)
            d = ir * stride + (iu + 1)
            # Outward winding when ring order goes bottom (-Y) -> top (+Y) or start -> end
            indices.extend([a, d, b, b, d, c])

    # Check winding orientation using ring direction
    if n_rings >= 2 and ring_profiles[-1][1] < ring_profiles[0][1]:
        # Top-to-bottom order: flip triangles so normals face outward
        indices = []
        for ir in range(n_rings - 1):
            for iu in range(seg_u):
                a = ir * stride + iu
                b = (ir + 1) * stride + iu
                c = (ir + 1) * stride + (iu + 1)
                d = ir * stride + (iu + 1)
                indices.extend([a, b, d, b, c, d])

    if cap_start:
        c0 = len(positions)
        cx, cy, cz = ring_profiles[0][:3]
        positions.append([cx, cy, cz])
        uvs.append([0.5, 0.0])
        flip = ring_profiles[-1][1] >= ring_profiles[0][1]
        for iu in range(seg_u):
            if flip:
                indices.extend([c0, iu + 1, iu])
            else:
                indices.extend([c0, iu, iu + 1])

    if cap_end:
        c1 = len(positions)
        cx, cy, cz = ring_profiles[-1][:3]
        positions.append([cx, cy, cz])
        uvs.append([0.5, 1.0])
        base = (n_rings - 1) * stride
        flip = ring_profiles[-1][1] >= ring_profiles[0][1]
        for iu in range(seg_u):
            if flip:
                indices.extend([c1, base + iu, base + iu + 1])
            else:
                indices.extend([c1, base + iu + 1, base + iu])

    pos_arr = np.array(positions, dtype=np.float32)
    idx_arr = np.array(indices, dtype=np.uint32)
    nrm_arr = compute_smooth_normals(pos_arr, idx_arr)
    return MeshPart(pos_arr, nrm_arr, np.array(uvs, dtype=np.float32), idx_arr)


def make_rounded_box(sx, sy, sz, cx=0.0, cy=0.0, cz=0.0, seg=8) -> MeshPart:
    def deform(px, py, pz, u, v, theta, phi):
        # Superellipsoid (p=0.58) gives smooth tailored rectangular cushion
        nx = px / max(sx, 1e-6)
        ny = py / max(sy, 1e-6)
        nz = pz / max(sz, 1e-6)
        power = 0.62
        px2 = math.copysign(abs(nx) ** power, nx) * sx
        py2 = math.copysign(abs(ny) ** power, ny) * sy
        pz2 = math.copysign(abs(nz) ** power, nz) * sz
        return px2, py2, pz2

    return make_uv_sphere(sx, sy, sz, cx, cy, cz, seg_u=seg * 2, seg_v=seg, deform_fn=deform)


# ---------------------------------------------------------------------------
# 3. Sculpt Character Anatomy & Outfit Parts (Local to Each Rig Node!)
#    Total character height: ~1.75 m (feet at Y=0.0, crown of hair at Y=1.75 m)
# ---------------------------------------------------------------------------
def build_head_skin_mesh() -> MeshPart:
    """Sculpted oval head + brow ridge + eye sockets + nose + cheekbones + chin + ears (origin at Head pivot Y=1.47)."""
    def head_deform(px, py, pz, u, v, theta, phi):
        # Base oval cranium: rx=0.098, ry=0.122, rz=0.106
        # Taper lower jaw & chin smoothly (py < 0)
        if py < 0.01:
            t = min(1.0, (0.01 - py) / 0.13)
            jaw_narrow = 1.0 - 0.28 * (t ** 1.35)
            px *= jaw_narrow
            # Slight forward chin projection
            chin_bump = math.exp(-(((px / 0.04) ** 2) + (((py + 0.095) / 0.032) ** 2))) * (1.0 if pz > 0 else 0.0)
            pz += chin_bump * 0.009

        # Cheekbones subtle fullness
        if pz > 0:
            cheek = math.exp(-(((abs(px) - 0.058) / 0.032) ** 2 + ((py + 0.012) / 0.035) ** 2))
            pz += cheek * 0.007
            px += math.copysign(cheek * 0.004, px)

            # Brow ridge subtle prominence
            brow = math.exp(-(((py - 0.030) / 0.018) ** 2 + ((px / 0.072) ** 2)))
            pz += brow * 0.008

            # Eye sockets recessed cleanly so articulated eyeballs sit naturally inside
            for side in (-1.0, 1.0):
                ex = side * 0.036
                ey = 0.012
                socket = math.exp(-(((px - ex) / 0.024) ** 2 + ((py - ey) / 0.020) ** 2))
                pz -= socket * 0.016

            # Sculpted nose bridge & tip
            nose_bridge = math.exp(-(((px / 0.014) ** 2) + (((py + 0.004) / 0.034) ** 2)))
            nose_tip = math.exp(-(((px / 0.018) ** 2) + (((py + 0.022) / 0.016) ** 2)))
            nostrils = math.exp(-((((abs(px) - 0.013) / 0.009) ** 2) + (((py + 0.026) / 0.010) ** 2)))
            pz += nose_bridge * 0.018 + nose_tip * 0.016 + nostrils * 0.007

        # Flatten back/neck transition slightly
        if pz < -0.02 and py < -0.04:
            pz *= 0.90

        return px, py, pz

    cranium = make_uv_sphere(0.098, 0.122, 0.106, cx=0.0, cy=0.095, cz=0.0, seg_u=48, seg_v=40, deform_fn=head_deform)

    # Natural sculpted ears on left & right
    ear_l = make_uv_sphere(0.014, 0.030, 0.020, cx=0.097, cy=0.088, cz=-0.006, seg_u=18, seg_v=14)
    ear_r = make_uv_sphere(0.014, 0.030, 0.020, cx=-0.097, cy=0.088, cz=-0.006, seg_u=18, seg_v=14)
    return merge_parts([cranium, ear_l, ear_r])


def build_hair_mesh() -> MeshPart:
    """Voluminous sculpted wavy dark hair (#1A0F0B) with clean side fade matching character sheet."""
    parts = []

    # Base hair cap + tapered side-fade wrap around back and sides of cranium
    def cap_deform(px, py, pz, u, v, theta, phi):
        # Cut open the front face smoothly so face/forehead/ears stay clear
        if pz > 0.015 and py < 0.068:
            # Pull behind forehead plane
            pz = -0.01
        # Side fade taper above ears
        if abs(px) > 0.075 and py < 0.035 and pz > -0.025:
            py = max(py, 0.032)
        # Wavy surface modulation across top/back
        wave = 0.0045 * math.sin(theta * 9.0 + phi * 5.0)
        return px * (1.0 + wave * 3), py + (0.012 if py > 0.04 else 0.0), pz * (1.0 + wave * 3)

    cap = make_uv_sphere(0.104, 0.126, 0.114, cx=0.0, cy=0.104, cz=-0.006, seg_u=40, seg_v=30, deform_fn=cap_deform)
    parts.append(cap)

    # Signature voluminous swept wavy curls across top crown & front hairline (matching character sheet!)
    wave_locks = [
        # (cx, cy, cz, rx, ry, rz)
        (-0.042, 0.215, 0.048, 0.042, 0.028, 0.052),
        (-0.008, 0.228, 0.055, 0.048, 0.032, 0.058),
        (0.032, 0.224, 0.050, 0.046, 0.030, 0.055),
        (0.062, 0.206, 0.036, 0.038, 0.025, 0.048),
        (-0.065, 0.196, 0.028, 0.035, 0.024, 0.046),
        (-0.025, 0.232, 0.005, 0.052, 0.028, 0.058),
        (0.028, 0.230, -0.002, 0.050, 0.027, 0.058),
        (0.000, 0.220, -0.048, 0.064, 0.028, 0.054),
    ]
    for i, (cx, cy, cz, rx, ry, rz) in enumerate(wave_locks):
        def lock_def(px, py, pz, u, v, th, ph, phase=i):
            swirl = 0.005 * math.sin(th * 4.0 + ph * 3.0 + phase)
            return px + swirl, py + 0.004 * math.cos(th * 3.0), pz + swirl
        parts.append(make_uv_sphere(rx, ry, rz, cx, cy, cz, seg_u=22, seg_v=16, deform_fn=lock_def))

    return merge_parts(parts)


def build_moustache_mesh() -> MeshPart:
    """Full, neat curved moustache (#1A0F0B) sitting cleanly above upper lip."""
    parts = []
    # Left & right sculpted moustache wings meeting at philtrum
    for side in (-1.0, 1.0):
        for step in range(5):
            t = step / 4.0
            cx = side * (0.006 + t * 0.026)
            cy = 0.048 - (t ** 1.5) * 0.008
            cz = 0.105 - (t ** 1.8) * 0.012
            rx = 0.011 - t * 0.003
            ry = 0.0065 - t * 0.002
            rz = 0.009 - t * 0.002
            parts.append(make_uv_sphere(rx, ry, rz, cx, cy, cz, seg_u=14, seg_v=10))
    return merge_parts(parts)


def build_eyebrow_mesh(side: float) -> MeshPart:
    """Thick natural arched eyebrow local to Brow_L / Brow_R pivot."""
    segs = []
    for i in range(5):
        t = (i - 2) / 2.0  # -1..1 from inner to outer
        cx = side * (t * 0.018)
        cy = 0.003 * (1.0 - t * t) - (0.002 if t > 0.3 else 0.0)
        cz = 0.004 * math.cos(t * 0.8)
        r_thick = 0.0055 * (1.0 - 0.25 * max(0.0, t))
        segs.append(make_uv_sphere(0.008, r_thick, 0.007, cx, cy, cz, seg_u=12, seg_v=10))
    return merge_parts(segs)


def build_eyelid_mesh() -> MeshPart:
    """Upper hemispherical eyelid shell local to Eyelid pivot (rotates +X to blink closed)."""
    def lid_def(px, py, pz, u, v, theta, phi):
        # Keep upper front cap only by tucking back hemisphere slightly inside
        if py < -0.001:
            py = -0.001
        return px, py, pz

    return make_uv_sphere(0.0205, 0.0205, 0.0205, 0.0, 0.003, 0.001, seg_u=22, seg_v=14, deform_fn=lid_def)


def build_jaw_lips_mesh() -> tuple[MeshPart, MeshPart]:
    """
    Upper lip (attached to Head) and Lower lip/mouth interior (attached to Jaw pivot at Y=0.038, Z=0.075)
    so rotating/translating Jaw opens & shapes the mouth naturally during speech!
    """
    upper_parts = []
    lower_parts = []
    for i in range(7):
        t = (i - 3) / 3.0  # -1..1
        w_taper = math.sqrt(max(0.08, 1.0 - 0.82 * t * t))
        # Upper lip relative to Head origin
        ux = t * 0.024
        uy = 0.039 - 0.002 * abs(t)
        uz = 0.102 - 0.009 * (t * t)
        upper_parts.append(make_uv_sphere(0.0065, 0.0042 * w_taper, 0.0065, ux, uy, uz, seg_u=12, seg_v=10))

        # Lower lip relative to Jaw pivot (0, 0.036, 0.082)
        lx = t * 0.022
        ly = -0.004 + 0.0015 * (t * t)
        lz = 0.019 - 0.008 * (t * t)
        lower_parts.append(make_uv_sphere(0.0065, 0.0048 * w_taper, 0.0070, lx, ly, lz, seg_u=12, seg_v=10))

    return merge_parts(upper_parts), merge_parts(lower_parts)


def build_torso_and_outfit():
    """
    Builds Chest/Blazer, Black Shirt V-front + Collar, Lapels, Belt, Buckle, Hips/Pelvis.
    Origin of Chest node is at Y=1.08; Hips at Y=0.92.
    """
    # 1. Black Matte Wool Blazer Torso (local to Chest Y=1.08, spans -0.18 to +0.34 -> world 0.90 to 1.42)
    blazer_rings = [
        (0.0, -0.18, 0.000, 0.152, 0.098),  # Blazer hem over hips
        (0.0, -0.06, 0.002, 0.142, 0.095),  # Tailored waist
        (0.0,  0.08, 0.006, 0.162, 0.106),  # Ribcage
        (0.0,  0.22, 0.004, 0.186, 0.112),  # Athletic chest
        (0.0,  0.31, 0.000, 0.192, 0.102),  # Broad balanced shoulders
        (0.0,  0.34, -0.004, 0.115, 0.078), # Neck/collar shoulder slope
    ]
    blazer_body = make_lofted_tube(blazer_rings, seg_u=36)

    # Smooth continuous tailored satin notched Blazer Lapels (#222228) on front of chest
    lapel_parts = []
    for side in (-1.0, 1.0):
        lapel_rings = []
        for s in range(12):
            t = s / 11.0  # t=0 bottom button stance -> t=1 shoulder collar notch
            lx = side * (0.014 + t * 0.058)
            ly = 0.00 + t * 0.325
            lz = 0.101 + 0.009 * math.sin(t * math.pi * 0.85)
            width = 0.011 + 0.012 * math.sin(t * math.pi * 0.78)
            lapel_rings.append((lx, ly, lz, width, 0.0055))
        lapel_parts.append(make_lofted_tube(lapel_rings, seg_u=16))
    # Two front blazer buttons + subtle breast pocket welt
    for by in (-0.015, -0.075):
        lapel_parts.append(make_uv_sphere(0.0065, 0.0065, 0.0045, 0.0, by, 0.104, seg_u=12, seg_v=8))
    lapel_parts.append(make_rounded_box(0.026, 0.004, 0.004, -0.082, 0.19, 0.108, seg=4))
    lapels_mesh = merge_parts(lapel_parts)

    # Black Cotton Shirt V-insert + Pointed Shirt Collar (#1A1A1A)
    shirt_parts = [
        make_rounded_box(0.068, 0.17, 0.022, 0.0, 0.18, 0.090, seg=8),
        # Left & right shirt collar wings wrapping neck base
        make_rounded_box(0.036, 0.024, 0.028, 0.036, 0.345, 0.036, seg=6),
        make_rounded_box(0.036, 0.024, 0.028, -0.036, 0.345, 0.036, seg=6),
        make_lofted_tube([
            (0.0, 0.32, 0.0, 0.064, 0.062),
            (0.0, 0.365, 0.0, 0.058, 0.056),
        ], seg_u=24),
    ]
    shirt_mesh = merge_parts(shirt_parts)

    # Belt strap & brushed metallic buckle (local to Hips Y=0.92)
    belt_strap = make_lofted_tube([
        (0.0, 0.00, 0.0, 0.146, 0.097),
        (0.0, 0.032, 0.0, 0.146, 0.097),
    ], seg_u=32)
    belt_buckle = make_rounded_box(0.024, 0.019, 0.010, 0.0, 0.016, 0.098, seg=5)

    # Pelvis / Upper Trouser Block (local to Hips Y=0.92, spans -0.10 to +0.02)
    pelvis = make_lofted_tube([
        (0.0, -0.10, 0.0, 0.144, 0.094),
        (0.0,  0.01, 0.0, 0.145, 0.096),
    ], seg_u=28)

    return blazer_body, lapels_mesh, shirt_mesh, belt_strap, belt_buckle, pelvis


def build_arm_parts(side: float):
    """
    Continuous overlapping sleeve & hand anatomy (no gaps at shoulder, elbow, or wrist!):
      - UpperArm pivot at Shoulder (side * 0.188, Y=1.38 in world -> local to Chest: side*0.188, 0.30, 0)
        hangs downward along -Y from 0.0 to -0.27
      - ForeArm pivot at (0, -0.27, 0) hangs downward from 0.0 to -0.24
      - Hand pivot at (0, -0.24, 0) has palm + 5 sculpted fingers!
    """
    upper_sleeve = merge_parts([
        make_uv_sphere(0.054, 0.054, 0.052, 0.0, 0.0, 0.0, seg_u=20, seg_v=14),  # Shoulder cap
        make_lofted_tube([
            (0.0, -0.27, 0.0, 0.043, 0.042),
            (0.0, -0.13, 0.0, 0.048, 0.047),
            (0.0,  0.00, 0.0, 0.053, 0.051),
        ], seg_u=22),
    ])

    fore_sleeve = merge_parts([
        make_uv_sphere(0.043, 0.043, 0.042, 0.0, 0.0, 0.0, seg_u=18, seg_v=12),  # Elbow bridge
        make_lofted_tube([
            (0.0, -0.23, 0.0, 0.035, 0.032),
            (0.0, -0.11, 0.0, 0.040, 0.038),
            (0.0,  0.00, 0.0, 0.043, 0.042),
        ], seg_u=22),
    ])

    # Sculpted natural human hand + 5 fingers (Skin material)
    hand_parts = [
        make_uv_sphere(0.030, 0.022, 0.018, 0.0, -0.01, 0.0, seg_u=16, seg_v=12),  # Wrist
        make_rounded_box(0.034, 0.044, 0.016, 0.0, -0.046, 0.002, seg=6),          # Palm
    ]
    # 4 fingers (Index, Middle, Ring, Little)
    finger_specs = [
        (-0.022 * side, 0.040, 0.0075),
        (-0.007 * side, 0.045, 0.0078),
        ( 0.008 * side, 0.041, 0.0074),
        ( 0.022 * side, 0.033, 0.0066),
    ]
    for fx, flen, frad in finger_specs:
        hand_parts.append(make_lofted_tube([
            (fx, -0.086 - flen, 0.004, frad * 0.78, frad * 0.78),
            (fx, -0.086 - flen * 0.5, 0.003, frad * 0.92, frad * 0.90),
            (fx, -0.084, 0.002, frad, frad),
        ], seg_u=12))
    # Opposable Thumb
    tx = -0.034 * side
    hand_parts.append(make_lofted_tube([
        (tx * 1.25, -0.078, 0.018, 0.0070, 0.0070),
        (tx * 1.05, -0.056, 0.012, 0.0085, 0.0085),
        (tx * 0.80, -0.035, 0.006, 0.0100, 0.0095),
    ], seg_u=12))

    return upper_sleeve, fore_sleeve, merge_parts(hand_parts)


def build_leg_and_shoe():
    """
    Tailored trousers & formal black leather Oxford shoe:
      - UpperLeg pivot at (side * 0.082, -0.08, 0) relative to Hips (world Y=0.84), spans 0 to -0.40
      - LowerLeg pivot at (0, -0.40, 0) (world Y=0.44), spans 0 to -0.38 (world Y=0.06)
      - Foot/Shoe pivot at (0, -0.38, 0) (world Y=0.06), sole rests cleanly at world Y=0.00!
    """
    upper_leg = merge_parts([
        make_uv_sphere(0.068, 0.065, 0.066, 0.0, 0.0, 0.0, seg_u=20, seg_v=12),
        make_lofted_tube([
            (0.0, -0.40, 0.0, 0.052, 0.052),
            (0.0, -0.20, 0.0, 0.061, 0.060),
            (0.0,  0.00, 0.0, 0.068, 0.066),
        ], seg_u=22),
    ])
    lower_leg = merge_parts([
        make_uv_sphere(0.052, 0.050, 0.052, 0.0, 0.0, 0.0, seg_u=18, seg_v=12),
        make_lofted_tube([
            (0.0, -0.37, 0.0, 0.042, 0.044),
            (0.0, -0.18, 0.0, 0.048, 0.050),
            (0.0,  0.00, 0.0, 0.052, 0.052),
        ], seg_u=22),
    ])
    shoe = merge_parts([
        make_rounded_box(0.045, 0.030, 0.095, 0.0, -0.030, 0.036, seg=8),  # Leather upper + toe box
        make_rounded_box(0.047, 0.009, 0.098, 0.0, -0.051, 0.036, seg=6),  # Dress sole & heel at Y=-0.06 -> world 0.0
    ])
    return upper_leg, lower_leg, shoe


# ---------------------------------------------------------------------------
# 4. glTF 2.0 Binary (.glb) Serializer with Embedded Textures, Materials & Rig
# ---------------------------------------------------------------------------
class GLBBuilder:
    def __init__(self):
        self.bin_data = bytearray()
        self.buffer_views = []
        self.accessors = []
        self.images = []
        self.textures = []
        self.materials = []
        self.meshes = []
        self.nodes = []
        self.skins = []

    def _align4(self):
        rem = len(self.bin_data) % 4
        if rem:
            self.bin_data.extend(b"\x00" * (4 - rem))

    def add_bytes(self, raw: bytes, target: int | None = None) -> int:
        self._align4()
        offset = len(self.bin_data)
        self.bin_data.extend(raw)
        bv = {"buffer": 0, "byteOffset": offset, "byteLength": len(raw)}
        if target is not None:
            bv["target"] = target
        idx = len(self.buffer_views)
        self.buffer_views.append(bv)
        return idx

    def add_png_texture(self, name: str, png_bytes: bytes) -> int:
        bv_idx = self.add_bytes(png_bytes)
        img_idx = len(self.images)
        self.images.append({"name": name, "bufferView": bv_idx, "mimeType": "image/png"})
        tex_idx = len(self.textures)
        self.textures.append({"name": name, "source": img_idx})
        return tex_idx

    def add_material(
        self,
        name: str,
        base_color=(1.0, 1.0, 1.0, 1.0),
        metallic=0.0,
        roughness=0.65,
        tex_idx: int | None = None,
    ) -> int:
        pbr = {
            "baseColorFactor": list(base_color),
            "metallicFactor": metallic,
            "roughnessFactor": roughness,
        }
        if tex_idx is not None:
            pbr["baseColorTexture"] = {"index": tex_idx}
        mat = {"name": name, "pbrMetallicRoughness": pbr, "doubleSided": False}
        idx = len(self.materials)
        self.materials.append(mat)
        return idx

    def add_mesh(self, name: str, part: MeshPart, material_idx: int) -> int:
        pos_bv = self.add_bytes(part.positions.tobytes(), target=34962)
        nrm_bv = self.add_bytes(part.normals.tobytes(), target=34962)
        uv_bv = self.add_bytes(part.uvs.tobytes(), target=34962)
        idx_bv = self.add_bytes(part.indices.tobytes(), target=34963)

        p_min = part.positions.min(axis=0).tolist()
        p_max = part.positions.max(axis=0).tolist()

        pos_acc = len(self.accessors)
        self.accessors.append({
            "bufferView": pos_bv,
            "componentType": 5126,
            "count": len(part.positions),
            "type": "VEC3",
            "min": p_min,
            "max": p_max,
        })
        nrm_acc = len(self.accessors)
        self.accessors.append({
            "bufferView": nrm_bv,
            "componentType": 5126,
            "count": len(part.normals),
            "type": "VEC3",
        })
        uv_acc = len(self.accessors)
        self.accessors.append({
            "bufferView": uv_bv,
            "componentType": 5126,
            "count": len(part.uvs),
            "type": "VEC2",
        })
        idx_acc = len(self.accessors)
        self.accessors.append({
            "bufferView": idx_bv,
            "componentType": 5125,
            "count": len(part.indices),
            "type": "SCALAR",
        })

        mesh_idx = len(self.meshes)
        self.meshes.append({
            "name": name,
            "primitives": [
                {
                    "attributes": {
                        "POSITION": pos_acc,
                        "NORMAL": nrm_acc,
                        "TEXCOORD_0": uv_acc,
                    },
                    "indices": idx_acc,
                    "material": material_idx,
                }
            ],
        })
        return mesh_idx

    def add_node(
        self,
        name: str,
        translation=(0.0, 0.0, 0.0),
        rotation=(0.0, 0.0, 0.0, 1.0),
        scale=(1.0, 1.0, 1.0),
        mesh: int | None = None,
        children: list[int] | None = None,
    ) -> int:
        node = {
            "name": name,
            "translation": [round(float(x), 5) for x in translation],
            "rotation": [round(float(x), 5) for x in rotation],
            "scale": [round(float(x), 5) for x in scale],
        }
        if mesh is not None:
            node["mesh"] = mesh
        if children:
            node["children"] = children
        idx = len(self.nodes)
        self.nodes.append(node)
        return idx

    def add_skin(self, name: str, joint_indices: list[int], world_positions: list[tuple[float, float, float]]):
        # Compute column-major 4x4 inverseBindMatrices for each joint
        mats = np.zeros((len(joint_indices), 16), dtype=np.float32)
        for i, (wx, wy, wz) in enumerate(world_positions):
            m = np.eye(4, dtype=np.float32)
            m[0, 3] = -wx
            m[1, 3] = -wy
            m[2, 3] = -wz
            mats[i] = m.T.reshape(16)  # OpenGL/glTF column-major
        ibm_bv = self.add_bytes(mats.tobytes())
        ibm_acc = len(self.accessors)
        self.accessors.append({
            "bufferView": ibm_bv,
            "componentType": 5126,
            "count": len(joint_indices),
            "type": "MAT4",
        })
        self.skins.append({
            "name": name,
            "joints": joint_indices,
            "skeleton": joint_indices[0],
            "inverseBindMatrices": ibm_acc,
        })

    def export(self, out_path: str, root_nodes: list[int]):
        self._align4()
        gltf = {
            "asset": {
                "version": "2.0",
                "generator": "DEV STUDIO Character Rig Pipeline v1.0",
                "copyright": "Dev Kumawat — DEV STUDIO",
            },
            "scene": 0,
            "scenes": [{"name": "DevCharacterScene", "nodes": root_nodes}],
            "nodes": self.nodes,
            "meshes": self.meshes,
            "materials": self.materials,
            "textures": self.textures,
            "images": self.images,
            "skins": self.skins,
            "accessors": self.accessors,
            "bufferViews": self.buffer_views,
            "buffers": [{"byteLength": len(self.bin_data)}],
        }
        json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
        pad_json = (4 - (len(json_bytes) % 4)) % 4
        json_bytes += b" " * pad_json

        total_len = 12 + 8 + len(json_bytes) + 8 + len(self.bin_data)
        with open(out_path, "wb") as f:
            f.write(struct.pack("<III", 0x46546C67, 2, total_len))
            f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
            f.write(json_bytes)
            f.write(struct.pack("<II", len(self.bin_data), 0x004E4942))
            f.write(self.bin_data)


def srgb_hex_to_linear_rgba(hex_str: str, alpha: float = 1.0):
    h = hex_str.lstrip("#")
    vals = [int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4)]
    lin = [
        round(((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92, 5)
        for c in vals
    ]
    return (lin[0], lin[1], lin[2], alpha)


def build_character_glb():
    b = GLBBuilder()

    # Textures
    skin_tex = b.add_png_texture("DevSkinTexture", make_skin_texture())
    eye_tex = b.add_png_texture("DevEyeIrisTexture", make_eye_texture())
    wool_tex = b.add_png_texture("DevBlazerWoolTexture", make_wool_fabric_texture())

    # Exact Palette Materials from Character Sheet (converted from sRGB hex -> glTF 2.0 linear PBR)
    mat_skin = b.add_material("Skin_D7966B", (1.0, 1.0, 1.0, 1.0), metallic=0.01, roughness=0.62, tex_idx=skin_tex)
    mat_skin_plain = b.add_material("SkinHands_D7966B", srgb_hex_to_linear_rgba("#D7966B"), metallic=0.01, roughness=0.64)
    mat_eyelid = b.add_material("Eyelid_C6835A", srgb_hex_to_linear_rgba("#C6835A"), metallic=0.01, roughness=0.58)
    mat_hair = b.add_material("Hair_1A0F0B", srgb_hex_to_linear_rgba("#1A0F0B"), metallic=0.03, roughness=0.52)
    mat_eye = b.add_material("Eye_4B2A10", (1.0, 1.0, 1.0, 1.0), metallic=0.0, roughness=0.08, tex_idx=eye_tex)
    mat_lips = b.add_material("Lips_BF785E", srgb_hex_to_linear_rgba("#BF785E"), metallic=0.02, roughness=0.48)
    mat_mouth_in = b.add_material("MouthCavity", srgb_hex_to_linear_rgba("#2A0D0D"), metallic=0.0, roughness=0.90)
    mat_suit = b.add_material("Blazer_111111", (1.0, 1.0, 1.0, 1.0), metallic=0.04, roughness=0.80, tex_idx=wool_tex)
    mat_lapel = b.add_material("SuitDetail_2B2B2B", srgb_hex_to_linear_rgba("#24242A"), metallic=0.08, roughness=0.52)
    mat_shirt = b.add_material("Shirt_1A1A1A", srgb_hex_to_linear_rgba("#16161B"), metallic=0.02, roughness=0.74)
    mat_trouser = b.add_material("Trousers_131316", srgb_hex_to_linear_rgba("#131317"), metallic=0.03, roughness=0.78)
    mat_belt = b.add_material("BeltLeather", srgb_hex_to_linear_rgba("#141418"), metallic=0.08, roughness=0.36)
    mat_buckle = b.add_material("BeltBuckleSilver", srgb_hex_to_linear_rgba("#B8BDC7"), metallic=0.88, roughness=0.24)
    mat_shoe = b.add_material("ShoeFormalLeather", srgb_hex_to_linear_rgba("#0F0F13"), metallic=0.10, roughness=0.25)

    # Meshes
    head_mesh = b.add_mesh("HeadCraniumMesh", build_head_skin_mesh(), mat_skin)
    hair_mesh = b.add_mesh("WavyHairMesh", build_hair_mesh(), mat_hair)
    moustache_mesh = b.add_mesh("MoustacheMesh", build_moustache_mesh(), mat_hair)

    upper_lip_part, lower_lip_part = build_jaw_lips_mesh()
    upper_lip_mesh = b.add_mesh("UpperLipMesh", upper_lip_part, mat_lips)
    lower_lip_mesh = b.add_mesh("LowerLipJawMesh", lower_lip_part, mat_lips)
    mouth_cavity_mesh = b.add_mesh(
        "MouthCavityMesh",
        make_uv_sphere(0.019, 0.008, 0.014, 0.0, 0.036, 0.091, seg_u=14, seg_v=10),
        mat_mouth_in,
    )

    eyeball_part = make_uv_sphere(0.019, 0.019, 0.019, 0.0, 0.0, 0.0, seg_u=28, seg_v=22)
    eye_l_mesh = b.add_mesh("EyeLeftMesh", eyeball_part, mat_eye)
    eye_r_mesh = b.add_mesh("EyeRightMesh", eyeball_part, mat_eye)

    eyelid_part = build_eyelid_mesh()
    eyelid_l_mesh = b.add_mesh("EyelidLeftMesh", eyelid_part, mat_eyelid)
    eyelid_r_mesh = b.add_mesh("EyelidRightMesh", eyelid_part, mat_eyelid)

    brow_l_mesh = b.add_mesh("BrowLeftMesh", build_eyebrow_mesh(1.0), mat_hair)
    brow_r_mesh = b.add_mesh("BrowRightMesh", build_eyebrow_mesh(-1.0), mat_hair)

    # Realistic short neck mesh (local to Neck Y=1.41, spans -0.02 to +0.09 -> overlaps cleanly into collar & head!)
    neck_mesh = b.add_mesh(
        "NeckMesh",
        make_lofted_tube([
            (0.0, -0.02, -0.004, 0.052, 0.050),
            (0.0,  0.04, -0.002, 0.046, 0.046),
            (0.0,  0.09,  0.000, 0.048, 0.048),
        ], seg_u=24),
        mat_skin_plain,
    )

    blazer_part, lapels_part, shirt_part, belt_part, buckle_part, pelvis_part = build_torso_and_outfit()
    blazer_mesh = b.add_mesh("BlazerTorsoMesh", blazer_part, mat_suit)
    lapels_mesh = b.add_mesh("BlazerLapelsMesh", lapels_part, mat_lapel)
    shirt_mesh = b.add_mesh("BlackShirtMesh", shirt_part, mat_shirt)
    belt_mesh = b.add_mesh("BeltStrapMesh", belt_part, mat_belt)
    buckle_mesh = b.add_mesh("BeltBuckleMesh", buckle_part, mat_buckle)
    pelvis_mesh = b.add_mesh("PelvisTrousersMesh", pelvis_part, mat_trouser)

    up_l, fore_l, hand_l = build_arm_parts(1.0)
    up_r, fore_r, hand_r = build_arm_parts(-1.0)
    up_arm_l_mesh = b.add_mesh("UpperArmLeftMesh", up_l, mat_suit)
    fore_arm_l_mesh = b.add_mesh("ForeArmLeftMesh", fore_l, mat_suit)
    hand_l_mesh = b.add_mesh("HandLeftMesh", hand_l, mat_skin_plain)
    up_arm_r_mesh = b.add_mesh("UpperArmRightMesh", up_r, mat_suit)
    fore_arm_r_mesh = b.add_mesh("ForeArmRightMesh", fore_r, mat_suit)
    hand_r_mesh = b.add_mesh("HandRightMesh", hand_r, mat_skin_plain)

    uleg_part, lleg_part, shoe_part = build_leg_and_shoe()
    uleg_mesh = b.add_mesh("UpperLegMesh", uleg_part, mat_trouser)
    lleg_mesh = b.add_mesh("LowerLegMesh", lleg_part, mat_trouser)
    shoe_mesh = b.add_mesh("FormalShoeMesh", shoe_part, mat_shoe)

    # Assemble Hierarchical Rig Nodes (bottom-up leaf -> parent)
    # Facial leaf nodes (children of Head at world Y=1.47)
    n_hair = b.add_node("Hair", mesh=hair_mesh)
    n_moustache = b.add_node("Moustache", mesh=moustache_mesh)
    n_upper_lip = b.add_node("UpperLip", mesh=upper_lip_mesh)
    n_mouth_cav = b.add_node("MouthCavity", mesh=mouth_cavity_mesh)
    n_jaw = b.add_node("Jaw", translation=(0.0, 0.036, 0.082), mesh=lower_lip_mesh)
    n_eye_l = b.add_node("Eye_L", translation=(0.036, 0.107, 0.084), mesh=eye_l_mesh)
    n_eye_r = b.add_node("Eye_R", translation=(-0.036, 0.107, 0.084), mesh=eye_r_mesh)
    n_eyelid_l = b.add_node("Eyelid_L", translation=(0.036, 0.107, 0.084), mesh=eyelid_l_mesh)
    n_eyelid_r = b.add_node("Eyelid_R", translation=(-0.036, 0.107, 0.084), mesh=eyelid_r_mesh)
    n_brow_l = b.add_node("Brow_L", translation=(0.037, 0.136, 0.098), mesh=brow_l_mesh)
    n_brow_r = b.add_node("Brow_R", translation=(-0.037, 0.136, 0.098), mesh=brow_r_mesh)

    n_head = b.add_node(
        "Head",
        translation=(0.0, 0.06, 0.0),
        mesh=head_mesh,
        children=[
            n_hair,
            n_moustache,
            n_upper_lip,
            n_mouth_cav,
            n_jaw,
            n_eye_l,
            n_eye_r,
            n_eyelid_l,
            n_eyelid_r,
            n_brow_l,
            n_brow_r,
        ],
    )
    n_neck = b.add_node("Neck", translation=(0.0, 0.33, 0.0), mesh=neck_mesh, children=[n_head])

    # Arms (children of Chest at world Y=1.08)
    n_hand_l = b.add_node("Hand_L", translation=(0.0, -0.23, 0.0), mesh=hand_l_mesh)
    n_fore_l = b.add_node("ForeArm_L", translation=(0.0, -0.27, 0.0), mesh=fore_arm_l_mesh, children=[n_hand_l])
    n_up_l = b.add_node(
        "UpperArm_L",
        translation=(0.188, 0.30, 0.0),
        rotation=(0.0, 0.0, -0.055, 0.99849),  # Natural slight outward arm drape
        mesh=up_arm_l_mesh,
        children=[n_fore_l],
    )

    n_hand_r = b.add_node("Hand_R", translation=(0.0, -0.23, 0.0), mesh=hand_r_mesh)
    n_fore_r = b.add_node("ForeArm_R", translation=(0.0, -0.27, 0.0), mesh=fore_arm_r_mesh, children=[n_hand_r])
    n_up_r = b.add_node(
        "UpperArm_R",
        translation=(-0.188, 0.30, 0.0),
        rotation=(0.0, 0.0, 0.055, 0.99849),
        mesh=up_arm_r_mesh,
        children=[n_fore_r],
    )

    n_lapels = b.add_node("BlazerLapels", mesh=lapels_mesh)
    n_shirt = b.add_node("BlackShirt", mesh=shirt_mesh)
    n_chest = b.add_node(
        "Chest",
        translation=(0.0, 0.16, 0.0),
        mesh=blazer_mesh,
        children=[n_lapels, n_shirt, n_neck, n_up_l, n_up_r],
    )

    # Legs (children of Hips at world Y=0.92)
    n_foot_l = b.add_node("Foot_L", translation=(0.0, -0.38, 0.0), mesh=shoe_mesh)
    n_lleg_l = b.add_node("LowerLeg_L", translation=(0.0, -0.40, 0.0), mesh=lleg_mesh, children=[n_foot_l])
    n_uleg_l = b.add_node("UpperLeg_L", translation=(0.082, -0.08, 0.0), mesh=uleg_mesh, children=[n_lleg_l])

    n_foot_r = b.add_node("Foot_R", translation=(0.0, -0.38, 0.0), mesh=shoe_mesh)
    n_lleg_r = b.add_node("LowerLeg_R", translation=(0.0, -0.40, 0.0), mesh=lleg_mesh, children=[n_foot_r])
    n_uleg_r = b.add_node("UpperLeg_R", translation=(-0.082, -0.08, 0.0), mesh=uleg_mesh, children=[n_lleg_r])

    n_belt = b.add_node("Belt", mesh=belt_mesh)
    n_buckle = b.add_node("BeltBuckle", mesh=buckle_mesh)

    n_hips = b.add_node(
        "Hips",
        translation=(0.0, 0.92, 0.0),
        mesh=pelvis_mesh,
        children=[n_chest, n_belt, n_buckle, n_uleg_l, n_uleg_r],
    )

    n_root = b.add_node("CharacterRoot", translation=(0.0, 0.0, 0.0), children=[n_hips])

    # Register formal glTF 2.0 Skin joint hierarchy (`DevCharacterRig`)
    joint_list = [
        (n_root, (0.0, 0.0, 0.0)),
        (n_hips, (0.0, 0.92, 0.0)),
        (n_chest, (0.0, 1.08, 0.0)),
        (n_neck, (0.0, 1.41, 0.0)),
        (n_head, (0.0, 1.47, 0.0)),
        (n_jaw, (0.0, 1.506, 0.082)),
        (n_eye_l, (0.036, 1.577, 0.084)),
        (n_eye_r, (-0.036, 1.577, 0.084)),
        (n_eyelid_l, (0.036, 1.577, 0.084)),
        (n_eyelid_r, (-0.036, 1.577, 0.084)),
        (n_brow_l, (0.037, 1.606, 0.098)),
        (n_brow_r, (-0.037, 1.606, 0.098)),
        (n_up_l, (0.188, 1.38, 0.0)),
        (n_fore_l, (0.188, 1.11, 0.0)),
        (n_hand_l, (0.188, 0.88, 0.0)),
        (n_up_r, (-0.188, 1.38, 0.0)),
        (n_fore_r, (-0.188, 1.11, 0.0)),
        (n_hand_r, (-0.188, 0.88, 0.0)),
        (n_uleg_l, (0.082, 0.84, 0.0)),
        (n_lleg_l, (0.082, 0.44, 0.0)),
        (n_foot_l, (0.082, 0.06, 0.0)),
        (n_uleg_r, (-0.082, 0.84, 0.0)),
        (n_lleg_r, (-0.082, 0.44, 0.0)),
        (n_foot_r, (-0.082, 0.06, 0.0)),
    ]
    b.add_skin(
        "DevCharacterRig",
        [j[0] for j in joint_list],
        [j[1] for j in joint_list],
    )

    b.export(OUT_GLB, [n_root])
    size_kb = os.path.getsize(OUT_GLB) / 1024.0
    print(f"Exported rigged 3D character GLB: {OUT_GLB} ({size_kb:.1f} KB, {len(b.nodes)} nodes, {len(b.meshes)} meshes, {len(joint_list)} rig joints)")


if __name__ == "__main__":
    build_character_glb()
