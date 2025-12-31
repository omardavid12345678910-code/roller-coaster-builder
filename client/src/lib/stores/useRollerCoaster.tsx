import { create } from "zustand";
import * as THREE from "three";

export type CoasterMode = "build" | "ride" | "preview";

export interface TrackPoint {
  id: string;
  position: THREE.Vector3;
  tilt: number;
}

interface RollerCoasterState {
  mode: CoasterMode;
  trackPoints: TrackPoint[];
  selectedPointId: string | null;
  rideProgress: number;
  isRiding: boolean;
  rideSpeed: number;
  isDraggingPoint: boolean;
  isAddingPoints: boolean;
  isLooped: boolean;
  hasChainLift: boolean;
  showWoodSupports: boolean;
  isNightMode: boolean;
  cameraTarget: THREE.Vector3 | null;
  
  setMode: (mode: CoasterMode) => void;
  setCameraTarget: (target: THREE.Vector3 | null) => void;
  addTrackPoint: (position: THREE.Vector3) => void;
  updateTrackPoint: (id: string, position: THREE.Vector3) => void;
  updateTrackPointTilt: (id: string, tilt: number) => void;
  removeTrackPoint: (id: string) => void;
  createLoopAtPoint: (id: string) => void;
  selectPoint: (id: string | null) => void;
  clearTrack: () => void;
  setRideProgress: (progress: number) => void;
  setIsRiding: (riding: boolean) => void;
  setRideSpeed: (speed: number) => void;
  setIsDraggingPoint: (dragging: boolean) => void;
  setIsAddingPoints: (adding: boolean) => void;
  setIsLooped: (looped: boolean) => void;
  setHasChainLift: (hasChain: boolean) => void;
  setShowWoodSupports: (show: boolean) => void;
  setIsNightMode: (night: boolean) => void;
  startRide: () => void;
  stopRide: () => void;
}

let pointCounter = 0;

