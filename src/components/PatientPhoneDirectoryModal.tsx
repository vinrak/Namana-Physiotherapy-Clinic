import React, { useState, useMemo } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Send,
  CheckSquare,
  Square,
  Search,
  Copy,
  Check,
  Users,
  Smartphone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Patient } from '../types';
import { formatPatientId } from '../utils/storage';
import { getCleanPhone, openWhatsApp } from '../utils/whatsappHelper';

interface PatientPhoneDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
}

type MessageChannel = 'whatsapp' | 'sms';

export const PatientPhoneDirectoryModal: React.FC<PatientPhoneDirectoryModalProps> = ({
  isOpen,
  onClose,
  patients,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'withPhone'>('withPhone');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageChannel, setMessageChannel] = useState<MessageChannel>('whatsapp');
  const [customMessage, setCustomMessage] = useState(
    'Dear {name}, this is a gentle reminder from Namana Physiotherapy Clinic regarding your ongoing rehabilitation and posture care. Please stay regular with your prescribed home exercises. For appointments or assistance, contact 9880517715.'
  );
  const [copiedNumbersNotice, setCopiedNumbersNotice] = useState(false);
  const [broadcastIndex, setBroadcastIndex] = useState(0);

  // Filter patients based on query and mode
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Exclude deleted patients (only show active data from the backup sheet, never archives)
      if (p.deleted || p.status === 'Deleted') return false;
      if (filterMode === 'withPhone' && (!p.contact || !p.contact.trim())) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pId = p.regNo || formatPatientId(p.date, p.serial);
        const name = (p.name || '').toLowerCase();
        const contact = (p.contact || '').toLowerCase();
        const diagnosis = (p.diagnosis || '').toLowerCase();
        return name.includes(q) || contact.includes(q) || pId.toLowerCase().includes(q) || diagnosis.includes(q);
      }

      return true;
    });
  }, [patients, filterMode, searchQuery]);

  // Selected patients array
  const selectedPatients = useMemo(() => {
    return filteredPatients.filter((p) => selectedIds.has(p.id));
  }, [filteredPatients, selectedIds]);

  // Handle Select All / Deselect All
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredPatients.length && filteredPatients.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPatients.map((p) => p.id)));
    }
  };

  const handleTogglePatient = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Preset Message Templates
  const applyPreset = (template: string) => {
    setCustomMessage(template);
  };

  // Get substituted message for a specific patient
  const getPatientMessage = (p: Patient) => {
    const patientName = p.name ? p.name.trim() : 'Patient';
    return customMessage.replace(/\{name\}/g, patientName);
  };

  // Copy phone numbers
  const handleCopyPhoneNumbers = () => {
    const targetList = selectedPatients.length > 0 ? selectedPatients : filteredPatients;
    const numbers = targetList
      .map((p) => p.contact)
      .filter(Boolean)
      .map((num) => num.replace(/\D/g, ''))
      .filter((n) => n.length >= 10);

    if (numbers.length === 0) {
      alert('No valid phone numbers found in selection.');
      return;
    }

    navigator.clipboard.writeText(numbers.join(', '));
    setCopiedNumbersNotice(true);
    setTimeout(() => setCopiedNumbersNotice(false), 3000);
  };

  // Send WhatsApp to single patient
  const handleSendWhatsAppSingle = (p: Patient) => {
    if (!p.contact) {
      alert(`Patient ${p.name} does not have a recorded contact number.`);
      return;
    }
    const msg = getPatientMessage(p);
    openWhatsApp(p.contact, msg);
  };

  // Send SMS to single patient
  const handleSendSmsSingle = (p: Patient) => {
    if (!p.contact) {
      alert(`Patient ${p.name} does not have a recorded contact number.`);
      return;
    }
    const msg = getPatientMessage(p);
    const cleanPhone = p.contact.replace(/\D/g, '');
    window.open(`sms:${cleanPhone}?body=${encodeURIComponent(msg)}`, '_blank');
  };

  // Broadcast WhatsApp to next selected patient
  const handleBroadcastNextWhatsApp = () => {
    const list = selectedPatients.length > 0 ? selectedPatients : filteredPatients;
    if (list.length === 0) return;

    const safeIndex = broadcastIndex % list.length;
    const current = list[safeIndex];
    handleSendWhatsAppSingle(current);

    setBroadcastIndex((prev) => (prev + 1) % list.length);
  };

  // Bulk SMS
  const handleBulkSms = () => {
    const targetList = selectedPatients.length > 0 ? selectedPatients : filteredPatients;
    const numbers = targetList
      .map((p) => p.contact)
      .filter(Boolean)
      .map((n) => n.replace(/\D/g, ''))
      .filter((n) => n.length >= 10);

    if (numbers.length === 0) {
      alert('Please select at least one patient with a valid phone number.');
      return;
    }

    // Default message with generic greeting if sending to multiple
    const genericMsg = customMessage.replace(/\{name\}/g, 'Valued Patient');
    const numbersStr = numbers.join(',');
    window.open(`sms:${numbersStr}?body=${encodeURIComponent(genericMsg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden">
        {/* Top Modal Header */}
        <div className="p-4 sm:p-6 border-b border-sky-50 flex items-center justify-between bg-sky-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-sky-950 flex items-center gap-2">
                <span>Patient Phone Number Directory</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono font-bold border border-sky-200">
                  {patients.filter((p) => p.contact && p.contact.trim()).length} Contacts
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Send WhatsApp or SMS text messages to selected patients or broadcast to all patients.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Message Broadcast Composer Panel */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-sky-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Message Broadcaster & SMS Composer
                </h3>
              </div>

              {/* Message Channel Selector */}
              <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMessageChannel('whatsapp')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    messageChannel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessageChannel('sms')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    messageChannel === 'sms'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS Text</span>
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">Quick Templates:</span>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Dear {name}, this is a gentle reminder from Namana Physiotherapy Clinic regarding your ongoing rehabilitation. Please stay regular with your prescribed home exercises. Contact 9880517715 for queries.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                🏃 Exercise & Posture Reminder
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Dear {name}, greeting from Namana Physiotherapy Clinic. Please schedule your follow-up rehabilitation session to ensure continuous pain relief and mobility recovery.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                📅 Follow-up Session Notice
              </button>
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Dear {name}, thank you for choosing Namana Physiotherapy Clinic for your treatment. We wish you sound health and active mobility.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                🌟 Wellness Greeting
              </button>
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Type custom message. Tip: use {name} to auto-insert patient name..."
                className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none shadow-2xs resize-none"
              />
              <p className="text-[10.5px] text-slate-500 flex items-center justify-between">
                <span>
                  Tip: <b>{'{name}'}</b> will be dynamically replaced with the recipient's name.
                </span>
                <span>{customMessage.length} characters</span>
              </p>
            </div>

            {/* Broadcast Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Target Recipients:{' '}
                  <b className="text-sky-700">
                    {selectedPatients.length > 0
                      ? `${selectedPatients.length} Selected Patients`
                      : `All ${filteredPatients.length} Patients`}
                  </b>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Copy Numbers Button */}
                <button
                  type="button"
                  onClick={handleCopyPhoneNumbers}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Copy telephone numbers to clipboard for external broadcast"
                >
                  {copiedNumbersNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Numbers Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Numbers</span>
                    </>
                  )}
                </button>

                {/* Send WhatsApp Broadcast Button */}
                {messageChannel === 'whatsapp' ? (
                  <button
                    type="button"
                    onClick={handleBroadcastNextWhatsApp}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selectedPatients.length === 1
                        ? `Send WhatsApp to ${selectedPatients[0].name}`
                        : `Launch WhatsApp Sender (${
                            (broadcastIndex % (selectedPatients.length || filteredPatients.length || 1)) + 1
                          }/${selectedPatients.length || filteredPatients.length})`}
                    </span>
                  </button>
                ) : (
                  /* Send SMS Broadcast Button */
                  <button
                    type="button"
                    onClick={handleBulkSms}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      Send SMS to {selectedPatients.length > 0 ? selectedPatients.length : filteredPatients.length} Patients
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Directory Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-sky-100 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {selectedIds.size === filteredPatients.length && filteredPatients.length > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-sky-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400" />
                    <span>Select All ({filteredPatients.length})</span>
                  </>
                )}
              </button>

              {selectedIds.size > 0 && (
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  {selectedIds.size} Selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Filter mode */}
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer shadow-2xs"
              >
                <option value="withPhone">With Phone Number Only</option>
                <option value="active">Active Patients</option>
                <option value="all">All Patients</option>
              </select>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, ID..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Patients Contact List Table */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-sky-50/60 text-[11px] font-bold text-sky-950 uppercase tracking-wider border-b border-sky-100">
                  <tr>
                    <th className="p-3.5 pl-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredPatients.length && filteredPatients.length > 0}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Attending Physiotherapist</th>
                    <th className="p-3.5">Consultation Date</th>
                    <th className="p-3.5 pr-4 text-right">Individual 1-Click Send</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50 font-medium">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        No patient phone records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const isSelected = selectedIds.has(p.id);
                      const hasPhone = !!(p.contact && p.contact.trim());
                      const regId = p.regNo || formatPatientId(p.date, p.serial);

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="p-3.5 pl-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePatient(p.id)}
                              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{p.name || 'Unnamed Patient'}</div>
                            <div className="font-mono text-[10px] text-sky-800">
                              ID: {regId} • {p.age ? `${p.age} Yrs` : ''} {p.gender || ''}
                            </div>
                          </td>
                          <td className="p-3.5">
                            {hasPhone ? (
                              <a
                                href={`tel:${p.contact}`}
                                className="font-mono font-bold text-slate-900 hover:text-sky-700 flex items-center gap-1.5"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{p.contact}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No contact added</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-700 font-semibold">{p.seenBy || 'R. Chandrashekar'}</span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {p.date || '—'}
                          </td>
                          <td className="p-3.5 pr-4 text-right">
                            {hasPhone ? (
                              <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                                {/* Send WhatsApp */}
                                <button
                                  type="button"
                                  onClick={() => handleSendWhatsAppSingle(p)}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                  title={`Send WhatsApp to ${p.name}`}
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </button>

                                {/* Direct Call */}
                                <a
                                  href={`tel:${p.contact}`}
                                  className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                  title={`Direct call to ${p.contact}`}
                                >
                                  <Phone className="w-3 h-3 text-sky-600" />
                                  <span>Call</span>
                                </a>

                                {/* Copy Phone */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (p.contact) {
                                      navigator.clipboard.writeText(p.contact);
                                    }
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                  title={`Copy ${p.contact}`}
                                >
                                  <Copy className="w-3 h-3 text-slate-500" />
                                  <span>Copy</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-sky-50 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing {filteredPatients.length} of {patients.length} total patient directory records
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
