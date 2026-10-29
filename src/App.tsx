import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Users } from 'lucide-react';
import { ThreeIsometricCanvas } from './components/canvas/ThreeIsometricCanvas';
import { Character } from './types/character';
import { allCharacters } from './data/charactersData';
import { TouchControls3D } from './engine/three/TouchControls3D';
import { TopBar, TimeOfDay, WeatherType } from './components/ui/TopBar';
import { CharacterCarousel } from './components/ui/CharacterCarousel';
import { SpeechBubble } from './components/ui/SpeechBubble';
import { CharacterModal } from './components/ui/CharacterModal';
import { audioManager } from './audio/audioManager';

export const App: React.FC = () => {
  const controlsRef = useRef<TouchControls3D | null>(null);
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

  const handleCameraUpdate = useCallback((positions: Map<string, { x: number; y: number }>) => {
    setScreenPositions(new Map(positions));
  }, []);

  const panToCharacter = useCallback((char: Character) => {
    if (!controlsRef.current) return;

    switch (char.id) {
      case 'anh-thi-druid':
        controlsRef.current.panTo(-2.8, -3.0);
        break;
      case 'phuong-quynh-ranger':
        controlsRef.current.panTo(-4.8, -1.2);
        break;
      case 'tram-anh-bard':
        controlsRef.current.panTo(2.4, -4.0);
        break;
      case 'khai-van-sorcerer':
        controlsRef.current.panTo(4.2, -1.5);
        break;
      case 'thao-uyen-cleric':
        controlsRef.current.panTo(0.8, -1.2);
        break;
      case 'ngoc-ha-monk':
        controlsRef.current.panTo(5.2, 0.8);
        break;
      case 'thanh-phuong-paladin':
        controlsRef.current.panTo(0.5, 2.4);
        break;
      case 'xuan-minh-rogue':
        controlsRef.current.panTo(2.6, 4.2);
        break;
      case 'anh-thu-cleric':
        controlsRef.current.panTo(5.5, 3.6);
        break;
      default:
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
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'anh-thi-druid' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'sea_bell') {
      audioManager.playAbility('tidal_wave');
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'anh-thu-cleric' || c.id === 'thanh-phuong-paladin' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'fireworks_mortar') {
      audioManager.playAbility('firework_burst');
      setCharacters((prev) =>
        prev.map((c) => (c.id === 'khai-van-sorcerer' ? { ...c, hopProgress: 0.01 } : c))
      );
    } else if (propType === 'tea_pavilion') {
      audioManager.playAbility('water_slash');
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
    const effectType = selectedCharacter.signatureAbility.effectType;
    audioManager.playAbility(effectType);

    // Trigger spring hop
    setCharacters((prev) =>
      prev.map((c) => (c.id === selectedCharacter.id ? { ...c, hopProgress: 0.01 } : c))
    );
  }, [selectedCharacter]);

  const handlePartyReunionFeast = useCallback(() => {
    audioManager.playCelebrationCheer();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40, 100]);
    }

    // Wave hop all 9 friends!
    setCharacters((prev) =>
      prev.map((c, i) => ({ ...c, hopProgress: 0.01 + (i % 3) * 0.1 }))
    );

    // Center camera on Town Square Plaza
    controlsRef.current?.panTo(1.5, -1.5);

    setCelebrationToast('🍻 Hội Ngộ Tri Kỷ: Tất cả 9 người bạn đang tề tựu reo vui mừng ngày hội!');
    setTimeout(() => {
      setCelebrationToast(null);
    }, 4500);
  }, []);

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
      />

      {/* Celebratory Banner Toast */}
      {celebrationToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-2.5 rounded-2xl bg-ink-900/90 border border-fantasy-gold shadow-[0_0_25px_rgba(223,166,66,0.5)] text-fantasy-gold font-serif text-sm tracking-wide text-center animate-bounce backdrop-blur-md">
          {celebrationToast}
        </div>
      )}

      {/* Floating Action Button: Party Reunion Feast */}
      <div className="absolute bottom-24 right-4 z-20 pointer-events-auto">
        <button
          onClick={handlePartyReunionFeast}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-fantasy-gold to-amber-500 text-ink-900 font-bold text-xs tracking-wider uppercase shadow-[0_4px_20px_rgba(223,166,66,0.45)] hover:scale-105 active:scale-95 transition-all border border-yellow-200"
          title="Tề tựu tất cả 9 người bạn trong ngày hội Làng Tri Kỷ"
        >
          <Sparkles className="w-4 h-4 text-ink-950 animate-spin" />
          <span className="hidden sm:inline">Hội Ngộ</span> 9 Tri Kỷ
          <Users className="w-4 h-4 text-ink-950" />
        </button>
      </div>

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

      {/* Bottom Thumb-Zone Carousel (Smooth scroll for all 9 friends) */}
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
