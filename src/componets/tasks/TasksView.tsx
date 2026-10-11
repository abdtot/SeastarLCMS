import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  MessageSquare,
  Send,
  Trash2
} from 'lucide-react';
import { LegalTask, TaskPriority, TaskStatus, LawyerMember } from '../../types';

interface TasksViewProps {
  tasks: LegalTask[];
  currentLawyer: LawyerMember;
  onOpenAddTask: () => void;
  onUpdateTaskProgress: (taskId: string, progress: number, status: TaskStatus) => void;
  onAddComment: (taskId: string, text: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  currentLawyer,
  onOpenAddTask,
  onUpdateTaskProgress,
  onAddComment,
  onDeleteTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentTaskId, setActiveCommentTaskId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.caseNumber && t.caseNumber.includes(searchQuery));

    return matchesStatus && matchesSearch;
  });

  const handleSendComment = (taskId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(taskId, commentInput.trim());
    setCommentInput('');
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'حرجة':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'عالية':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'متوسطة':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-rose-600" />
            <span>المهام وسير العمل الداخلي</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            توزيع المهام بين المحامين ومتابعة نسب الإنجاز
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md shadow-rose-600/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>مهمة جديدة</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            filterStatus === 'ALL'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          الكل ({tasks.length})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            filterStatus === 'in_progress'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          قيد التنفيذ
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            filterStatus === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          قيد الانتظار
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            filterStatus === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          منجزة
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بعنوان المهمة، المكلف بها، أو رقم القضية..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100 pr-10 shadow-xs transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xs">
          لا توجد مهام مطابقة للمعايير المحددة
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed' || task.progressPercentage === 100;
            const commentsOpen = activeCommentTaskId === task.id;

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-4 transition shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>موعد التسليم: {task.dueDate}</span>
                      </span>

                      {task.caseNumber && (
                        <span className="text-[10px] text-blue-700 font-mono font-bold">
                          (قضية #{task.caseNumber})
                        </span>
                      )}
                    </div>

                    <h4
                      className={`font-bold text-sm mt-1.5 leading-snug ${
                        isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="حذف المهمة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                      {task.assignedToName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">المكلف:</span>
                      <span className="font-bold text-slate-900">{task.assignedToName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateTaskProgress(
                          task.id,
                          isCompleted ? 50 : 100,
                          isCompleted ? 'in_progress' : 'completed'
                        )
                      }
                      className={`text-xs px-3 py-1 rounded-xl font-bold border transition ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isCompleted ? 'منجزة ✓' : 'إتمام المهمة'}
                    </button>
                    <span className="font-mono font-bold text-blue-800 text-xs">
                      {task.progressPercentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    style={{ width: `${task.progressPercentage}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setActiveCommentTaskId(commentsOpen ? null : task.id)
                    }
                    className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-bold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>النقاش الداخلي والملاحظات ({task.comments.length})</span>
                  </button>

                  <span className="text-[10px] text-slate-400 font-medium">خاص بفريق المكتب فقط</span>
                </div>

                {commentsOpen && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    {task.comments.length === 0 ? (
                      <p className="text-slate-400 text-[11px] text-center py-1">
                        لا توجد تعليقات سابقة. ابدأ النقاش للتنسيق مع الزملاء.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {task.comments.map((cm) => (
                          <div
                            key={cm.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                              <span className="font-bold text-blue-800">
                                {cm.authorName} ({cm.authorRole})
                              </span>
                              <span>{cm.createdAt}</span>
                            </div>
                            <p className="text-slate-800 font-medium leading-relaxed">{cm.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendComment(task.id);
                        }}
                        placeholder={`تعليق بصفتك (${currentLawyer.name})...`}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                      <button
                        onClick={() => handleSendComment(task.id)}
                        className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition font-bold shadow-xs"
                        title="إرسال التعليق"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
