import React, { useCallback, useRef, useState } from 'react';
import { IsometricCanvas } from './components/canvas/IsometricCanvas';
import { CameraState, ScreenCoord, Viewport, BASE_TILE } from './types/engine';
import { Character } from './types/character';
import { villageMap } from './data/villageMapData';
import { pilotCharacters } from './data/charactersData';
import { renderTile } from './engine/tileRenderer';
import { EntityPipeline, RenderableEntity } from './engine/entityPipeline';
import { TouchController } from './engine/touchController';
import { TopBar, TimeOfDay, WeatherType } from './components/ui/TopBar';
import { CharacterCarousel } from './components/ui/CharacterCarousel';
import { SpeechBubble } from './components/ui/SpeechBubble';
import { CharacterModal } from './components/ui/CharacterModal';
import { renderLightingPass } from './engine/lighting';
import { ParticleSystem } from './engine/particles';
import { audioManager } from './audio/audioManager';

export const App: React.FC = () => {
  const controllerRef = useRef<TouchController | null>(null);
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const [characters, setCharacters] = useState<Character[]>(pilotCharacters);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.35,
    zoom: 1.0,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight * 0.35,
    targetZoom: 1.0,
    isPanning: false,
  });

  // TopBar state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [isMuted, setIsMuted] = useState(true);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId) || null;

  const handleInitController = useCallback((controller: TouchController) => {
    controllerRef.current = controller;
  }, []);

  const handleCameraChange = useCallback((cam: CameraState) => {
    setCameraState({ ...cam });
  }, []);

  const panToCharacter = useCallback((char: Character) => {
    if (!controllerRef.current) return;
    const elev = char.gridPos.elevation;
    const currentZoom = controllerRef.current.getCamera().zoom;

    // Center in world coordinates
    const worldX = (char.gridPos.x - char.gridPos.y) * (BASE_TILE.width / 2);
    const worldY = (char.gridPos.x + char.gridPos.y) * (BASE_TILE.height / 2) - elev * (BASE_TILE.height / 2);

    const targetCamX = window.innerWidth / 2 - worldX * currentZoom;
    const targetCamY = window.innerHeight * 0.45 - worldY * currentZoom;

    controllerRef.current.panTo(targetCamX, targetCamY);
  }, []);

  const handleSelectCharacter = useCallback((char: Character) => {
    audioManager.playTap();
    setSelectedCharId(char.id);

    // Hop animation
    setCharacters((prev) =>
      prev.map((c) => (c.id === char.id ? { ...c, hopProgress: 0.01 } : c))
    );

    panToCharacter(char);
  }, [panToCharacter]);

  const handleTap = useCallback((screenPos: ScreenCoord) => {
    audioManager.playTap();
    if (!controllerRef.current) return;
    const camera = controllerRef.current.getCamera();

    // Raycast character
    const hitChar = EntityPipeline.raycastCharacters(screenPos, characters, camera, BASE_TILE);

    if (hitChar) {
      handleSelectCharacter(hitChar);
    } else {
      setSelectedCharId(null);
    }
  }, [characters, handleSelectCharacter]);

  const handleToggleTimeOfDay = useCallback(() => {
    audioManager.playTap();
    const cycle: TimeOfDay[] = ['dawn', 'day', 'sunset', 'night'];
    setTimeOfDay((prev) => cycle[(cycle.indexOf(prev) + 1) % cycle.length]);
  }, []);

  const handleToggleWeather = useCallback(() => {
    audioManager.playTap();
    setWeather((prev) => (prev === 'clear' ? 'mist' : 'clear'));
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioManager.setMuted(nextMuted);
  }, [isMuted]);

  const handleTriggerAbility = useCallback(() => {
    if (!selectedCharacter) return;
    const effectType = selectedCharacter.signatureAbility.effectType;
    audioManager.playAbility(effectType);

    // Trigger visual particle explosion
    particleSystemRef.current.triggerAbilityBurst(
      selectedCharacter.gridPos.x,
      selectedCharacter.gridPos.y,
      effectType
    );

    // Trigger spring hop
    setCharacters((prev) =>
      prev.map((c) => (c.id === selectedCharacter.id ? { ...c, hopProgress: 0.01 } : c))
    );
  }, [selectedCharacter]);
  const handleToast = useCallback(() => {
    audioManager.playToast();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15]);
    }
  }, []);

  const renderFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    viewport: Viewport,
    time: number,
    deltaTime: number
  ) => {
    // 1. Render map tiles
    for (const tile of villageMap.tiles) {
      renderTile(ctx, tile, camera, BASE_TILE, time);
    }

    // 2. Advance hop progress
    setCharacters((prev) => {
      let changed = false;
      const next = prev.map((c) => {
        if (c.hopProgress !== undefined && c.hopProgress > 0) {
          changed = true;
          const nextProg = c.hopProgress + deltaTime / 320;
          return nextProg >= 1 ? { ...c, hopProgress: 0 } : { ...c, hopProgress: nextProg };
        }
        return c;
      });
      return changed ? next : prev;
    });

    // 3. Render combined Y-sorted entities (props + characters)
    const sortedEntities: RenderableEntity[] = EntityPipeline.getSortedEntities(
      villageMap.props,
      characters
    );

    EntityPipeline.renderEntities(
      ctx,
      sortedEntities,
      camera,
      BASE_TILE,
      time,
      selectedCharId
    );

    // 4. Update and render particle systems (mist, embers, ability bursts)
    particleSystemRef.current.update(weather);
    particleSystemRef.current.render(ctx, camera, viewport);

    // 5. Ambient & Point Lighting post-processing pass
    renderLightingPass(ctx, timeOfDay, camera, viewport, time);
  }, [characters, selectedCharId, timeOfDay, weather]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink-900 select-none">
      {/* Top Status Bar */}
      <TopBar
        timeOfDay={timeOfDay}
        weather={weather}
        isMuted={isMuted}
        onToggleTimeOfDay={handleToggleTimeOfDay}
        onToggleWeather={handleToggleWeather}
        onToggleMute={handleToggleMute}
      />

      {/* Main Isometric Canvas */}
      <IsometricCanvas
        onTap={handleTap}
        onCameraChange={handleCameraChange}
        onInitController={handleInitController}
        renderFrame={renderFrame}
      />

      {/* In-World Floating Speech Bubble */}
      {selectedCharacter && !isModalOpen && (
        <SpeechBubble
          character={selectedCharacter}
          camera={cameraState}
          onOpenDetails={() => setIsModalOpen(true)}
          onClose={() => setSelectedCharId(null)}
          onTriggerAbility={handleTriggerAbility}
        />
      )}

      {/* Bottom Thumb-Zone Carousel */}
      <CharacterCarousel
        characters={characters}
        selectedCharId={selectedCharId}
        onSelectCharacter={handleSelectCharacter}
        onOpenDetails={(char) => {
          setSelectedCharId(char.id);
          setIsModalOpen(true);
        }}
      />

      {/* Expandable Character Sheet Modal */}
      {isModalOpen && (
        <CharacterModal
          character={selectedCharacter}
          onClose={() => setIsModalOpen(false)}
          onTriggerAbility={handleTriggerAbility}
          onToast={handleToast}
        />
      )}
    </div>
  );
};

export default App;
