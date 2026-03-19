import type { EquipmentItem } from '../types';

let _idCounter = 0;
function makeId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + (++_idCounter);
}

interface RawEquipment {
  name: string;
  department: EquipmentItem['department'];
  watts: number;
  weightLbs: number;
  connector: string;
  voltage: number;
  isThreePhase?: boolean;
  notes?: string;
  /** Power factor 0.0–1.0. Defaults to 0.95 if omitted. */
  powerFactor?: number;
}

const raw: RawEquipment[] = [
  // ===== LIGHTING =====
  // LED moving heads use switching PSUs — PF ~0.95
  { name: 'Matrix CMY 450', department: 'Lighting', watts: 600, weightLbs: 44, connector: 'powerCON TRUE1', voltage: 208, powerFactor: 0.95, notes: 'Artfox moving head; 450W LED engine, ~600W total draw' },
  { name: 'Matrix CMY 350', department: 'Lighting', watts: 400, weightLbs: 35, connector: 'powerCON TRUE1', voltage: 208, powerFactor: 0.95, notes: 'Artfox moving head; 350W LED engine' },
  { name: 'Solar Wash X', department: 'Lighting', watts: 800, weightLbs: 35, connector: 'powerCON TRUE1', voltage: 208, powerFactor: 0.95, notes: 'Artfox 19×40W RGBW wash; 800W max draw' },
  { name: 'Wash 19 E', department: 'Lighting', watts: 320, weightLbs: 21, connector: 'powerCON TRUE1', voltage: 208, powerFactor: 0.95, notes: 'Artfox Beam Wash 19E; 19×15W RGBW Osram LEDs' },
  { name: 'Wash 19 EX', department: 'Lighting', watts: 320, weightLbs: 19, connector: 'powerCON TRUE1', voltage: 208, powerFactor: 0.95, notes: 'Artfox Beam Wash 19EX; 19×20W RGBW Osram LEDs' },
  { name: 'Hybrid 350', department: 'Lighting', watts: 450, weightLbs: 35, connector: 'powerCON TRUE1', voltage: 208, powerFactor: 0.95, notes: 'Artfox Hybrid LED 350W BSW 3-in-1; 15.7 kg' },
  { name: 'Skybeams', department: 'Lighting', watts: 350, weightLbs: 40, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.95, notes: 'Artfox Sky Beam; narrow beam effect' },
  { name: 'Pin Spots (New)', department: 'Lighting', watts: 10, weightLbs: 2, connector: 'Battery', voltage: 0, powerFactor: 0.95, notes: 'Battery LED pin spot; 10W; rechargeable' },
  { name: 'Pin Spots (Old)', department: 'Lighting', watts: 3, weightLbs: 1, connector: 'Battery', voltage: 0, powerFactor: 0.95, notes: 'Older battery LED pin spot; 3W' },
  { name: 'LED Uplights', department: 'Lighting', watts: 24, weightLbs: 3, connector: 'Edison', voltage: 120, powerFactor: 0.92, notes: 'Battery wireless RGBAW+UV uplight; 24W when charging/wired' },
  { name: 'Tube Lights', department: 'Lighting', watts: 28, weightLbs: 2.2, connector: 'Edison', voltage: 120, powerFactor: 0.92, notes: 'LED pixel tube (Astera-class); 28W; battery capable' },
  { name: 'Blinders', department: 'Lighting', watts: 200, weightLbs: 9, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.95, notes: '2×100W COB LED blinder' },
  { name: 'Laser Lights', department: 'Lighting', watts: 100, weightLbs: 7, connector: 'Edison', voltage: 120, powerFactor: 0.90, notes: 'DJ/event laser projector; ~100W draw' },
  { name: 'Leko Lights', department: 'Lighting', watts: 750, weightLbs: 14, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: 'ETC Source Four 750W ellipsoidal; tungsten halogen — resistive load, PF=1.0' },

  // ===== SPECIAL EFFECTS =====
  // Resistive heating elements PF=1.0; fan/motor loads PF~0.80
  { name: 'Nimbus Dry Ice Machine', department: 'SFX', watts: 3000, weightLbs: 29, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: 'Chauvet Nimbus; 3000W resistive heater; PF=1.0; needs 2×20A or 1×30A circuit; 75 lbs full' },
  { name: 'CO2 Guns', department: 'SFX', watts: 0, weightLbs: 5, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Handheld CO2 cryo gun; no power needed' },
  { name: 'CO2 Tanks', department: 'SFX', watts: 0, weightLbs: 50, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: '20lb CO2 siphon tank; ~50 lbs full' },
  { name: 'Fire Extinguisher Class D', department: 'SFX', watts: 0, weightLbs: 14, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Safety equipment; no power' },
  { name: 'Cold Sparklers', department: 'SFX', watts: 600, weightLbs: 10, connector: 'Edison', voltage: 120, powerFactor: 0.90, notes: 'Cold spark machine (Showven class); 500-750W; switching PSU' },
  { name: 'Haze Machine', department: 'SFX', watts: 400, weightLbs: 27, connector: 'Edison', voltage: 120, powerFactor: 0.80, notes: 'Oil-based haze machine (Antari class); 315-400W; motor + heater; PF~0.80' },
  { name: 'Haze Fluid', department: 'SFX', watts: 0, weightLbs: 6, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Consumable; no power' },
  { name: 'Confetti Cannon Blaster', department: 'SFX', watts: 1500, weightLbs: 15, connector: 'Edison', voltage: 120, powerFactor: 0.80, notes: 'Electric confetti blaster; 1500W fan-powered; inductive motor load PF~0.80' },
  { name: 'CO2 Blasters', department: 'SFX', watts: 0, weightLbs: 7, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'CO2 cryo jet; no electricity; requires CO2 tank' },
  { name: 'Dry Ice Cooler', department: 'SFX', watts: 0, weightLbs: 10, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Insulated dry ice storage; no power' },

  // ===== VIDEO WALL =====
  // SMPS (switching power supplies) — PF ~0.90
  { name: 'Video Wall Processor (Artfox)', department: 'Video', watts: 30, weightLbs: 6, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: 'Artfox video processor; SMPS' },
  { name: 'Video Wall Processor (NovaStar VX4S)', department: 'Video', watts: 25, weightLbs: 6, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: 'NovaStar VX4S-N; 2.6M pixel capacity; SMPS' },
  { name: 'Video Wall Processor (VX1000)', department: 'Video', watts: 35, weightLbs: 9, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: 'NovaStar VX1000; 10× Ethernet; 6.5M pixel capacity; SMPS' },
  { name: 'Clamps for Video Wall', department: 'Video', watts: 0, weightLbs: 1, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Panel clamps/quick locks' },
  // Panel wattage reflects full-white max draw (not spec sheet average).
  // At PF=0.90: 8 panels × (215W / 0.90) = 1911VA / 120V ≈ 15.9A → fits within 16A NEC limit of a 20A circuit.
  // Real-world rule: max 8 panels per 20A/120V outlet.
  { name: 'Video Wall Panel P3.9', department: 'Video', watts: 215, weightLbs: 17, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.90, notes: 'P3.91 500×500mm; 215W max (full-white draw); ~50W avg; max 8 per 20A/120V outlet' },
  { name: 'Video Wall Panel P3.9 (Old)', department: 'Video', watts: 215, weightLbs: 18, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.90, notes: 'P3.91 500×500mm older batch; 215W max (full-white); max 8 per 20A/120V outlet' },
  { name: 'Video Wall Panel P2.6', department: 'Video', watts: 200, weightLbs: 16, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.90, notes: 'P2.6 500×500mm; 200W max (full-white draw); ~40W avg; max 8 per 20A/120V outlet' },
  { name: 'Video Wall Panel P2.9', department: 'Video', watts: 200, weightLbs: 17, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.90, notes: 'P2.9 500×500mm; 200W max (full-white draw); ~60W avg; max 8 per 20A/120V outlet' },
  { name: 'Video Wall Panel P2.9 (LOT B12)', department: 'Video', watts: 200, weightLbs: 17, connector: 'powerCON TRUE1', voltage: 120, powerFactor: 0.90, notes: 'P2.9 500×500mm Lot B12; same specs; max 8 per 20A/120V outlet' },
  { name: 'Video Wall Crank Stand', department: 'Video', watts: 0, weightLbs: 80, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Crank-up truss stand; 220-440 lb capacity' },
  { name: 'Video Wall/Line Array Hanging Stand', department: 'Video', watts: 0, weightLbs: 80, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Heavy-duty hanging/crank stand' },
  { name: 'Video Wall Crank Stand Heavy Duty', department: 'Video', watts: 0, weightLbs: 229, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'HD crank stand 18ft; 440-500 lb capacity' },

  // ===== TRUSSING & BASE PLATES =====
  { name: '10ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 55, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 10ft' },
  { name: '8ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 44, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 8ft' },
  { name: '6ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 33, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 6ft' },
  { name: '5ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 28, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 5ft' },
  { name: '4ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 22, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 4ft' },
  { name: '3ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 17, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 3ft' },
  { name: '2ft Box Truss', department: 'Rigging', watts: 0, weightLbs: 11, connector: 'N/A', voltage: 0, notes: '12" aluminum box truss 2ft' },
  { name: 'Square Connector Pro X', department: 'Rigging', watts: 0, weightLbs: 5, connector: 'N/A', voltage: 0, notes: 'Truss corner block; aluminum' },
  { name: 'Square Connector (China)', department: 'Rigging', watts: 0, weightLbs: 4, connector: 'N/A', voltage: 0, notes: 'Generic truss corner block' },
  { name: 'L Connector', department: 'Rigging', watts: 0, weightLbs: 3, connector: 'N/A', voltage: 0, notes: 'Truss L-block connector' },
  { name: 'Base Plate (Small)', department: 'Rigging', watts: 0, weightLbs: 12, connector: 'N/A', voltage: 0, notes: '~16×16" truss base plate' },
  { name: 'Base Plate (Medium)', department: 'Rigging', watts: 0, weightLbs: 25, connector: 'N/A', voltage: 0, notes: '~24×24" truss base plate' },
  { name: 'Base Plate (Large)', department: 'Rigging', watts: 0, weightLbs: 40, connector: 'N/A', voltage: 0, notes: '~30×30" truss base plate' },
  { name: 'T-Bar', department: 'Rigging', watts: 0, weightLbs: 8, connector: 'N/A', voltage: 0, notes: 'T-bar adapter for mounting lights' },
  { name: 'One Side Bar', department: 'Rigging', watts: 0, weightLbs: 5, connector: 'N/A', voltage: 0, notes: 'Single-side lighting bar' },
  { name: '6ft Long Bar', department: 'Rigging', watts: 0, weightLbs: 15, connector: 'N/A', voltage: 0, notes: '6ft lighting crossbar/span' },
  { name: 'Double Side Clamps', department: 'Rigging', watts: 0, weightLbs: 2, connector: 'N/A', voltage: 0, notes: 'Dual truss clamps; per pair' },

  // ===== AUDIO — MIXERS & DJ GEAR =====
  // Digital mixers and DJ controllers use SMPS — PF ~0.90
  { name: 'Allen & Heath QU-16', department: 'Audio', watts: 82, weightLbs: 22, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: '16-ch digital mixer; 82W; 17 motorized faders; SMPS' },
  { name: 'Allen & Heath QU-12', department: 'Audio', watts: 82, weightLbs: 22, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: '12-ch digital mixer (may be QU-16); 82W; SMPS' },
  { name: 'Allen & Heath Analog Mixer', department: 'Audio', watts: 30, weightLbs: 15, connector: 'IEC C13', voltage: 120, powerFactor: 0.85, notes: 'ZED series analog mixer; ~30W' },
  { name: 'Yamaha Analog Mixer', department: 'Audio', watts: 20, weightLbs: 7, connector: 'IEC C13', voltage: 120, powerFactor: 0.85, notes: 'Yamaha MG series small format; ~20W' },
  { name: 'Mackie PA Mixer', department: 'Audio', watts: 30, weightLbs: 8, connector: 'IEC C13', voltage: 120, powerFactor: 0.85, notes: 'Mackie ProFXv3 analog mixer; ~30W' },
  { name: 'RCF Digital PA', department: 'Audio', watts: 40, weightLbs: 6, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: 'RCF M 18 digital mixer; 40W; Wi-Fi controlled; SMPS' },
  { name: 'Pioneer DDJ-SZ2', department: 'Audio', watts: 37, weightLbs: 24, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: '4-ch Serato DJ controller; 37W; SMPS' },
  { name: 'Pioneer DDJ-SZ', department: 'Audio', watts: 37, weightLbs: 25, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: '4-ch Serato DJ controller (original); 37W; SMPS' },
  { name: 'Rane Four', department: 'Audio', watts: 20, weightLbs: 18, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: '4-ch Serato DJ controller; 20W; 8.27 kg; SMPS' },
  { name: 'Pioneer DDJ-SX3', department: 'Audio', watts: 25, weightLbs: 13, connector: 'Other', voltage: 120, powerFactor: 0.90, notes: '4-ch Serato controller; 25W; DC adapter; SMPS' },
  { name: 'Pioneer DDJ-SRT', department: 'Audio', watts: 25, weightLbs: 13, connector: 'Other', voltage: 120, powerFactor: 0.90, notes: '4-ch Serato controller (DDJ-1000SRT); 25W; SMPS' },
  { name: 'Pioneer CDJ-3000', department: 'Audio', watts: 40, weightLbs: 12, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: 'Professional media player; 40W; 5.5 kg; SMPS' },
  { name: 'Pioneer DJM-A9', department: 'Audio', watts: 46, weightLbs: 17, connector: 'IEC C13', voltage: 120, powerFactor: 0.90, notes: '4-ch DJ mixer; 46W; 7.6 kg; SMPS' },

  // ===== AUDIO — SPEAKERS =====
  // Class D amplifiers (switching) — PF ~0.90–0.95
  { name: 'RCF HD 32-A', department: 'Audio', watts: 500, weightLbs: 41, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: '12" powered; 700W RMS amp; ~500W sustained wall draw; Class D' },
  { name: 'RCF HD 35-A', department: 'Audio', watts: 500, weightLbs: 49, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: '15" powered; 700W RMS amp; ~500W sustained wall draw; Class D' },
  { name: 'RCF ART 735-A', department: 'Audio', watts: 500, weightLbs: 48, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: '15" powered; 700W RMS amp; ~500W sustained wall draw; Class D' },
  { name: 'RCF HD 12-A', department: 'Audio', watts: 500, weightLbs: 38, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: '12" powered; 700W RMS amp; ~500W sustained wall draw; Class D' },
  { name: 'RCF ART 315-A', department: 'Audio', watts: 300, weightLbs: 38, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: '15" powered; 400W RMS amp; ~300W sustained wall draw; Class D' },
  { name: 'RCF HDL 20-A', department: 'Audio', watts: 500, weightLbs: 64, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: 'Dual 10" line array; 700W RMS amp; ~500W sustained wall draw; Class D' },
  { name: 'RCF EVOX', department: 'Audio', watts: 500, weightLbs: 77, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.90, notes: 'EVOX 12 column array; 700W RMS amp; ~500W sustained wall draw; Class D' },
  { name: 'Yorkville 21" Subs', department: 'Audio', watts: 800, weightLbs: 203, connector: 'Edison', voltage: 120, powerFactor: 0.90, notes: 'LS2100P; 800W typical / 1440W max VA draw; 92 kg; Class D' },
  { name: 'Yorkville 18" Subs', department: 'Audio', watts: 500, weightLbs: 125, connector: 'Edison', voltage: 120, powerFactor: 0.90, notes: '18" powered sub; ~500W sustained wall draw; Class D' },
  { name: 'QSC K12', department: 'Audio', watts: 350, weightLbs: 41, connector: 'powerCON 20A', voltage: 120, powerFactor: 0.95, notes: '12" powered; 1000W peak amp; ~350W measured max wall draw; Class D' },

  // ===== AUDIO — STANDS & ACCESSORIES =====
  { name: 'Line Array Flybar', department: 'Audio', watts: 0, weightLbs: 25, connector: 'N/A', voltage: 0, notes: 'Rigging frame for line array modules' },
  { name: 'Line Array Flybar Hanging', department: 'Audio', watts: 0, weightLbs: 30, connector: 'N/A', voltage: 0, notes: 'Hanging flybar for suspended line array' },
  { name: 'Line Array Stands', department: 'Audio', watts: 0, weightLbs: 65, connector: 'N/A', voltage: 0, notes: 'Crank-up line array stand; 150-250 lb capacity' },
  { name: 'Speaker Stands', department: 'Audio', watts: 0, weightLbs: 8, connector: 'N/A', voltage: 0, notes: 'Tripod speaker stand; 100-150 lb capacity' },
  { name: 'Mic Stands Tall', department: 'Audio', watts: 0, weightLbs: 6, connector: 'N/A', voltage: 0, notes: 'Tall boom mic stand' },
  { name: 'Table Top Mic Stand', department: 'Audio', watts: 0, weightLbs: 2, connector: 'N/A', voltage: 0, notes: 'Desktop mic stand' },
  { name: 'Mid Pole', department: 'Audio', watts: 0, weightLbs: 3, connector: 'N/A', voltage: 0, notes: 'Speaker-to-sub mounting pole (35mm)' },

  // ===== MICROPHONES =====
  // DC wall adapters (small SMPS) — PF ~0.85
  { name: 'Shure BLX88 Dual Wireless', department: 'Comms', watts: 5, weightLbs: 1, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Dual analog wireless receiver; DC adapter' },
  { name: 'Shure BLX4 Single Wireless', department: 'Comms', watts: 3, weightLbs: 0.5, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Single analog wireless receiver' },
  { name: 'Shure QLXD4 Wireless', department: 'Comms', watts: 5, weightLbs: 1.7, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Digital wireless receiver; AES encryption' },
  { name: 'Shure SLX4 Wireless', department: 'Comms', watts: 5, weightLbs: 1.5, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Wireless receiver (discontinued)' },
  { name: 'Shure ULXS4 Wireless', department: 'Comms', watts: 8, weightLbs: 2, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Wireless receiver (discontinued)' },
  { name: 'Shure PGX4 Wireless', department: 'Comms', watts: 5, weightLbs: 1, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Wireless receiver (discontinued)' },
  { name: 'Sennheiser EW XSW 1', department: 'Comms', watts: 4, weightLbs: 0.75, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'UHF wireless system receiver; 12V DC' },
  { name: 'Shure SLXD4D Digital Wireless', department: 'Comms', watts: 8, weightLbs: 2, connector: 'Other', voltage: 120, powerFactor: 0.85, notes: 'Dual digital wireless receiver; 24-bit/48kHz' },
  { name: 'Sennheiser Wired Mic', department: 'Comms', watts: 0, weightLbs: 0.7, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: 'Wired dynamic microphone; phantom from mixer' },

  // ===== CABLES & ACCESSORIES (weight only) =====
  { name: '25ft Extension Cord', department: 'Power/Distro', watts: 0, weightLbs: 3, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: '12 AWG 25ft extension cord' },
  { name: '50ft Extension Cord', department: 'Power/Distro', watts: 0, weightLbs: 6, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: '12 AWG 50ft extension cord' },
  { name: '100ft Extension Cord', department: 'Power/Distro', watts: 0, weightLbs: 12, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: '12 AWG 100ft extension cord' },
  { name: 'Power Strip / Splitter', department: 'Power/Distro', watts: 0, weightLbs: 2, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: '6-outlet power strip' },

  // ===== GENERATORS & POWER =====
  { name: 'Ryobi 4000W Generator', department: 'Power/Distro', watts: 0, weightLbs: 85, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: 'OUTPUT: 3400W running / 4000W starting; inverter; 12hr @ 50%' },
  { name: 'Ryobi 2300W Generator', department: 'Power/Distro', watts: 0, weightLbs: 53, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: 'OUTPUT: 1800W running / 2300W starting; inverter; Bluetooth' },
  { name: 'Ryobi 6500W Generator', department: 'Power/Distro', watts: 0, weightLbs: 205, connector: 'L14-30', voltage: 120, powerFactor: 1.0, notes: 'OUTPUT: 6500W running / 8125W starting; 120/240V' },
  { name: 'EcoFlow Delta Pro', department: 'Power/Distro', watts: 0, weightLbs: 99, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: 'OUTPUT: 3600W (7200W surge); 3600Wh LFP battery; 99 lbs' },
  { name: 'Anker SOLIX Power Station', department: 'Power/Distro', watts: 0, weightLbs: 25, connector: 'Edison', voltage: 120, powerFactor: 1.0, notes: 'OUTPUT: 1800W; 1024Wh LiFePO4 battery' },
  { name: 'Gaff Tape Roll', department: 'Other', watts: 0, weightLbs: 1.5, connector: 'N/A', voltage: 0, powerFactor: 1.0, notes: '2" × 60yd gaff tape roll' },
];

export const defaultEquipment: EquipmentItem[] = raw.map((r) => ({
  id: makeId(r.name),
  name: r.name,
  department: r.department,
  watts: r.watts,
  weightLbs: r.weightLbs,
  connector: r.connector,
  voltage: r.voltage,
  isThreePhase: r.isThreePhase ?? false,
  notes: r.notes ?? '',
  isCustom: false,
  powerFactor: r.powerFactor ?? 0.95,
}));
