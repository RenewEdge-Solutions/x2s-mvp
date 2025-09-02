import React, { useMemo } from 'react';
import Card from '../components/Card';
import { FileText, Download } from 'lucide-react';

type AuditorReportKey =
  | 'audit_summary'
  | 'inspection_findings'
  | 'compliance_gap_analysis'
  | 'cap_status'
  | 'enforcement_actions_summary'
  | 'license_renewal_tracker'
  | 'variance_analysis'
  | 'traceability_exceptions'
  | 'chain_of_custody'
  | 'cctv_uptime';

type AuditorReport = {
  key: AuditorReportKey;
  label: string;
  description: string;
  format: 'csv';
  headers: string[];
  rows?: Array<Record<string, string | number>>; // small mock rows
};

const auditorReports: AuditorReport[] = [
  {
    key: 'audit_summary',
    label: 'Audit Summary',
    description: 'Overview of completed audits with outcomes and notes',
    format: 'csv',
    headers: ['Date', 'Facility', 'Outcome', 'Findings', 'Auditor'],
    rows: [
      { Date: '2025-08-10', Facility: 'Green Valley', Outcome: 'Pass', Findings: 'Minor labeling issues', Auditor: 'A. Inspector' },
      { Date: '2025-08-28', Facility: 'Sunrise Fields', Outcome: 'Fail', Findings: 'Critical: access control', Auditor: 'A. Inspector' },
    ],
  },
  {
    key: 'inspection_findings',
    label: 'Inspection Findings',
    description: 'Detailed inspection notes and observations',
    format: 'csv',
    headers: ['Date', 'Facility', 'Area', 'Issue', 'Severity', 'Action Required'],
  },
  {
    key: 'compliance_gap_analysis',
    label: 'Compliance Gap Analysis',
    description: 'Regulation gaps mapped to controls and remediation',
    format: 'csv',
    headers: ['Regulation', 'Control', 'Gap', 'Risk', 'Recommended Action', 'Owner'],
  },
  {
    key: 'cap_status',
    label: 'Corrective Action Plan (CAP) Status',
    description: 'CAP items with due dates and completion status',
    format: 'csv',
    headers: ['Facility', 'CAP Item', 'Due Date', 'Status', 'Owner'],
  },
  {
    key: 'enforcement_actions_summary',
    label: 'Enforcement Actions Summary',
    description: 'Warnings, notices, and penalties issued',
    format: 'csv',
    headers: ['Date', 'Facility', 'Action', 'Reason', 'Status'],
  },
  {
    key: 'license_renewal_tracker',
    label: 'License Renewal Tracker',
    description: 'Upcoming renewals and submission readiness',
    format: 'csv',
    headers: ['Facility', 'License No.', 'Expiry', 'Status', 'Notes'],
  },
  {
    key: 'variance_analysis',
    label: 'Inventory Variance Analysis',
    description: 'Variance by product type and time window',
    format: 'csv',
    headers: ['Date Range', 'Product', 'Expected Qty', 'Actual Qty', 'Variance', '%'],
  },
  {
    key: 'traceability_exceptions',
    label: 'Traceability Exceptions',
    description: 'Missing scans, orphan lots, unusual movements',
    format: 'csv',
    headers: ['Date', 'Entity', 'Exception', 'Details', 'Severity'],
  },
  {
    key: 'chain_of_custody',
    label: 'Chain of Custody',
    description: 'Transfers with sender/receiver and attestations',
    format: 'csv',
    headers: ['Date', 'From', 'To', 'Item', 'Quantity', 'Attestation'],
  },
  {
    key: 'cctv_uptime',
    label: 'CCTV Uptime & Coverage',
    description: 'Uptime metrics and coverage by zone',
    format: 'csv',
    headers: ['Facility', 'Zone', 'Uptime %', 'Outages', 'Last Audit'],
  },
];

export default function Reports() {
  const data = useMemo(() => auditorReports, []);

  const downloadCsv = (report: AuditorReport) => {
    const headers = report.headers;
    const rows = report.rows || [];
    const escape = (v: any) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.label.replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Auditor Reports" subtitle="Templates tailored for audit and compliance">
        <ul className="divide-y divide-gray-100">
          {data.map((t) => (
            <li key={t.key} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" aria-hidden />
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.description} • {t.format.toUpperCase()}</div>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                onClick={() => downloadCsv(t)}
              >
                <Download className="h-4 w-4" aria-hidden /> Download
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="About" subtitle="Generated in-browser for demo purposes">
        <div className="text-sm text-gray-700 space-y-2">
          <p>These report templates are designed for auditors. Downloads are generated client-side as CSV samples with headers and a few mock rows (where provided).</p>
          <p>For production, these would be generated server-side and include full datasets with filters and scheduling.</p>
        </div>
      </Card>
    </div>
  );
}
