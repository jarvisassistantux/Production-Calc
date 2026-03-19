import { useBuild } from '../../context/BuildContext';
import { useEquipmentDB } from '../../hooks/useEquipmentDB';
import { useCalculations } from '../../hooks/useCalculations';
import { PowerTotals } from './PowerTotals';
import { WeightTotals } from './WeightTotals';
import { GeneratorSizing } from './GeneratorSizing';
import { DepartmentBreakdown } from './DepartmentBreakdown';
import { TruckPayload } from './TruckPayload';

export function StickyDashboard() {
  const { build } = useBuild();
  const { allEquipment } = useEquipmentDB();
  const { grandTotals, departmentSummaries } = useCalculations(build, allEquipment);

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Dashboard</h2>
      <PowerTotals totals={grandTotals} />
      <WeightTotals totals={grandTotals} />
      <TruckPayload totals={grandTotals} />
      <GeneratorSizing totals={grandTotals} />
      <DepartmentBreakdown departments={departmentSummaries} />
    </div>
  );
}
