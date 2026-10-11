import React, { useState } from 'react';
import { X, CheckSquare, Save } from 'lucide-react';
import { LegalTask, TaskPriority, TaskStatus, LegalCase } from '../../types';
import { LAWYERS } from '../../services/storage';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<LegalTask>) => void;
  cases: LegalCase[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cases,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [assignedToId, setAssignedToId] = useState(LAWYERS[0].id);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<TaskPriority>('عالية');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('يرجى كتابة عنوان المهمة');
      return;
    }

    const selectedLawyer = LAWYERS.find((l) => l.id === assignedToId);
    const selectedCase = cases.find((c) => c.id === caseId);

    const payload: Partial<LegalTask> = {
      title,
      description,
      caseId: selectedCase?.id,
      caseNumber: selectedCase?.caseNumber,
      assignedToId,
      assignedToName: selectedLawyer ? selectedLawyer.name : LAWYERS[0].name,
      assignedRole: selectedLawyer ? selectedLawyer.role : 'محامي',
      dueDate,
      priority,
      status,
      progressPercentage: Number(progressPercentage),
      comments: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">إسناد وتكليف بمهمة عمل جديدة</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              عنوان المهمة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: إعداد مذكرة استئناف ضد لائحة الخصم..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-rose-600 focus:bg-white transition font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              تفاصيل المهمة والتوجيهات
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح متطلبات الإنجاز والمستندات المطلوبة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-600 focus:bg-white resize-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                المكلف بالإنجاز من الطاقم
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-rose-600 focus:bg-white font-medium transition"
              >
                {LAWYERS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                الموعد النهائي للإنجاز (Deadline)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-rose-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الأولوية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-rose-600 focus:bg-white font-medium transition"
              >
                <option value="حرجة">حرجة (عاجلة جداً)</option>
                <option value="عالية">عالية</option>
                <option value="متوسطة">متوسطة</option>
                <option value="عادية">عادية</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">القضية المرتبطة</label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-rose-600 focus:bg-white transition"
              >
                <option value="">-- بدون ارتباط بقضية --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    قضية #{c.caseNumber} - {c.clientName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-bold">نسبة الإنجاز الأولية</label>
              <span className="font-mono text-blue-700 font-black">{progressPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={(e) => setProgressPercentage(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md shadow-rose-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>إسناد المهمة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
