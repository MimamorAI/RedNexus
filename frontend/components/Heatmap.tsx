import React from 'react';

// Simple static MITRE ATT&CK matrix placeholder. In a real product this would be generated
// from backend coverage data (technique IDs -> coverage %). For the enterprise demo we
// colour cells based on mock coverage values.

type Cell = { tactic: string; technique: string; coverage: number };

const tactics = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Exfiltration',
  'Impact',
];

// mock data – normally fetched from /api/coverage
const mockCells: Cell[] = tactics.map((tactic, i) => ({
  tactic,
  technique: `T${String(i + 1).padStart(4, '0')}`,
  coverage: Math.round(Math.random() * 100),
}));

export default function Heatmap() {
  return (
    <div className="overflow-auto rounded border border-gray-700">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-800">
          <tr>
            {tactics.map(t => (
              <th key={t} className="p-2 text-center font-medium text-gray-200">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {mockCells.map(cell => (
              <td
                key={cell.tactic}
                className={`p-2 text-center border border-gray-700 ${
                  cell.coverage > 75
                    ? 'bg-green-800'
                    : cell.coverage > 40
                    ? 'bg-yellow-800'
                    : 'bg-red-800'
                }`}
              >
                <div className="text-xs font-mono">{cell.technique}</div>
                <div className="text-xs">{cell.coverage}%</div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
