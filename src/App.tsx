import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeIsometricCanvas } from './components/canvas/ThreeIsometricCanvas';
import { Character, CharacterSignatureAbility } from './types/character';
import { allCharacters } from './data/charactersData';
import { TouchControls3D } from './engine/three/TouchControls3D';
import { CHARACTER_CONFIGS } from './engine/three/CharacterMeshBuilder';
import { TopBar, TimeOfDay, WeatherType } from './components/ui/TopBar';
import { CharacterCarousel } from './components/ui/CharacterCarousel';
import { SpeechBubble } from './components/ui/SpeechBubble';
import { CharacterModal } from './components/ui/CharacterModal';
import { audioManager } from './audio/audioManager';

export const App: React.FC = () => {
  const controlsRef = useRef<TouchControls3D | null>(null);
  const castSpellRef = useRef<((effectType: CharacterSignatureAbility['effectType'], charId: string) => void) | null>(null);
  const [characters, setCharacters] = useState<Character[]>(allCharacters);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenPositions, setScreenPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // TopBar state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [isMuted, setIsMuted] = useState(true);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId) || null;

  const handleInitControls = useCallback((controls: TouchControls3D) => {
    controlsRef.current = controls;
  }, []);

  const handleInitSpellCaster = useCallback((castFn: (effectType: CharacterSignatureAbility['effectType'], charId: string) => void) => {
    castSpellRef.current = castFn;
  }, []);

  const handleCameraUpdate = useCallback((positions: Map<string, { x: number; y: number }>) => {
    setScreenPositions(new Map(positions));
  }, []);

  const panToCharacter = useCallback((char: Character) => {
    if (!controlsRef.current) return;

    const config = CHARACTER_CONFIGS[char.id];
    if (config) {
      controlsRef.current.panTo(config.posX, config.posZ);
    } else {
      controlsRef.current.panTo(0, 0);
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
      castSpellRef.current?.('nature_bloom', 'anh-thi-druid');
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'anh-thi-druid' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'sea_bell') {
      audioManager.playAbility('tidal_wave');
      castSpellRef.current?.('tidal_wave', 'anh-thu-cleric');
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'anh-thu-cleric' || c.id === 'thanh-phuong-paladin' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'fireworks_mortar') {
      audioManager.playAbility('firework_burst');
      castSpellRef.current?.('firework_burst', 'khai-van-sorcerer');
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'khai-van-sorcerer' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'tea_pavilion') {
      audioManager.playAbility('water_slash');
      castSpellRef.current?.('water_slash', 'ngoc-ha-monk');
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'ngoc-ha-monk' ? { ...c, hopProgress: 0.01 } : c))
      );
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
    setIsModalOpen(false);
    const effectType = selectedCharacter.signatureAbility.effectType;
    audioManager.playAbility(effectType);
    // 3D visual particle explosion at character position!
    castSpellRef.current?.(effectType, selectedCharacter.id);

    // Trigger spring hop
    setCharacters((prev) =>
      prev.map((c) => (c.id === selectedCharacter.id ? { ...c, hopProgress: 0.01 } : c))
    );

    // Show spell toast notification!
    setCelebrationToast(`✨ ${selectedCharacter.nickname} thi triển [${selectedCharacter.signatureAbility.name}]!`);
    setTimeout(() => {
      setCelebrationToast(null);
    }, 3200);
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

      {/* Main 3D Three.js Isometric Canvas with all 9 friends */}
      <ThreeIsometricCanvas
        characters={characters}
        selectedCharId={selectedCharId}
        timeOfDay={timeOfDay}
        weather={weather}
        onSelectCharacter={handleSelectCharacter}
        onInteractProp={handleInteractProp}
        onCameraUpdate={handleCameraUpdate}
        onInitControls={handleInitControls}
        onInitSpellCaster={handleInitSpellCaster}
      />

      {/* Celebratory Banner Toast */}
      {celebrationToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-2.5 rounded-2xl bg-ink-900/90 border border-fantasy-gold shadow-[0_0_25px_rgba(223,166,66,0.5)] text-fantasy-gold font-serif text-sm tracking-wide text-center animate-bounce backdrop-blur-md">
          {celebrationToast}
        </div>
      )}


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

      {/* Left Docked Character List under Haven of Companions Card */}
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
