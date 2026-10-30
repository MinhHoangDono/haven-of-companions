import { InspectorBar } from './components/ui/InspectorBar';
import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeIsometricCanvas } from './components/canvas/ThreeIsometricCanvas';
import { Character, AbilityEffectType } from './types/character';
import { InteractiveHit } from './types/threeEngine';
import { CollectibleItem } from './types/platformer';
import { allCharacters } from './data/charactersData';
import { TouchControls3D } from './engine/three/TouchControls3D';
import { CHARACTER_CONFIGS } from './engine/three/CharacterMeshBuilder';
import { TopBar, TimeOfDay, WeatherType } from './components/ui/TopBar';
import { CharacterCarousel } from './components/ui/CharacterCarousel';
import { SpeechBubble } from './components/ui/SpeechBubble';
import { CharacterModal } from './components/ui/CharacterModal';
import { audioManager } from './audio/audioManager';
import { ArrowUp } from 'lucide-react';
import { BuilderToolbar } from './components/ui/builder/BuilderToolbar';
import { SaveLoadModal } from './components/ui/builder/SaveLoadModal';
import { CityBuilderController } from './engine/three/builder/CityBuilderController';
import { BuilderTool, PlacedStructure, StructureDefinition } from './types/cityBuilder';
import { InventoryDrawer } from './components/ui/inventory/InventoryDrawer';
import { inventoryManager } from './engine/inventory/InventoryManager';
import { ActiveBuff } from './types/inventory';
export const App: React.FC = () => {
  const controlsRef = useRef<TouchControls3D | null>(null);
  const castSpellRef = useRef<((effectType: AbilityEffectType, charId: string) => void) | null>(null);
  const jumpRef = useRef<(() => void) | null>(null);
  const [characters, setCharacters] = useState<Character[]>(allCharacters);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [, setScreenPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [coinScore, setCoinScore] = useState<number>(() => {
    const saved = localStorage.getItem('haven_coin_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [inspectorHit, setInspectorHit] = useState<InteractiveHit | null>(null);

  // Inventory & Customization State
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventoryCount, setInventoryCount] = useState(() => {
    return inventoryManager.getItems().reduce((sum, it) => sum + it.quantity, 0);
  });
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>(() => inventoryManager.getActiveBuffs());

  React.useEffect(() => {
    const unsub = inventoryManager.subscribe(() => {
      const count = inventoryManager.getItems().reduce((sum, it) => sum + it.quantity, 0);
      setInventoryCount(count);
      setActiveBuffs(inventoryManager.getActiveBuffs());
    });
    return unsub;
  }, []);
  // City Builder Mode state
  const builderControllerRef = useRef<CityBuilderController | null>(null);
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [activeTool, setActiveTool] = useState<BuilderTool>('place');
  const [activeStructureId, setActiveStructureId] = useState<string>('cottage_small');
  const [builderStructures, setBuilderStructures] = useState<PlacedStructure[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  // TopBar state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [isMuted, setIsMuted] = useState(true);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId) || null;

  const handleInitControls = useCallback((controls: TouchControls3D) => {
    controlsRef.current = controls;
  }, []);

  const handleInitSpellCaster = useCallback((castFn: (effectType: AbilityEffectType, charId: string) => void) => {
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

    // Camera is NOT relocated when clicking the character in 3D (user keeps their view)
  }, []);

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

  const handleCollectItem = useCallback((item: CollectibleItem) => {
    setCoinScore((prev) => {
      const next = prev + item.value;
      try {
        localStorage.setItem('haven_coin_score', next.toString());
      } catch {}
      return next;
    });

    // Auto-store looted item into player backpack
    const looted = inventoryManager.addLootFromWorld(item.type);
    const itemName = looted ? looted.name : item.name;
    setCelebrationToast(`✨ Nhặt được +${item.value} [${itemName}] vào túi đồ!`);
    setTimeout(() => setCelebrationToast(null), 2500);
  }, []);

  const handlePlatformToast = useCallback((msg: string) => {
    setCelebrationToast(msg);
    setTimeout(() => setCelebrationToast(null), 2500);
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

  const handleTriggerAbility = useCallback((customEffectType?: AbilityEffectType) => {
    if (!selectedCharacter) return;
    setIsModalOpen(false);
    setIsCasting(true);

    const isUlt = customEffectType && customEffectType === selectedCharacter.ultimateAbility?.effectType;
    const ability = isUlt
      ? selectedCharacter.ultimateAbility
      : (selectedCharacter.activeAbility || selectedCharacter.signatureAbility);

    const effectType = customEffectType || ability?.effectType || selectedCharacter.signatureAbility?.effectType || 'active_seed_of_life';
    const abilityName = ability?.name || selectedCharacter.signatureAbility?.name || 'Kỹ Năng';

    audioManager.playAbility(effectType);
    // 3D visual particle explosion at character position!
    castSpellRef.current?.(effectType, selectedCharacter.id);
    // Trigger spring hop
    setCharacters((prev) =>
      prev.map((c) => (c.id === selectedCharacter.id ? { ...c, hopProgress: 0.01 } : c))
    );

    // Show spell toast notification!
    const badge = isUlt ? '🌟 TUYỆT KỸ TỐI THƯỢNG' : '⚡ KỸ NĂNG CHỦ ĐỘNG';
    setCelebrationToast(`${badge}: ${selectedCharacter.nickname} thi triển [${abilityName}]!`);
    setTimeout(() => {
      setCelebrationToast(null);
      setIsCasting(false);
    }, 3200);
  }, [selectedCharacter]);






  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink-900 select-none">
      {/* Top Status Bar */}
      <TopBar
        timeOfDay={timeOfDay}
        weather={weather}
        isMuted={isMuted}
        isInspectorActive={isInspectorActive}
        coinScore={coinScore}
        inventoryCount={inventoryCount}
        activeBuffs={activeBuffs}
        onOpenInventory={() => {
          audioManager.playTap();
          setIsInventoryOpen(true);
        }}
        onToggleTimeOfDay={handleToggleTimeOfDay}
        onToggleWeather={handleToggleWeather}
        onToggleMute={handleToggleMute}
        onToggleInspector={() => {
          setIsInspectorActive((prev) => !prev);
          setInspectorHit(null);
        }}
        isBuildMode={isBuildMode}
        onToggleBuildMode={() => {
          setIsBuildMode((prev) => {
            const next = !prev;
            if (next) {
              setSelectedCharId(null);
              setIsInspectorActive(false);
            }
            return next;
          });
        }}
      />
      {/* Main 3D Three.js Isometric Canvas with all 9 friends */}
      <ThreeIsometricCanvas
        characters={characters}
        selectedCharId={selectedCharId}
        timeOfDay={timeOfDay}
        weather={weather}
        isInspectorActive={isInspectorActive}
        isBuildMode={isBuildMode}
        activeTool={activeTool}
        activeStructureId={activeStructureId}
        onSelectCharacter={handleSelectCharacter}
        onInteractProp={handleInteractProp}
        onCameraUpdate={handleCameraUpdate}
        onInitControls={handleInitControls}
        onInitSpellCaster={handleInitSpellCaster}
        onInitJumper={(fn) => { jumpRef.current = fn; }}
        onInspectHit={setInspectorHit}
        onCollectItem={handleCollectItem}
        onPlatformToast={handlePlatformToast}
        onInitBuilder={(builder: CityBuilderController) => {
          builderControllerRef.current = builder;
        }}
        onBuilderStructuresChange={setBuilderStructures}
      />

      {/* 3D Inspector Call-Out HUD Bar */}
      {isInspectorActive && (
        <InspectorBar
          activeHit={inspectorHit}
          onClose={() => {
            setInspectorHit(null);
            setIsInspectorActive(false);
          }}
          onToast={(msg: string) => {
            setCelebrationToast(msg);
            setTimeout(() => setCelebrationToast(null), 3000);
          }}
        />
      )}

      {/* Celebratory Banner Toast */}
      {celebrationToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-2.5 rounded-2xl bg-ink-900/90 border border-fantasy-gold shadow-[0_0_25px_rgba(223,166,66,0.5)] text-fantasy-gold font-serif text-sm tracking-wide text-center animate-bounce backdrop-blur-md">
          {celebrationToast}
        </div>
      )}


      {/* Bottom-Left Docked Speech Bubble (Closed when modal open or cast active) */}
      {selectedCharacter && !isModalOpen && !isCasting && (
        <SpeechBubble
          character={selectedCharacter}
          onClose={() => setSelectedCharId(null)}
          onTriggerAbility={handleTriggerAbility}
        />
      )}

      {/* Left Docked Character List under Haven of Companions Card (hidden in build mode) */}
      {!isBuildMode && (
        <CharacterCarousel
          characters={characters}
          selectedCharId={selectedCharId}
          onSelectCharacter={handleSelectCharacter}
          onOpenDetails={(char) => {
            setSelectedCharId(char.id);
            setIsModalOpen(true);
            panToCharacter(char);
          }}
        />
      )}

      {/* City Builder Bottom Catalog Drawer & Action Bar */}
      <BuilderToolbar
        isOpen={isBuildMode}
        activeTool={activeTool}
        activeStructureId={activeStructureId}
        structures={builderStructures}
        onSelectTool={setActiveTool}
        onSelectStructure={(def: StructureDefinition) => {
          setActiveStructureId(def.id);
          builderControllerRef.current?.setActiveStructure(def.id);
        }}
        onRotate={() => {
          builderControllerRef.current?.rotateCurrentStructure();
        }}
        onCenterPlaza={() => {
          controlsRef.current?.centerOnPlaza();
        }}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onClose={() => setIsBuildMode(false)}
      />

      {/* Save / Load / Export Village Layout Modal */}
      <SaveLoadModal
        isOpen={isSaveModalOpen}
        structures={builderStructures}
        onClose={() => setIsSaveModalOpen(false)}
        onImport={(imported) => {
          builderControllerRef.current?.reconstituteStructures(imported);
        }}
        onClearAll={() => {
          builderControllerRef.current?.clearAllStructures();
        }}
        onNotice={(msg) => {
          setCelebrationToast(msg);
          setTimeout(() => setCelebrationToast(null), 3000);
        }}
      />

      {/* Subtle Keyboard Controls Hint (Desktop / Tablet, hidden in build mode) */}
      {!isBuildMode && (
        <div className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none items-center gap-2 bg-ink-950/85 backdrop-blur-md border border-paper-800/60 rounded-full px-3.5 py-1.5 shadow-lg text-[11px] text-paper-200/80">
          <span className="font-semibold text-fantasy-gold">WASD / Mũi tên</span>
          <span>Di chuyển</span>
          <span className="text-paper-800">•</span>
          <span className="font-semibold text-amber-300">Space</span>
          <span>Nhảy lên cao</span>
          <span className="text-paper-800">•</span>
          <span className="text-paper-200/60">Chạm đất để dẫn đường</span>
        </div>
      )}

      {/* Mobile Floating Jump Button (hidden in build mode) */}
      {!isBuildMode && (
        <button
          onClick={() => jumpRef.current?.()}
          className="sm:hidden fixed bottom-24 right-4 z-30 pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-fantasy-gold via-amber-400 to-amber-600 text-ink-950 shadow-[0_4px_16px_rgba(223,166,66,0.4)] border border-amber-200 active:scale-90 transition-transform font-bold"
          title="Nhảy (Jump)"
        >
          <ArrowUp className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}
      {/* Expandable Character Sheet Modal with Wardrobe Customizer */}
      {isModalOpen && (
        <CharacterModal
          character={selectedCharacter}
          onClose={() => setIsModalOpen(false)}
          onTriggerAbility={handleTriggerAbility}
          onSelectCharacter={handleSelectCharacter}
        />
      )}

      {/* Inventory & Equipment Backpack Drawer */}
      <InventoryDrawer
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        characters={characters}
        selectedCharId={selectedCharId}
        onSelectCharacter={handleSelectCharacter}
        onToast={(msg) => {
          setCelebrationToast(msg);
          setTimeout(() => setCelebrationToast(null), 3000);
        }}
      />
    </div>
  );
};

export default App;
