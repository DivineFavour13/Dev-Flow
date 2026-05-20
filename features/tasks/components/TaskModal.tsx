"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useUIStore } from "@/store/ui";
import { useTaskStore } from "@/store/tasks";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/features/tasks/hooks/useTasks";
import { useLabels } from "@/features/tasks/hooks/useLabels";
import type { Priority, TaskStatus } from "@prisma/client";

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  labelIds: string[];
};

export function TaskModal() {
  const { taskModalOpen, editingTaskId, defaultStatus, closeTaskModal } = useUIStore();
  const tasks = useTaskStore((s) => s.tasks);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: labels = [] } = useLabels();

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;
  const isEditing = !!editingTask;

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    status: defaultStatus ?? "TODO",
    priority: "LOW",
    dueDate: "",
    labelIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (!taskModalOpen) return;

    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description ?? "",
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split("T")[0]
          : "",
        labelIds: editingTask.labels.map((l) => l.label.id),
      });
    } else {
      setForm({
        title: "",
        description: "",
        status: defaultStatus ?? "TODO",
        priority: "LOW",
        dueDate: "",
        labelIds: [],
      });
    }
    setErrors({});
  }, [taskModalOpen, editingTask, defaultStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) next.title = "Title is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      labelIds: form.labelIds,
    };

    if (isEditing) {
      updateTask.mutate({ id: editingTask.id, ...payload });
    } else {
      createTask.mutate(payload);
    }

    closeTaskModal();
  }

  async function handleDelete() {
    if (!editingTask) return;
    deleteTask.mutate(editingTask.id);
    closeTaskModal();
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Modal
      open={taskModalOpen}
      onClose={closeTaskModal}
      title={isEditing ? "Edit Task" : "New Task"}
    >
      <div className="space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Add more context… (optional)"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => set("status", e.target.value as TaskStatus)}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => set("priority", e.target.value as Priority)}
          />
        </div>

        <Input
          label="Due date"
          type="date"
          value={form.dueDate}
          onChange={(e) => set("dueDate", e.target.value)}
        />

        {labels.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-foreground">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((label) => {
                const selected = form.labelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() =>
                      set(
                        "labelIds",
                        selected
                          ? form.labelIds.filter((id) => id !== label.id)
                          : [...form.labelIds, label.id]
                      )
                    }
                    className="inline-flex items-center h-6 px-2 rounded text-xs font-medium border transition-all"
                    style={{
                      backgroundColor: selected ? `${label.color}22` : "transparent",
                      color: label.color,
                      borderColor: selected ? label.color : `${label.color}44`,
                    }}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {isEditing ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              loading={deleteTask.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={closeTaskModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={isPending}>
              {isEditing ? "Save changes" : "Create task"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}