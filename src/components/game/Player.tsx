import { useRef, useEffect, useState } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const Player = () => {
  const playerRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === ' ') {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [key === ' ' ? 'space' : key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === ' ') {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [key === ' ' ? 'space' : key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys.w) {
      direction.add(cameraDirection);
    }
    if (keys.s) {
      direction.sub(cameraDirection);
    }
    if (keys.a) {
      direction.sub(right);
    }
    if (keys.d) {
      direction.add(right);
    }

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

    camera.position.set(
      position.x,
      position.y + 2,
      position.z + 5
    );
    camera.lookAt(position.x, position.y, position.z);
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
