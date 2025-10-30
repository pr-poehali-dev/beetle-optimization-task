import { useRef, useEffect, useState } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const Player = () => {
  const playerRef = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  });
  const [rotation, setRotation] = useState({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        const sensitivity = 0.002;
        setRotation(prev => ({
          yaw: prev.yaw - e.movementX * sensitivity,
          pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch - e.movementY * sensitivity))
        }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'control') {
        e.preventDefault();
        if (document.pointerLockElement !== canvas) {
          canvas.requestPointerLock();
        } else {
          document.exitPointerLock();
        }
      }
      
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === ' ') {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [key === ' ' ? 'space' : key]: true }));
      }
      
      if (key === 'escape') {
        document.exitPointerLock();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === ' ') {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [key === ' ' ? 'space' : key]: false }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!playerRef.current) return;
    
    const position = playerRef.current.translation();
    const velocity = playerRef.current.linvel();
    
    if (position.y < -10) {
      playerRef.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const speed = 5;
    const direction = new THREE.Vector3();
    
    const forward = new THREE.Vector3(
      Math.sin(rotation.yaw),
      0,
      Math.cos(rotation.yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(rotation.yaw),
      0,
      -Math.sin(rotation.yaw)
    );

    if (keys.w) direction.add(forward);
    if (keys.s) direction.sub(forward);
    if (keys.a) direction.sub(right);
    if (keys.d) direction.add(right);

    if (direction.length() > 0) {
      direction.normalize();
      playerRef.current.setLinvel({
        x: direction.x * speed,
        y: velocity.y,
        z: direction.z * speed
      }, true);
    } else {
      playerRef.current.setLinvel({
        x: 0,
        y: velocity.y,
        z: 0
      }, true);
    }

    if (keys.space && Math.abs(velocity.y) < 0.1) {
      playerRef.current.setLinvel({
        x: velocity.x,
        y: 8,
        z: velocity.z
      }, true);
    }

    const cameraOffset = new THREE.Vector3(
      -Math.sin(rotation.yaw) * 5 * Math.cos(rotation.pitch),
      2 + Math.sin(rotation.pitch) * 5,
      -Math.cos(rotation.yaw) * 5 * Math.cos(rotation.pitch)
    );

    camera.position.set(
      position.x + cameraOffset.x,
      position.y + cameraOffset.y,
      position.z + cameraOffset.z
    );
    camera.lookAt(position.x, position.y + 1, position.z);
  });

  return (
    <RigidBody
      ref={playerRef}
      position={[0, 5, 0]}
      colliders="ball"
      restitution={0}
      friction={1}
      linearDamping={0.5}
      lockRotations
    >
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.7} roughness={0.2} />
      </mesh>
    </RigidBody>
  );
};

export default Player;