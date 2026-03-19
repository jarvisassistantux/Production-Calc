import { useBuild } from '../../context/BuildContext';
import { useEquipmentDB } from '../../hooks/useEquipmentDB';
import { useCalculations } from '../../hooks/useCalculations';
import { fmtWatts, fmtAmps } from '../../utils/format';
import { calcVA } from '../../utils/power';

const S = {
  page: { display: 'none', width: '1050px', padding: '40px 48px', fontFamily: 'Inter, system-ui, sans-serif', background: '#0f1117', color: '#e2e8f0', fontSize: '12px', lineHeight: '1.5' } as React.CSSProperties,
  h1: { fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: '0 0 2px' } as React.CSSProperties,
  meta: { fontSize: '11px', color: '#64748b', margin: '0 0 24px' } as React.CSSProperties,
  sectionLabel: { fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' },
  card: { background: '#1e2330', border: '1px solid #2d3548', borderRadius: '8px', padding: '16px', marginBottom: '16px' } as React.CSSProperties,
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' } as React.CSSProperties,
  summaryItem: { textAlign: 'center' as const },
  summaryValue: { fontSize: '20px', fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', display: 'block' },
  summaryValueGreen: { fontSize: '20px', fontWeight: 700, color: '#34d399', fontFamily: 'JetBrains Mono, monospace', display: 'block' },
  summaryLabel: { fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '11px' },
  th: { padding: '6px 10px', textAlign: 'left' as const, color: '#64748b', borderBottom: '1px solid #2d3548', fontWeight: 600 },
  thRight: { padding: '6px 10px', textAlign: 'right' as const, color: '#64748b', borderBottom: '1px solid #2d3548', fontWeight: 600 },
  td: { padding: '5px 10px', borderBottom: '1px solid #1a1f2e', color: '#cbd5e1' },
  tdRight: { padding: '5px 10px', borderBottom: '1px solid #1a1f2e', color: '#cbd5e1', textAlign: 'right' as const, fontFamily: 'JetBrains Mono, monospace' },
  tdAmber: { padding: '5px 10px', borderBottom: '1px solid #1a1f2e', color: '#f59e0b', textAlign: 'right' as const, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 },
  circuitHeader: { padding: '8px 10px', background: '#252b3b', borderBottom: '1px solid #2d3548', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
  divider: { borderColor: '#2d3548', margin: '20px 0' } as React.CSSProperties,
};

export function PrintView() {
  const { build } = useBuild();
  const { allEquipment } = useEquipmentDB();
  const { circuitSummaries, grandTotals } = useCalculations(build, allEquipment);

  const equipMap = new Map(allEquipment.map(e => [e.id, e]));
  const eventDate = build.eventDate ? new Date(build.eventDate + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  // All powered items across all circuits + unassigned, grouped by department
  const allItems = build.lineItems.map(li => {
    const eq = equipMap.get(li.equipmentId);
    return eq ? { lineItem: li, equipment: eq } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const byDept = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const dept = item.lineItem.departmentOverride ?? item.equipment.department;
    if (!byDept.has(dept)) byDept.set(dept, []);
    byDept.get(dept)!.push(item);
  }

  const totalVA = grandTotals.power.va;
  const totalAmpsAt120 = grandTotals.power.amps120;

  return (
    <div id="print-area" style={S.page}>
      {/* ── Header ── */}
      <h1 style={S.h1}>{build.name}</h1>
      <p style={S.meta}>
        {build.eventVenue && <span>{build.eventVenue}</span>}
        {build.eventVenue && eventDate && <span> · </span>}
        {eventDate && <span>{eventDate}</span>}
        {(build.eventVenue || eventDate) && <span> · </span>}
        <span>Generated {new Date().toLocaleDateString()}</span>
        {build.eventNotes && <span> · {build.eventNotes}</span>}
      </p>

      {/* ── Power Service Summary ── */}
      <div style={S.card}>
        <div style={S.sectionLabel}>Power Service Summary — For Venue / Electrician</div>
        <div style={S.summaryGrid}>
          <div style={S.summaryItem}>
            <span style={S.summaryValue}>{fmtAmps(totalAmpsAt120)}A</span>
            <span style={S.summaryLabel}>Service Required @ 120V</span>
          </div>
          <div style={S.summaryItem}>
            <span style={S.summaryValue}>{fmtWatts(Math.round(totalVA))} VA</span>
            <span style={S.summaryLabel}>Total Apparent Power (kVA)</span>
          </div>
          <div style={S.summaryItem}>
            <span style={S.summaryValue}>{fmtWatts(grandTotals.power.watts)}W</span>
            <span style={S.summaryLabel}>Total Real Power</span>
          </div>
          <div style={S.summaryItem}>
            <span style={S.summaryValueGreen}>{grandTotals.generatorRecommendation}</span>
            <span style={S.summaryLabel}>Generator Required</span>
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '8px 12px', background: '#111827', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>
          Generator sizing: {fmtWatts(Math.round(totalVA))} VA × 1.25 safety factor = {fmtWatts(Math.round(grandTotals.generatorVARequired))} VA required.
          All amp values calculated from apparent power (VA) to account for power factor. Amps include NEC 125% continuous load rule for cable sizing.
        </div>
      </div>

      {/* ── Circuit-by-Circuit Breakdown ── */}
      {circuitSummaries.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={S.sectionLabel}>Circuit Breakdown</div>
          {circuitSummaries.map(cs => {
            const utilColor = cs.utilizationPercent > 100 ? '#ef4444' : cs.utilizationPercent >= 80 ? '#f59e0b' : '#34d399';
            const circuitVA = cs.totalVA;
            return (
              <div key={cs.circuitId} style={{ border: '1px solid #2d3548', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={S.circuitHeader}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', marginRight: '12px' }}>{cs.circuit.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', fontSize: '11px' }}>
                      {cs.circuit.capacityAmps}A @ {cs.circuit.voltage}V{cs.circuit.isThreePhase ? ' 3Φ' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b' }}>{fmtWatts(cs.totalWatts)}W</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', fontSize: '11px' }}>({fmtWatts(Math.round(circuitVA))} VA)</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60a5fa' }}>{fmtAmps(cs.ampsAtCircuitVoltage)}A</span>
                    <span style={{ color: utilColor, fontWeight: 700 }}>{cs.utilizationPercent.toFixed(0)}%</span>
                    {cs.suggestedCableAWG && <span style={{ color: '#64748b', fontSize: '10px' }}>Cable: #{cs.suggestedCableAWG} AWG</span>}
                  </div>
                </div>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Equipment</th>
                      <th style={S.th}>Dept</th>
                      <th style={S.th}>Connector</th>
                      <th style={S.thRight}>Qty</th>
                      <th style={S.thRight}>W/unit</th>
                      <th style={S.thRight}>VA/unit</th>
                      <th style={S.thRight}>Total W</th>
                      <th style={S.thRight}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cs.items.map(({ lineItem, equipment }) => {
                      const unitVA = calcVA(equipment.watts, equipment.powerFactor);
                      return (
                        <tr key={lineItem.id}>
                          <td style={S.td}>{equipment.name}</td>
                          <td style={{ ...S.td, color: '#64748b' }}>{lineItem.departmentOverride ?? equipment.department}</td>
                          <td style={{ ...S.td, color: '#64748b' }}>{equipment.connector}</td>
                          <td style={S.tdRight}>{lineItem.quantity}</td>
                          <td style={S.tdRight}>{fmtWatts(equipment.watts)}</td>
                          <td style={{ ...S.tdRight, color: '#94a3b8' }}>{fmtWatts(Math.round(unitVA))}</td>
                          <td style={S.tdAmber}>{fmtWatts(equipment.watts * lineItem.quantity)}</td>
                          <td style={S.tdRight}>{(equipment.weightLbs * lineItem.quantity).toFixed(1)} lbs</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      <hr style={S.divider} />

      {/* ── Full Equipment List by Department ── */}
      <div style={S.sectionLabel}>Full Equipment List by Department</div>
      {Array.from(byDept.entries()).map(([dept, items]) => {
        const deptWatts = items.reduce((s, { lineItem, equipment }) => s + equipment.watts * lineItem.quantity, 0);
        const deptWeight = items.reduce((s, { lineItem, equipment }) => s + equipment.weightLbs * lineItem.quantity, 0);
        return (
          <div key={dept} style={{ marginBottom: '12px' }}>
            <div style={{ ...S.sectionLabel, color: '#94a3b8', marginBottom: '4px' }}>
              {dept} — {fmtWatts(deptWatts)}W · {deptWeight.toFixed(0)} lbs
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Equipment</th>
                  <th style={S.th}>Connector</th>
                  <th style={S.th}>Voltage</th>
                  <th style={S.thRight}>Qty</th>
                  <th style={S.thRight}>W/unit</th>
                  <th style={S.thRight}>VA/unit</th>
                  <th style={S.thRight}>Total W</th>
                  <th style={S.thRight}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ lineItem, equipment }) => {
                  const unitVA = calcVA(equipment.watts, equipment.powerFactor);
                  return (
                    <tr key={lineItem.id}>
                      <td style={S.td}>{equipment.name}</td>
                      <td style={{ ...S.td, color: '#64748b' }}>{equipment.connector}</td>
                      <td style={{ ...S.td, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{equipment.voltage > 0 ? `${equipment.voltage}V` : '—'}</td>
                      <td style={S.tdRight}>{lineItem.quantity}</td>
                      <td style={S.tdRight}>{equipment.watts > 0 ? fmtWatts(equipment.watts) : '—'}</td>
                      <td style={{ ...S.tdRight, color: '#94a3b8' }}>{equipment.watts > 0 ? fmtWatts(Math.round(unitVA)) : '—'}</td>
                      <td style={S.tdAmber}>{equipment.watts > 0 ? fmtWatts(equipment.watts * lineItem.quantity) : '—'}</td>
                      <td style={S.tdRight}>{(equipment.weightLbs * lineItem.quantity).toFixed(1)} lbs</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* ── Grand Totals ── */}
      <div style={{ ...S.card, marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={S.sectionLabel}>Grand Totals</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{fmtWatts(grandTotals.power.watts)}W</span>
            <span style={{ color: '#64748b', margin: '0 8px' }}>real ·</span>
            <span style={{ color: '#fb923c' }}>{fmtWatts(Math.round(totalVA))} VA</span>
            <span style={{ color: '#64748b', margin: '0 8px' }}>apparent ·</span>
            <span style={{ color: '#60a5fa' }}>{fmtAmps(grandTotals.power.amps120)}A@120V</span>
            <span style={{ color: '#64748b', margin: '0 8px' }}>/</span>
            <span style={{ color: '#60a5fa' }}>{fmtAmps(grandTotals.power.amps208)}A@208V</span>
            <span style={{ color: '#64748b', margin: '0 8px' }}>/</span>
            <span style={{ color: '#60a5fa' }}>{fmtAmps(grandTotals.power.amps240)}A@240V</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#64748b', fontSize: '10px' }}>Total Weight</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0', fontSize: '14px', fontWeight: 700 }}>
            {grandTotals.totalWeightLbs.toFixed(0)} lbs
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', fontSize: '10px', color: '#374151', textAlign: 'center' }}>
        Generated by PowerCalc · {new Date().toLocaleString()} · Calculations per NEC 215.2(A)(1) continuous load rule
      </div>
    </div>
  );
}
