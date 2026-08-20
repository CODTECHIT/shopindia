import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Bike, ShieldCheck, ChevronRight } from 'lucide-react';

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: {
    type: 'car' | 'bike';
    brand: string;
    model: string;
    fuel?: string;
  } | null;
  onSelectVehicle: (vehicle: {
    type: 'car' | 'bike';
    brand: string;
    model: string;
    fuel?: string;
  }) => void;
}

const CAR_BRANDS = [
  { name: 'Maruti Suzuki', models: ['Swift', 'Baleno', 'Brezza', 'Dzire', 'Ertiga', 'Grand Vitara'] },
  { name: 'Hyundai', models: ['Creta', 'Venue', 'i20', 'Verna', 'Exter', 'Alcazar'] },
  { name: 'Tata', models: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago EV'] },
  { name: 'Mahindra', models: ['Thar', 'Scorpio-N', 'XUV700', 'Bolero', 'XUV300'] },
  { name: 'Honda', models: ['City', 'Amaze', 'Elevate'] },
  { name: 'Toyota', models: ['Innova Hycross', 'Fortuner', ' Cruiser Hyryder', 'Glanza'] },
];

const BIKE_BRANDS = [
  { name: 'Royal Enfield', models: ['Classic 350', 'Hunter 350', 'Meteor 350', 'Himalayan', 'Bullet 350'] },
  { name: 'Honda 2-Wheelers', models: ['Activa 6G', 'Shine 125', 'SP 125', 'Unicorn', 'Dio'] },
  { name: 'Hero MotoCorp', models: ['Splendor Plus', 'HF Deluxe', 'Passion Pro', 'Xpulse 200'] },
  { name: 'Bajaj Auto', models: ['Pulsar 150', 'Pulsar NS200', 'Platina', 'Dominar 400', 'Chetak EV'] },
  { name: 'TVS', models: ['Apache RTR 160', 'Jupiter', 'Ntorq 125', 'Raider 125', 'iQube'] },
  { name: 'Yamaha', models: ['R15 V4', 'MT-15', 'FZ-S FI', 'Aerox 155', 'RayZR'] },
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];

export const VehicleSelectorModal: React.FC<VehicleSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
  onSelectVehicle,
}) => {
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>(selectedVehicle?.type || 'car');
  const [selectedBrand, setSelectedBrand] = useState<string>(selectedVehicle?.brand || '');
  const [selectedModel, setSelectedModel] = useState<string>(selectedVehicle?.model || '');
  const [selectedFuel, setSelectedFuel] = useState<string>(selectedVehicle?.fuel || 'Petrol');

  if (!isOpen) return null;

  const currentBrands = vehicleType === 'car' ? CAR_BRANDS : BIKE_BRANDS;
  const currentBrandObj = currentBrands.find((b) => b.name === selectedBrand);
  const availableModels = currentBrandObj ? currentBrandObj.models : [];

  const handleApply = () => {
    if (!selectedBrand || !selectedModel) return;
    onSelectVehicle({
      type: vehicleType,
      brand: selectedBrand,
      model: selectedModel,
      fuel: selectedFuel,
    });
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
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/15 rounded-2xl backdrop-blur-md">
                {vehicleType === 'car' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">Select Your Vehicle</h3>
                <p className="text-xs text-blue-200">Personalize exact service packages & rate cards</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* 1. Vehicle Type Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setVehicleType('car');
                  setSelectedBrand('');
                  setSelectedModel('');
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${vehicleType === 'car'
                    ? 'bg-white text-blue-700 shadow-md ring-1 ring-black/5'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Car className="w-4 h-4" />
                4-Wheeler (Car)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleType('bike');
                  setSelectedBrand('');
                  setSelectedModel('');
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${vehicleType === 'bike'
                    ? 'bg-white text-blue-700 shadow-md ring-1 ring-black/5'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Bike className="w-4 h-4" />
                2-Wheeler (Bike / Scooter)
              </button>
            </div>

            {/* 2. Select Brand */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                1. Select Make / Brand
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentBrands.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(b.name);
                      setSelectedModel(b.models[0] || '');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${selectedBrand === b.name
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                      }`}
                  >
                    <p className="text-xs">{b.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Select Model */}
            {selectedBrand && (
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  2. Select {selectedBrand} Model
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedModel(m)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${selectedModel === m
                          ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                          : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                        }`}
                    >
                      <p className="text-xs">{m}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Fuel Type */}
            {vehicleType === 'car' && (
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  3. Fuel Type
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {FUEL_TYPES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFuel(f)}
                      className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-all ${selectedFuel === f
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3 text-xs text-blue-800">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                OEM Genuine Spares & Parts with 1000 km / 1 Month Warranty on all repairs.
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {selectedBrand && selectedModel ? (
                <span className="font-bold text-slate-800">
                  {selectedBrand} {selectedModel} ({selectedFuel})
                </span>
              ) : (
                'Select Brand & Model to continue'
              )}
            </div>
            <button
              type="button"
              disabled={!selectedBrand || !selectedModel}
              onClick={handleApply}
              className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${selectedBrand && selectedModel
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              Confirm Vehicle <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