export const useRollerCoaster = create<RollerCoasterState>((set, get) => ({
  mode: "build",
  trackPoints: [],
  selectedPointId: null,
  rideProgress: 0,
  isRiding: false,
  rideSpeed: 1.0,
  isDraggingPoint: false,
  isAddingPoints: true,
  isLooped: false,
  hasChainLift: true,
  showWoodSupports: false,
  isNightMode: false,
  cameraTarget: null,
  
  setMode: (mode) => set({ mode }),
  
  setCameraTarget: (target) => set({ cameraTarget: target }),
  
  setIsDraggingPoint: (dragging) => set({ isDraggingPoint: dragging }),
  
  setIsAddingPoints: (adding) => set({ isAddingPoints: adding }),
  
  setIsLooped: (looped) => set({ isLooped: looped }),
  
  setHasChainLift: (hasChain) => set({ hasChainLift: hasChain }),
  
  setShowWoodSupports: (show) => set({ showWoodSupports: show }),
  
  setIsNightMode: (night) => set({ isNightMode: night }),
  
  addTrackPoint: (position) => {
    const id = `point-${++pointCounter}`;
    set((state) => ({
      trackPoints: [...state.trackPoints, { id, position: position.clone(), tilt: 0 }],
    }));
  },
  
  updateTrackPoint: (id, position) => {
    set((state) => ({
      trackPoints: state.trackPoints.map((point) =>
        point.id === id ? { ...point, position: position.clone() } : point
      ),
    }));
  },
  
  updateTrackPointTilt: (id, tilt) => {
    set((state) => ({
      trackPoints: state.trackPoints.map((point) =>
        point.id === id ? { ...point, tilt } : point
      ),
    }));
  },
  
  removeTrackPoint: (id) => {
    set((state) => ({
      trackPoints: state.trackPoints.filter((point) => point.id !== id),
      selectedPointId: state.selectedPointId === id ? null : state.selectedPointId,
    }));
  },
  
  createLoopAtPoint: (id) => {
    set((state) => {
      const pointIndex = state.trackPoints.findIndex((p) => p.id === id);
      if (pointIndex === -1) return state;
      
      const basePoint = state.trackPoints[pointIndex];
      const pos = basePoint.position;
      
      let direction = new THREE.Vector3(1, 0, 0);
      if (pointIndex > 0) {
        const prevPoint = state.trackPoints[pointIndex - 1];
        direction = pos.clone().sub(prevPoint.position).normalize();
        direction.y = 0;
        if (direction.length() < 0.1) {
          direction = new THREE.Vector3(1, 0, 0);
        } else {
          direction.normalize();
        }
      }
      
      const loopRadius = 10;
      const numLoopPoints = 16;
      const allPoints: TrackPoint[] = [];
      
      // Loop center is positioned so entrance is behind it, exit is in front
      // The loop sits with its center at loopRadius height, entrance at back-bottom
      const loopCenterForward = loopRadius; // Center is one radius ahead
      const loopCenterX = pos.x + direction.x * loopCenterForward;
      const loopCenterZ = pos.z + direction.z * loopCenterForward;
      const loopCenterY = pos.y + loopRadius; // Center at radius height
      
      // Lead-in: rise smoothly toward the back of the loop
      allPoints.push({
        id: `point-${++pointCounter}`,
        position: new THREE.Vector3(
          pos.x + direction.x * 3,
          pos.y + 2,
          pos.z + direction.z * 3
        ),
        tilt: 0
      });
      
      // Main loop: start at back-bottom, go up the back, over top, down the front
      // Angle 0 = back of loop (behind center), going counter-clockwise when viewed from the side
      for (let i = 0; i <= numLoopPoints; i++) {
        // Start at -PI/2 (back-bottom), end at 3*PI/2 (front-bottom, but we stop at full circle)
        const angle = -Math.PI / 2 + (i / numLoopPoints) * Math.PI * 2;
        
        // cos(angle) gives forward/back position: -1 at back, +1 at front
        const forwardOffset = Math.cos(angle) * loopRadius;
        // sin(angle) gives height: -1 at bottom, +1 at top
        const heightOffset = Math.sin(angle) * loopRadius;
        
        const newPos = new THREE.Vector3(
          loopCenterX + direction.x * forwardOffset,
          loopCenterY + heightOffset,
          loopCenterZ + direction.z * forwardOffset
        );
        
        // Skip first and last points if they overlap with lead-in/lead-out
        if (i === 0) continue;
        if (i === numLoopPoints) continue;
        
        allPoints.push({
          id: `point-${++pointCounter}`,
          position: newPos,
          tilt: 0
        });
      }
      
      // Lead-out: descend smoothly from the front of the loop, continuing forward
      const exitForward = loopCenterForward + loopRadius; // Exit is one diameter ahead of entry
      allPoints.push({
        id: `point-${++pointCounter}`,
        position: new THREE.Vector3(
          pos.x + direction.x * (exitForward + 3),
          pos.y + 2,
          pos.z + direction.z * (exitForward + 3)
        ),
        tilt: 0
      });
      allPoints.push({
        id: `point-${++pointCounter}`,
        position: new THREE.Vector3(
          pos.x + direction.x * (exitForward + 8),
          pos.y,
          pos.z + direction.z * (exitForward + 8)
        ),
        tilt: 0
      });
      
      const newTrackPoints = [
        ...state.trackPoints.slice(0, pointIndex + 1),
        ...allPoints,
        ...state.trackPoints.slice(pointIndex + 1)
      ];
      
      return { trackPoints: newTrackPoints };
    });
  },
  
  selectPoint: (id) => set({ selectedPointId: id }),
  
  clearTrack: () => {
    set({ trackPoints: [], selectedPointId: null, rideProgress: 0, isRiding: false });
  },
  
  setRideProgress: (progress) => set({ rideProgress: progress }),
  
  setIsRiding: (riding) => set({ isRiding: riding }),
  
  setRideSpeed: (speed) => set({ rideSpeed: speed }),
  
  startRide: () => {
    const { trackPoints } = get();
    if (trackPoints.length >= 2) {
      set({ mode: "ride", isRiding: true, rideProgress: 0 });
    }
  },
  
  stopRide: () => {
    set({ mode: "build", isRiding: false, rideProgress: 0 });
  },
}));
