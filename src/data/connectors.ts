import type { ConnectorSpec } from '../types';

export const connectorSpecs: ConnectorSpec[] = [
  { name: 'Edison (5-15)', maxAmps: 15, voltage: 120, continuousAmps: 12, description: 'Standard household 15A' },
  { name: 'Edison (5-20)', maxAmps: 20, voltage: 120, continuousAmps: 16, description: 'Household 20A T-slot' },
  { name: 'L5-20', maxAmps: 20, voltage: 120, continuousAmps: 16, description: 'Twist-lock 120V 20A' },
  { name: 'L5-30', maxAmps: 30, voltage: 120, continuousAmps: 24, description: 'Twist-lock 120V 30A' },
  { name: 'L6-20', maxAmps: 20, voltage: 208, continuousAmps: 16, description: 'Twist-lock 208/240V 20A' },
  { name: 'L6-30', maxAmps: 30, voltage: 208, continuousAmps: 24, description: 'Twist-lock 208/240V 30A' },
  { name: 'L14-30', maxAmps: 30, voltage: 240, continuousAmps: 24, description: 'Twist-lock 120/240V generator' },
  { name: 'L21-30', maxAmps: 30, voltage: 208, continuousAmps: 24, description: 'Twist-lock 3-phase 208V' },
  { name: 'powerCON TRUE1', maxAmps: 20, voltage: 120, continuousAmps: 16, description: 'Neutrik outdoor-rated' },
  { name: 'powerCON 20A', maxAmps: 20, voltage: 120, continuousAmps: 16, description: 'Neutrik locking AC blue' },
  { name: 'Socapex', maxAmps: 20, voltage: 120, continuousAmps: 16, description: '6-circuit multi-cable' },
  { name: 'Cam-Lok', maxAmps: 400, voltage: 208, continuousAmps: 320, description: 'Single-pole feeder' },
  { name: 'CEE 32A', maxAmps: 32, voltage: 230, continuousAmps: 25, description: 'European standard' },
  { name: 'IEC C13', maxAmps: 10, voltage: 120, continuousAmps: 8, description: 'Computer/small gear' },
  { name: 'IEC C19', maxAmps: 16, voltage: 120, continuousAmps: 13, description: 'Servers/larger gear' },
];
