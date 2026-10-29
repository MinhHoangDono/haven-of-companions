import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeIsometricCanvas } from './components/canvas/ThreeIsometricCanvas';
import { Character } from './types/character';
import { pilotCharacters } from './data/charactersData';
import { TouchControls3D } from './engine/three/TouchControls3D';
import { TopBar, TimeOfDay, WeatherType } from './components/ui/TopBar';
import { CharacterCarousel } from './components/ui/CharacterCarousel';
import { SpeechBubble } from './components/ui/SpeechBubble';
import { CharacterModal } from './components/ui/CharacterModal';
import { audioManager } from './audio/audioManager';

export const App: React.FC = () => {
  const controlsRef = useRef<TouchControls3D | null>(null);
  const [characters, setCharacters] = useState<Character[]>(pilotCharacters);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenPositions, setScreenPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // TopBar state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [isMuted, setIsMuted] = useState(true);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId) || null;

  const handleInitControls = useCallback((controls: TouchControls3D) => {
    controlsRef.current = controls;
  }, []);

  const handleCameraUpdate = useCallback((positions: Map<string, { x: number; y: number }>) => {
    setScreenPositions(new Map(positions));
  }, []);

  const panToCharacter = useCallback((char: Character) => {
    if (!controlsRef.current) return;

    if (char.id === 'anh-thi-druid') {
      controlsRef.current.panTo(-3.5, -4.0);
    } else {
      controlsRef.current.panTo(3.2, 1.8);
    }
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

  const handleInteractProp = useCallback((propType: string, _position: THREE.Vector3) => {
    audioManager.playTap();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }

    if (propType === 'stew_pot') {
      audioManager.playAbility('nature_bloom');
      // Hop Thi
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'anh-thi-druid' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'sea_bell') {
      audioManager.playAbility('water_slash');
      // Hop Thanh Phương
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'thanh-phuong-paladin' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'fireworks_mortar') {
      audioManager.playAbility('firework_burst');
    } else if (propType === 'tea_pavilion') {
      audioManager.playToast();
    }
  }, []);

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

  const activeBubbleScreenPos = selectedCharId ? screenPositions.get(selectedCharId) : null;

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

      {/* Main 3D Three.js Isometric Canvas */}
      <ThreeIsometricCanvas
        characters={characters}
        selectedCharId={selectedCharId}
        timeOfDay={timeOfDay}
        weather={weather}
        onSelectCharacter={handleSelectCharacter}
        onInteractProp={handleInteractProp}
        onCameraUpdate={handleCameraUpdate}
        onInitControls={handleInitControls}
      />

      {/* In-World Floating Speech Bubble */}
      {selectedCharacter && activeBubbleScreenPos && !isModalOpen && (
        <SpeechBubble
          character={selectedCharacter}
          screenPos={activeBubbleScreenPos}
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
