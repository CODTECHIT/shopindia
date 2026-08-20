import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Flame, Check } from 'lucide-react';
import type { Product } from '../../data/types';

interface FoodCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, selectedModifiers: string[], finalPrice: number, instructions: string) => void;
}

const DEFAULT_ADDONS = [
  { id: 'extra_cheese', name: 'Extra Cheese / Butter', price: 40 },
  { id: 'extra_dip', name: 'Signature Mint & Garlic Dip', price: 25 },
  { id: 'spicy_masala', name: 'Extra Peri-Peri / Gunpowder Seasoning', price: 15 },
  { id: 'coke_can', name: 'Chilled Coke Can (300ml)', price: 45 },
];

export const FoodCustomizationModal: React.FC<FoodCustomizationModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<'regular' | 'medium' | 'large'>('regular');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'extra_spicy'>('medium');
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const sizeMultipliers = {
    regular: 0,
    medium: Math.round(product.price * 0.35),
    large: Math.round(product.price * 0.7),
  };

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const found = DEFAULT_ADDONS.find((a) => a.id === addonId);
    return sum + (found ? found.price : 0);
  }, 0);

  const basePriceWithSize = product.price + sizeMultipliers[selectedSize];
  const unitPrice = basePriceWithSize + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onAddToCart(product, selectedAddons, unitPrice, instructions);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
        >
          {/* Header Image / Info */}
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    product.isVeg !== false ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {product.isVeg !== false ? 'Pure Veg' : 'Non-Veg'}
                </span>
                {product.cuisine && (
                  <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                    {product.cuisine}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black">{product.title}</h3>
              <p className="text-sm font-semibold text-amber-300">₹{product.price} base price</p>
            </div>
          </div>

          {/* Body Options */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* 1. Size / Portion */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Select Portion / Size</h4>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Required</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'regular', label: 'Regular', extra: 0 },
                  { id: 'medium', label: 'Medium', extra: sizeMultipliers.medium },
                  { id: 'large', label: 'Large', extra: sizeMultipliers.large },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSize(s.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedSize === s.id
                        ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <p className="font-bold text-slate-800">{s.label}</p>
                    <p className="text-xs text-slate-500">
                      {s.extra === 0 ? 'Included' : `+₹${s.extra}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Spice Level */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Spice Level Preference</h4>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'mild', label: 'Mild 🌱' },
                  { id: 'medium', label: 'Medium 🌶️' },
                  { id: 'extra_spicy', label: 'Extra Spicy 🔥' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSpiceLevel(lvl.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      spiceLevel === lvl.id
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Add-ons / Toppings */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recommended Add-ons</h4>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <div className="space-y-2">
                {DEFAULT_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/40 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">+₹{addon.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Cooking Instructions */}
            <div>
              <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">
                Cooking / Delivery Note for Chef
              </label>
              <input
                type="text"
                placeholder="e.g. Less oil, make crispy, no cutlery needed..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center border border-slate-200 bg-white rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-black text-sm text-slate-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3.5 px-5 rounded-2xl font-black text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>Add to Order</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-bold">₹{totalPrice}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
