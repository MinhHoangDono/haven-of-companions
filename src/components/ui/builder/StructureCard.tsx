import React from 'react';
import {
  Home,
  Building,
  Beer,
  Church,
  Wind,
  ShoppingBag,
  Truck,
  ShieldAlert,
  Crosshair,
  Fence,
  Sword,
  Target,
  Tent,
  Coins,
  Wine,
  Package,
  Layers,
  Trees,
  TreePine,
  Palmtree,
  Mountain,
  Hammer,
  Castle,
  Flag,
  Anchor,
  Ship,
  Shovel,
  Boxes,
  Warehouse,
} from 'lucide-react';
import { StructureDefinition } from '../../../types/cityBuilder';

interface StructureCardProps {
  structure: StructureDefinition;
  isSelected: boolean;
  onSelect: (def: StructureDefinition) => void;
}

export const StructureCard: React.FC<StructureCardProps> = ({
  structure,
  isSelected,
  onSelect,
}) => {
  const renderIcon = (name: string) => {
    const props = { className: 'w-5 h-5' };
    switch (name) {
      case 'Home':
        return <Home {...props} className="w-5 h-5 text-amber-300" />;
      case 'Building':
        return <Building {...props} className="w-5 h-5 text-amber-400" />;
      case 'Beer':
        return <Beer {...props} className="w-5 h-5 text-orange-400" />;
      case 'Anvil':
        return <Hammer {...props} className="w-5 h-5 text-stone-300" />;
      case 'Church':
        return <Church {...props} className="w-5 h-5 text-yellow-300" />;
      case 'Wind':
        return <Wind {...props} className="w-5 h-5 text-sky-300" />;
      case 'ShoppingBag':
        return <ShoppingBag {...props} className="w-5 h-5 text-emerald-300" />;
      case 'Truck':
        return <Truck {...props} className="w-5 h-5 text-amber-200" />;
      case 'ShieldAlert':
        return <ShieldAlert {...props} className="w-5 h-5 text-red-400" />;
      case 'Crosshair':
        return <Crosshair {...props} className="w-5 h-5 text-rose-400" />;
      case 'Fence':
        return <Fence {...props} className="w-5 h-5 text-stone-400" />;
      case 'Sword':
        return <Sword {...props} className="w-5 h-5 text-blue-300" />;
      case 'Target':
        return <Target {...props} className="w-5 h-5 text-red-400" />;
      case 'Tent':
        return <Tent {...props} className="w-5 h-5 text-amber-400" />;
      case 'Coins':
        return <Coins {...props} className="w-5 h-5 text-yellow-400" />;
      case 'Wine':
        return <Wine {...props} className="w-5 h-5 text-purple-400" />;
      case 'Package':
        return <Package {...props} className="w-5 h-5 text-amber-300" />;
      case 'Layers':
        return <Layers {...props} className="w-5 h-5 text-amber-500" />;
      case 'Trees':
        return <Trees {...props} className="w-5 h-5 text-emerald-400" />;
      case 'TreePine':
        return <TreePine {...props} className="w-5 h-5 text-emerald-500" />;
      case 'Palmtree':
        return <Palmtree {...props} className="w-5 h-5 text-teal-400" />;
      case 'Mountain':
        return <Mountain {...props} className="w-5 h-5 text-stone-300" />;
      case 'Castle':
        return <Castle {...props} className="w-5 h-5 text-indigo-300" />;
      case 'Flag':
        return <Flag {...props} className="w-5 h-5 text-rose-400" />;
      case 'Anchor':
        return <Anchor {...props} className="w-5 h-5 text-cyan-300" />;
      case 'Ship':
        return <Ship {...props} className="w-5 h-5 text-amber-300" />;
      case 'Shovel':
        return <Shovel {...props} className="w-5 h-5 text-lime-400" />;
      case 'Boxes':
        return <Boxes {...props} className="w-5 h-5 text-amber-500" />;
      case 'Warehouse':
        return <Warehouse {...props} className="w-5 h-5 text-orange-300" />;
      default:
        return <Hammer {...props} className="w-5 h-5 text-fantasy-gold" />;
    }
  };

  return (
    <button
      onClick={() => onSelect(structure)}
      className={`group relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-left shrink-0 w-28 h-28 select-none ${
        isSelected
          ? 'bg-ink-800/95 border-fantasy-gold shadow-[0_0_16px_rgba(223,166,66,0.45)] scale-105'
          : 'bg-ink-900/80 border-paper-800/60 hover:bg-ink-850 hover:border-paper-700/80'
      }`}
      title={structure.description}
    >
      {/* Footprint Badge */}
      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-ink-950/80 text-paper-200 border border-paper-800/50">
        {structure.footprintWidth}x{structure.footprintDepth}
      </span>

      {/* Thematic Sprite / Icon Container */}
      <div className="w-10 h-10 rounded-lg bg-ink-950/80 flex items-center justify-center mt-1 group-hover:scale-110 transition-transform shadow-inner">
        {renderIcon(structure.iconName)}
      </div>

      {/* Structure Title */}
      <div className="w-full text-center">
        <p className="text-[11px] font-medium text-paper-100 truncate tracking-tight">
          {structure.name}
        </p>
      </div>
    </button>
  );
};
