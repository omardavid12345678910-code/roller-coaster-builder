import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";
import { Button } from "@/components/ui/button";

export function GameUI() {
  const {
    mode,
    trackPoints,
    startRide,
    stopRide,
    clearTrack,
    rideProgress,
    isRiding,
    selectedPointId,
    removeTrackPoint,
    rideSpeed,
    setRideSpeed,
  } = useRollerCoaster();
  
  const canRide = trackPoints.length >= 2;
  
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="absolute top-4 left-4 pointer-events-auto bg-black/70 p-4 rounded-lg text-white max-w-xs">
        <h1 className="text-xl font-bold mb-2">Roller Coaster Builder</h1>
        
        {mode === "build" && (
          <>
            <p className="text-sm text-gray-300 mb-3">
              Click on the ground to place track points. Drag up/down before releasing to set height.
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Points: {trackPoints.length}
            </p>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={startRide}
                disabled={!canRide}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Ride
              </Button>
              
              <Button
                onClick={clearTrack}
                variant="destructive"
                disabled={trackPoints.length === 0}
              >
                Clear Track
              </Button>
              
              {selectedPointId && (
                <Button
                  onClick={() => removeTrackPoint(selectedPointId)}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/20"
                >
                  Delete Selected Point
                </Button>
              )}
            </div>
            
            <div className="mt-4">
              <label className="text-sm text-gray-300 block mb-1">
                Ride Speed: {rideSpeed.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.25"
                value={rideSpeed}
                onChange={(e) => setRideSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
        
        {mode === "ride" && (
          <>
            <p className="text-sm text-gray-300 mb-3">
              Enjoy the ride!
            </p>
            
            <div className="mb-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${rideProgress * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Progress: {Math.round(rideProgress * 100)}%
              </p>
            </div>
            
            <Button
              onClick={stopRide}
              variant="outline"
              className="border-white text-white hover:bg-white/20"
            >
              Exit Ride
            </Button>
          </>
        )}
      </div>
      
      <div className="absolute bottom-4 left-4 pointer-events-auto bg-black/70 p-3 rounded-lg text-white text-sm">
        <h3 className="font-semibold mb-1">Controls:</h3>
        {mode === "build" ? (
          <ul className="text-gray-300 text-xs space-y-1">
            <li>• Click ground to place points</li>
            <li>• Drag while clicking to set height</li>
            <li>• Click points to select</li>
            <li>• Drag points to move them</li>
            <li>• Use mouse to orbit camera</li>
            <li>• Scroll to zoom</li>
          </ul>
        ) : (
          <p className="text-gray-300 text-xs">Sit back and enjoy!</p>
        )}
      </div>
    </div>
  );
}
