import React from 'react';
import Card from '../components/Card';

const demo = [
  { id: 'A-102', type: 'batch', hash: 'c4f5…91b2' },
  { id: 'D-221', type: 'distill', hash: '8ab2…cc11' },
  { id: 'SHP-00045', type: 'shipment', hash: '12cd…88ee' },
];

export default function AlcoholBlockchain() {
  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-3">Alcohol Blockchain Integrity (Mock)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {demo.map((e) => (
              <tr key={e.id} className="text-gray-800">
                <td className="py-2 pr-4">{e.type}</td>
                <td className="py-2 pr-4 font-mono text-xs">{e.id}</td>
                <td className="py-2 pr-4 font-mono text-xs break-all">{e.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
