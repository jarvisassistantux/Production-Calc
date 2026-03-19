export type Department =
  | 'Lighting'
  | 'Video'
  | 'Audio'
  | 'Rigging'
  | 'Power/Distro'
  | 'Comms'
  | 'Staging'
  | 'SFX'
  | 'Other';

export const DEPARTMENTS: Department[] = [
  'Lighting', 'Video', 'Audio', 'Rigging', 'Power/Distro', 'Comms', 'Staging', 'SFX', 'Other'
];

export const UNASSIGNED_CIRCUIT_ID = '__unassigned__';

export const CONNECTORS = [
  'Edison', 'Edison (5-20)', 'L5-20', 'L5-30', 'L6-20', 'L6-30',
  'L14-30', 'L21-30', 'powerCON TRUE1', 'powerCON 20A',
  'Socapex', 'Cam-Lok', 'CEE 32A', 'IEC C13', 'IEC C19',
  'NL4', 'N/A', 'Battery', 'Other'
] as const;

export interface EquipmentItem {
  id: string;
  name: string;
  department: Department;
  watts: number;
  weightLbs: number;
  connector: string;
  voltage: number;
  isThreePhase: boolean;
  notes: string;
  isCustom: boolean;
  /** Power factor 0.0–1.0. Apparent power VA = watts / powerFactor. Defaults to 0.95. */
  powerFactor: number;
}

export interface BuildLineItem {
  id: string;
  equipmentId: string;
  quantity: number;
  circuitId: string;
  departmentOverride?: Department;
}

export interface Circuit {
  id: string;
  name: string;
  capacityAmps: number;
  voltage: number;
  isThreePhase: boolean;
}

export interface Build {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  circuits: Circuit[];
  lineItems: BuildLineItem[];
  truckPayloadLimitLbs: number;
  customEquipment: EquipmentItem[];
  eventVenue?: string;
  eventDate?: string;
  eventNotes?: string;
}

export interface EquipmentBundle {
  id: string;
  name: string;
  items: Array<{ equipmentId: string; quantity: number }>;
  createdAt: string;
}

export interface PowerAtVoltage {
  watts: number;
  /** Apparent power in VA (volt-amperes). VA = Σ(watts_i / PF_i). Circuits are sized by VA, not watts. */
  va: number;
  /** Amps at 120V = va / 120 */
  amps120: number;
  /** Amps at 208V = va / 208 */
  amps208: number;
  /** Amps at 240V = va / 240 */
  amps240: number;
}

export interface CircuitPowerSummary {
  circuitId: string;
  circuit: Circuit;
  totalWatts: number;
  /** Apparent power in VA — what the circuit breaker/wiring actually handles */
  totalVA: number;
  ampsAtCircuitVoltage: number;
  utilizationPercent: number;
  power: PowerAtVoltage;
  totalWeightLbs: number;
  suggestedCableAWG: string | null;
  suggestedCableDesc: string;
  necWarning: boolean;
  items: Array<{ lineItem: BuildLineItem; equipment: EquipmentItem }>;
}

export interface DepartmentSummary {
  department: Department;
  power: PowerAtVoltage;
  totalWeightLbs: number;
  itemCount: number;
}

export interface GrandTotals {
  power: PowerAtVoltage;
  totalWeightLbs: number;
  totalItems: number;
  /** Minimum generator kVA required = totalVA × 1.25 safety factor */
  generatorVARequired: number;
  generatorRecommendation: string;
  truckUtilizationPercent: number;
}

export interface WireGaugeSpec {
  awg: string;
  ampacity: number;
  typicalUse: string;
}

export interface GeneratorSize {
  label: string;
  watts: number;
}

export interface ConnectorSpec {
  name: string;
  maxAmps: number;
  voltage: number;
  continuousAmps: number;
  description: string;
}
