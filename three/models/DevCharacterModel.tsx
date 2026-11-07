'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { LiveSpeechFrameState } from '@/lib/audio/studio-audio-context';

interface DevCharacterModelProps {
  pointerRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
  speechFrameRef: React.MutableRefObject<LiveSpeechFrameState>;
  isTouchDevice: boolean;
  reducedMotion: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

interface RigRefs {
  hips?: THREE.Object3D;
  chest?: THREE.Object3D;
  neck?: THREE.Object3D;
  head?: THREE.Object3D;
  jaw?: THREE.Object3D;
  eyeL?: THREE.Object3D;
  eyeR?: THREE.Object3D;
  eyelidL?: THREE.Object3D;
  eyelidR?: THREE.Object3D;
  browL?: THREE.Object3D;
  browR?: THREE.Object3D;
  upperArmL?: THREE.Object3D;
  foreArmL?: THREE.Object3D;
  handL?: THREE.Object3D;
  upperArmR?: THREE.Object3D;
  foreArmR?: THREE.Object3D;
  handR?: THREE.Object3D;
}

export function DevCharacterModel({
  pointerRef,
  speechFrameRef,
  isTouchDevice,
  reducedMotion,
  position = [0, 0, 0.38],
  rotation = [0, 0, 0],
}: DevCharacterModelProps) {
  const gltf = useGLTF('/models/dev-character.glb');
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);

  const rig = useMemo<RigRefs>(() => {
    const find = (name: string) => clonedScene.getObjectByName(name);
    return {
      hips: find('Hips'),
      chest: find('Chest'),
      neck: find('Neck'),
      head: find('Head'),
      jaw: find('Jaw'),
      eyeL: find('Eye_L'),
      eyeR: find('Eye_R'),
      eyelidL: find('Eyelid_L'),
      eyelidR: find('Eyelid_R'),
      browL: find('Brow_L'),
      browR: find('Brow_R'),
      upperArmL: find('UpperArm_L'),
      foreArmL: find('ForeArm_L'),
      handL: find('Hand_L'),
      upperArmR: find('UpperArm_R'),
      foreArmR: find('ForeArm_R'),
      handR: find('Hand_R'),
    };
  }, [clonedScene]);

  const blinkState = useRef({
    nextBlinkAt: 2.2,
    blinkProgress: 0,
    isBlinking: false,
  });

  // Base bind-pose offsets captured once
  const basePose = useRef({
    jawY: 0.036,
    browLY: 0.136,
    browRY: 0.136,
    chestY: 0.16,
  });

