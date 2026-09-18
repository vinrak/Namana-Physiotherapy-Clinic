import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { CLINIC_CONFIG } from '../constants';
import { ReceiptData } from '../types';
import { ClinicLogo } from './ClinicLogo';
import { generatePdfReceipt } from '../utils/pdfReceipt';
import { loadClinicSettings, formatPatientId, parsePatientId } from '../utils/storage';

interface ReceiptModalProps {
  receiptData: ReceiptData;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receiptData, onClose }) => {
  const settings = loadClinicSettings();
  const [name, setName] = useState(receiptData.name || '');
  const [serial, setSerial] = useState(receiptData.serial || '');
  
  const rawRegNo = (receiptData.regNo || '').trim();
  const parsedReg = parsePatientId(rawRegNo);
  const initialRegNo = parsedReg
    ? formatPatientId(receiptData.date, parsedReg.seq)
    : rawRegNo || (receiptData.serial ? formatPatientId(receiptData.date, Number(receiptData.serial)) : '');

  const [regNo, setRegNo] = useState(initialRegNo);
  const [receiptNo, setReceiptNo] = useState(receiptData.receiptNo || '');
  const [date, setDate] = useState(receiptData.date || new Date().toISOString().slice(0, 10));
  const [age, setAge] = useState(receiptData.age || '');
  const [address, setAddress] = useState(receiptData.address || 'Mysuru, Karnataka');
  const [therapyFor, setTherapyFor] = useState(receiptData.therapyFor || 'Physiotherapy Rehabilitation');
  const [sessionFrom, setSessionFrom] = useState(receiptData.sessionFrom || receiptData.date || '');
  const [sessionTo, setSessionTo] = useState(receiptData.sessionTo || receiptData.date || '');
  const [amount, setAmount] = useState(receiptData.amount || '500');
  const [visitType, setVisitType] = useState(receiptData.visitType || 'Clinic');
  const [paymentMethod, setPaymentMethod] = useState(receiptData.paymentMethod || 'Cash');

  const currentReceipt: ReceiptData = {
    open: true,
    name,
    serial,
    regNo,
    receiptNo,
    date,
    age,
    address,
    therapyFor,
    sessionFrom,
    sessionTo,
    amount,
    visitType,
    paymentMethod,
    gstNumber: settings.showGstOnReceipt ? settings.gstNumber : undefined,
    showGst: settings.showGstOnReceipt,
  };

  const handleDownloadPdf = () => {
    generatePdfReceipt(currentReceipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-sky-100 p-4 sm:p-6 my-auto animate-fade-in relative">
        {/* Receipt Container with authentic clinical border */}
        <div id="printable-receipt" className="border-2 border-sky-600 rounded-2xl p-4 sm:p-6 bg-white relative text-slate-800">
          {/* Inner border */}
          <div className="border border-sky-200 rounded-xl p-3 sm:p-5">
            {/* Header Section with Logo & Clinic Name */}
            <div className="pb-3 border-b border-sky-100">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ClinicLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-extrabold text-sky-950 tracking-tight leading-tight truncate">
                      {CLINIC_CONFIG.clinicName}
                    </h2>
                    <p className="text-[9px] font-bold text-sky-700 uppercase tracking-wider mt-0.5">
                      {CLINIC_CONFIG.services}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-600 shrink-0">
                  <p className="font-bold text-slate-800 text-xs sm:text-sm">
                    {CLINIC_CONFIG.consultantName || 'R. Chandrashekar'}{' '}
                    <span className="text-[10px] sm:text-[11px] font-normal text-slate-500">
                      {CLINIC_CONFIG.consultantEducation || 'BPT, MIAP'}
                    </span>
                  </p>
                  <p className="text-slate-500 text-[10.5px]">{CLINIC_CONFIG.consultantTitle}</p>
                  <p className="font-semibold text-sky-700">Mob: {CLINIC_CONFIG.phone}</p>
                </div>
              </div>

              {/* Clinic Address below Clinic Name & Tagline */}
              <div className="mt-2 pt-1.5 border-t border-sky-50 text-center">
                <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">
                  {CLINIC_CONFIG.address.full}
                </p>
                {settings.showGstOnReceipt && settings.gstNumber && (
                  <p className="text-[10px] font-bold text-sky-800 mt-1">
                    GSTIN: {settings.gstNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Receipt Banner */}
            <div className="text-center my-3">
              <span className="inline-block bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Consultation & Therapy Receipt
              </span>
            </div>

            {/* Receipt Details Form / Preview */}
            <div className="space-y-2.5 text-xs text-slate-700">
              {/* Receipt No and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">Receipt No:</span>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="flex-1 font-mono font-bold text-sky-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                  />
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">Date:</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 text-slate-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Patient Name */}
              <div className="flex items-end gap-1.5">
                <span className="font-bold text-slate-800 shrink-0">Patient Name:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 font-bold text-slate-900 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                />
              </div>

              {/* Reg No & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">Patient ID:</span>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="flex-1 font-mono font-bold text-sky-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                  />
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">Age / Address:</span>
                  <input
                    type="text"
                    value={age ? `${age} Yrs` : ''}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45 Yrs"
                    className="flex-1 text-slate-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Therapy for (Condition / Diagnosis) */}
              <div className="flex items-end gap-1.5">
                <span className="font-bold text-slate-800 shrink-0">Therapy for:</span>
                <input
                  type="text"
                  value={therapyFor}
                  onChange={(e) => setTherapyFor(e.target.value)}
                  placeholder="e.g. Cervical Spondylosis Rehabilitation"
                  className="flex-1 text-slate-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                />
              </div>

              {/* Session From and To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">Session From:</span>
                  <input
                    type="date"
                    value={sessionFrom}
                    onChange={(e) => setSessionFrom(e.target.value)}
                    className="flex-1 text-slate-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                  />
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">To:</span>
                  <input
                    type="date"
                    value={sessionTo}
                    onChange={(e) => setSessionTo(e.target.value)}
                    className="flex-1 text-slate-800 border-b border-dotted border-slate-400 px-1 py-0.5 outline-none focus:border-sky-500 bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="flex items-center gap-2 pt-1">
                <span className="font-bold text-slate-800 shrink-0">Payment Mode:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['Cash', 'UPI', 'Card', 'Bank Transfer'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                        paymentMethod === mode
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Received */}
              <div className="flex items-end gap-2 pt-1">
                <span className="font-bold text-slate-900 shrink-0">Amount Received:</span>
                <div className="flex items-center gap-1 flex-1 border-b border-dotted border-slate-400 px-1 py-0.5">
                  <span className="font-bold text-slate-800 text-sm">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-24 font-mono font-bold text-sky-900 text-sm outline-none bg-transparent"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    /- ({visitType} • <span className="font-bold text-sky-800">{paymentMethod}</span>)
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="flex justify-end pt-5 pb-2">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Authorized Signature</span>
                <p className="text-[10px] font-bold text-slate-700 mt-0.5">
                  {CLINIC_CONFIG.consultantName || 'R. Chandrashekar'}
                </p>
                <p className="text-[8.5px] text-slate-500 font-normal">
                  {CLINIC_CONFIG.consultantEducation || 'BPT, MIAP'}
                </p>
                <p className="text-[8.5px] text-slate-400">{CLINIC_CONFIG.consultantTitle}</p>
              </div>
            </div>

            {/* Clinic Contact & Address Footer */}
            <div className="pt-2 border-t border-slate-200 text-center space-y-0.5 text-[9px] sm:text-[10px] text-slate-500">
              <p className="font-bold text-sky-900">{CLINIC_CONFIG.clinicName} • {CLINIC_CONFIG.services}</p>
              <p>{CLINIC_CONFIG.address.full}</p>
              <p>
                Consultant: <b className="text-slate-800">{CLINIC_CONFIG.consultantName || 'R. Chandrashekar'}</b>{' '}
                <span className="text-[8.5px] font-normal text-slate-500">{CLINIC_CONFIG.consultantEducation || 'BPT, MIAP'}</span>{' '}
                ({CLINIC_CONFIG.consultantTitle}) • Mob:{' '}
                <b className="text-sky-800">{CLINIC_CONFIG.phone}</b> • Email: {CLINIC_CONFIG.email}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-4 flex items-center justify-end gap-2.5 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
