import { useBuild } from '../../context/BuildContext';
import { useEquipmentDB } from '../../hooks/useEquipmentDB';
import { useCalculations } from '../../hooks/useCalculations';
import { CircuitGroup } from './CircuitGroup';
import { QuickCalcGroup } from './QuickCalcGroup';
import { AddCircuitForm } from './AddCircuitForm';
import { EventInfoBar } from '../EventInfoBar';
import { UNASSIGNED_CIRCUIT_ID } from '../../types';

export function BuildSheet() {
  const { build } = useBuild();
  const { allEquipment } = useEquipmentDB();
  const { circuitSummaries } = useCalculations(build, allEquipment);

  const unassignedItems = build.lineItems.filter(li => li.circuitId === UNASSIGNED_CIRCUIT_ID);
  const hasCircuits = circuitSummaries.length > 0;
  const hasUnassigned = unassignedItems.length > 0;
  const isEmpty = !hasCircuits && !hasUnassigned;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <EventInfoBar />
      <div className="p-4 border-b border-gray-800">
        <AddCircuitForm />
      </div>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-3">&#9889;</div>
            <p className="text-lg font-medium">No equipment added yet</p>
            <p className="text-sm mt-1">Add equipment from the left panel using "Quick Calc" or create a circuit first</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 space-y-4">
          {/* Quick Calc / Unassigned Items */}
          {hasUnassigned && (
            <QuickCalcGroup items={unassignedItems} allEquipment={allEquipment} />
          )}

          {/* Circuit Groups */}
          {circuitSummaries.map(cs => (
            <CircuitGroup key={cs.circuitId} summary={cs} />
          ))}
        </div>
      )}
    </div>
  );
}