  useEffect(() => {
    if (rig.jaw) basePose.current.jawY = rig.jaw.position.y;
    if (rig.browL) basePose.current.browLY = rig.browL.position.y;
    if (rig.browR) basePose.current.browRY = rig.browR.position.y;
    if (rig.chest) basePose.current.chestY = rig.chest.position.y;
  }, [rig]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const speech = speechFrameRef.current;
    const ptr = pointerRef.current;

    // Lerp factor strictly within 0.08 - 0.18 per Phase 3.6 specification
    const lerpFactor = reducedMotion ? 0.08 : 0.12;

    // 1. Pointer Head & Eye Tracking (or gentle autonomous motion on touch devices)
    let targetYaw = 0;
    let targetPitch = 0;

    if (!isTouchDevice && ptr.active && !reducedMotion) {
      targetYaw = THREE.MathUtils.clamp(ptr.x * 0.34, -0.36, 0.36);
      targetPitch = THREE.MathUtils.clamp(-ptr.y * 0.19, -0.21, 0.21);
    } else if (!reducedMotion) {
      // Gentle lifelike studio gaze drift
      targetYaw = Math.sin(t * 0.55) * 0.08 + Math.sin(t * 0.23) * 0.04;
      targetPitch = Math.cos(t * 0.42) * 0.035;
    }

    // Add subtle speech head nod micro-motion
    const speechNod = speech.isSpeaking && !reducedMotion ? Math.sin(t * 5.2) * 0.025 * speech.amplitude : 0;
    const speechTilt = speech.isSpeaking && !reducedMotion ? Math.cos(t * 2.3) * 0.028 : 0;

    if (rig.head) {
      rig.head.rotation.y = THREE.MathUtils.lerp(rig.head.rotation.y, targetYaw * 0.72, lerpFactor);
      rig.head.rotation.x = THREE.MathUtils.lerp(
        rig.head.rotation.x,
        targetPitch * 0.72 + speechNod,
        lerpFactor
      );
      rig.head.rotation.z = THREE.MathUtils.lerp(rig.head.rotation.z, speechTilt, 0.09);
    }

    if (rig.neck) {
      rig.neck.rotation.y = THREE.MathUtils.lerp(rig.neck.rotation.y, targetYaw * 0.25, 0.10);
      rig.neck.rotation.x = THREE.MathUtils.lerp(rig.neck.rotation.x, targetPitch * 0.22, 0.10);
    }

    // Articulated Eye_L and Eye_R tracking cursor slightly faster than head
    const eyeYaw = THREE.MathUtils.clamp(targetYaw * 0.55, -0.24, 0.24);
    const eyePitch = THREE.MathUtils.clamp(targetPitch * 0.55, -0.16, 0.16);
    if (rig.eyeL) {
      rig.eyeL.rotation.y = THREE.MathUtils.lerp(rig.eyeL.rotation.y, eyeYaw, 0.18);
      rig.eyeL.rotation.x = THREE.MathUtils.lerp(rig.eyeL.rotation.x, eyePitch, 0.18);
    }
    if (rig.eyeR) {
      rig.eyeR.rotation.y = THREE.MathUtils.lerp(rig.eyeR.rotation.y, eyeYaw, 0.18);
      rig.eyeR.rotation.x = THREE.MathUtils.lerp(rig.eyeR.rotation.x, eyePitch, 0.18);
    }

    // 2. Natural Stochastic Human Blinking (Eyelid_L / Eyelid_R)
    const bs = blinkState.current;
    if (!bs.isBlinking && t >= bs.nextBlinkAt) {
      bs.isBlinking = true;
      bs.blinkProgress = 0;
    }
    let lidAngle = 0.08; // Relaxed upper lid rest angle
    if (bs.isBlinking) {
      bs.blinkProgress += delta * 7.8;
      if (bs.blinkProgress >= Math.PI) {
        bs.isBlinking = false;
        // Occasional natural double-blink (18% probability)
        bs.nextBlinkAt = t + (Math.random() < 0.18 ? 0.22 : 2.6 + Math.random() * 2.8);
      } else {
        lidAngle = 0.08 + Math.sin(bs.blinkProgress) * 1.28;
      }
    }
    if (rig.eyelidL) rig.eyelidL.rotation.x = lidAngle;
    if (rig.eyelidR) rig.eyelidR.rotation.x = lidAngle;

    // 3. Audio-Synchronized Lip-Sync (Jaw + Viseme Width + Eyebrow Expression)
    const amp = speech.isSpeaking ? speech.amplitude : 0;
    let jawDrop = 0;
    let jawWidthScale = 1.0;

    if (speech.isSpeaking && amp > 0.02) {
      const visemeMul =
        speech.viseme === 'open'
          ? 1.15
          : speech.viseme === 'round'
          ? 0.92
          : speech.viseme === 'wide'
          ? 0.72
          : 0.58;
      jawDrop = Math.min(0.014, amp * 0.013 * visemeMul);
      jawWidthScale =
        speech.viseme === 'wide' ? 1.12 : speech.viseme === 'round' ? 0.86 : 1.0;
    }

    if (rig.jaw) {
      rig.jaw.position.y = THREE.MathUtils.lerp(
        rig.jaw.position.y,
        basePose.current.jawY - jawDrop,
        0.28
      );
      rig.jaw.rotation.x = THREE.MathUtils.lerp(rig.jaw.rotation.x, amp * 0.22, 0.26);
      rig.jaw.scale.x = THREE.MathUtils.lerp(rig.jaw.scale.x, jawWidthScale, 0.22);
    }

    const browLift = speech.isSpeaking ? amp * 0.0045 : 0;
    if (rig.browL) {
      rig.browL.position.y = THREE.MathUtils.lerp(
        rig.browL.position.y,
        basePose.current.browLY + browLift,
        0.16
      );
    }
    if (rig.browR) {
      rig.browR.position.y = THREE.MathUtils.lerp(
        rig.browR.position.y,
        basePose.current.browRY + browLift,
        0.16
      );
    }

    // 4. Natural Idle Breathing & Subtle Conversational Hand Gestures
    const breath = reducedMotion ? 0 : Math.sin(t * 1.65) * 0.0045;
    if (rig.chest) {
      rig.chest.position.y = basePose.current.chestY + breath;
      rig.chest.rotation.y = THREE.MathUtils.lerp(rig.chest.rotation.y, targetYaw * 0.14, 0.08);
    }

    // Restrained studio posture + subtle gestures during key speech statements
    let rUpperX = -0.14;
    let rUpperZ = 0.11;
    let rForeX = -0.32;
    let lUpperX = -0.12;
    let lUpperZ = -0.11;
    let lForeX = -0.28;

    if (speech.isSpeaking && !reducedMotion) {
      const wave = Math.sin(t * 2.8);
      switch (speech.gesture) {
        case 'welcome':
          rUpperX = -0.46 + wave * 0.06;
          rUpperZ = 0.22;
          rForeX = -0.78 + wave * 0.08;
          break;
        case 'emphasis':
          rUpperX = -0.36;
          lUpperX = -0.34;
          rForeX = -0.68 + wave * 0.07;
          lForeX = -0.64 - wave * 0.06;
          break;
        case 'showcase':
          // Subtle gesture toward the studio monitors behind/beside Dev
          lUpperX = -0.48 + wave * 0.05;
          lUpperZ = -0.26;
          lForeX = -0.72 + wave * 0.07;
          break;
        case 'sweep':
          rUpperX = -0.40;
          rUpperZ = 0.28;
          rForeX = -0.62 + wave * 0.06;
          break;
        case 'invite':
          rUpperX = -0.42;
          lUpperX = -0.40;
          rUpperZ = 0.20;
          lUpperZ = -0.20;
          rForeX = -0.70 + wave * 0.05;
          lForeX = -0.68 + wave * 0.05;
          break;
      }
    }

    if (rig.upperArmR) {
      rig.upperArmR.rotation.x = THREE.MathUtils.lerp(rig.upperArmR.rotation.x, rUpperX, 0.08);
      rig.upperArmR.rotation.z = THREE.MathUtils.lerp(rig.upperArmR.rotation.z, rUpperZ, 0.08);
    }
    if (rig.foreArmR) {
      rig.foreArmR.rotation.x = THREE.MathUtils.lerp(rig.foreArmR.rotation.x, rForeX, 0.10);
    }
    if (rig.upperArmL) {
      rig.upperArmL.rotation.x = THREE.MathUtils.lerp(rig.upperArmL.rotation.x, lUpperX, 0.08);
      rig.upperArmL.rotation.z = THREE.MathUtils.lerp(rig.upperArmL.rotation.z, lUpperZ, 0.08);
    }
    if (rig.foreArmL) {
      rig.foreArmL.rotation.x = THREE.MathUtils.lerp(rig.foreArmL.rotation.x, lForeX, 0.10);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/models/dev-character.glb');
