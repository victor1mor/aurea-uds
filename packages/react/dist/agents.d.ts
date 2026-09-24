import React, { type HTMLAttributes, type OlHTMLAttributes, type ReactNode, type RefAttributes } from "react";
import { type IconName } from "./system.js";
export type AgentState = "idle" | "thinking" | "running" | "paused" | "error" | "completed";
export declare function AgentStatus({ state, label, className, ...props }: HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement> & {
    state?: AgentState;
    label?: ReactNode;
}): React.JSX.Element;
export interface AgentCapability {
    name: string;
    description?: string;
    icon?: IconName;
}
export declare function AgentCard({ name, description, avatarSrc, model, state, capabilities, actions, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    name: string;
    description?: ReactNode;
    avatarSrc?: string;
    model?: string;
    state?: AgentState;
    capabilities?: AgentCapability[];
    actions?: ReactNode;
}): React.JSX.Element;
export declare function AgentInspector({ title, sections, children, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    title: ReactNode;
    sections?: Array<{
        label: string;
        items: Array<{
            term: string;
            value: ReactNode;
        }>;
    }>;
}): React.JSX.Element;
export interface InvocationStep {
    id: string;
    label: string;
    detail?: string;
    state?: "running" | "done" | "error";
    content?: ReactNode;
}
export declare function InvocationPanel({ title, input, steps, output, running, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    title?: ReactNode;
    input?: ReactNode;
    steps?: InvocationStep[];
    output?: ReactNode;
    running?: boolean;
}): React.JSX.Element;
export type TaskState = "queued" | "running" | "completed" | "failed" | "blocked" | "paused";
export type TaskPriority = "low" | "medium" | "high";
export interface QueueTask {
    id: string;
    title: string;
    description?: string;
    state: TaskState;
    priority?: TaskPriority;
    progress?: number;
}
export declare function TaskQueue({ tasks, label, onRetry, className, ...props }: OlHTMLAttributes<HTMLOListElement> & RefAttributes<HTMLOListElement> & {
    tasks: QueueTask[];
    label?: string;
    onRetry?: (task: QueueTask) => void;
}): React.JSX.Element;
export type RiskLevel = "low" | "medium" | "high";
export declare function HumanApproval({ title, description, details, risk, reasoning, deadline, decision, onApprove, onDeny, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    title: ReactNode;
    description?: ReactNode;
    details?: Array<{
        term: string;
        value: ReactNode;
    }>;
    risk?: RiskLevel;
    reasoning?: ReactNode;
    deadline?: ReactNode;
    decision?: "approved" | "denied";
    onApprove?: () => void;
    onDeny?: () => void;
}): React.JSX.Element;
export type PermissionLevel = "ask" | "always" | "never";
export interface ToolPermissionEntry {
    id: string;
    name: string;
    description?: string;
    scope?: string;
    permission: PermissionLevel;
}
export declare function ToolPermission({ tools, onChange, label, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    tools: ToolPermissionEntry[];
    onChange?: (id: string, permission: PermissionLevel) => void;
    label?: string;
}): React.JSX.Element;
export type EventSeverity = "info" | "success" | "warning" | "danger";
export interface StreamEvent {
    id: string;
    title: ReactNode;
    time?: ReactNode;
    severity?: EventSeverity;
    detail?: ReactNode;
    group?: string;
}
export declare function EventStream({ events, label, follow, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    events: StreamEvent[];
    label?: string;
    follow?: boolean;
}): React.JSX.Element;
export interface TraceSpan {
    id: string;
    label: ReactNode;
    start: number;
    end: number;
    kind?: string;
    depth?: number;
    error?: boolean;
}
export declare function TraceTimeline({ spans, label, className, ...props }: OlHTMLAttributes<HTMLOListElement> & RefAttributes<HTMLOListElement> & {
    spans: TraceSpan[];
    label?: string;
}): React.JSX.Element;
export type HealthState = "operational" | "degraded" | "down" | "maintenance" | "unknown";
export interface HealthEntry {
    id: string;
    name: ReactNode;
    state: HealthState;
    detail?: ReactNode;
}
export declare function HealthMatrix({ entries, label, className, ...props }: HTMLAttributes<HTMLUListElement> & RefAttributes<HTMLUListElement> & {
    entries: HealthEntry[];
    label?: string;
}): React.JSX.Element;
export type UsageMetric = "tokens" | "cost" | "requests";
export interface ModelUsageEntry {
    id: string;
    model: string;
    provider?: string;
    tokens?: number;
    cost?: number;
    requests?: number;
}
export declare function ModelUsage({ entries, metric, label, currency, locale, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    entries: ModelUsageEntry[];
    metric?: UsageMetric;
    label?: string;
    currency?: string;
    locale?: string;
}): React.JSX.Element;
export interface CostSegment {
    id: string;
    label: ReactNode;
    amount: number;
}
export type CostState = "under" | "near" | "over";
export declare function CostMeter({ spent, limit, softLimit, currency, locale, period, segments, label, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    spent: number;
    limit?: number;
    softLimit?: number;
    currency?: string;
    locale?: string;
    period?: ReactNode;
    segments?: CostSegment[];
    label?: string;
}): React.JSX.Element;
export type MemoryScope = "episodic" | "semantic" | "procedural";
export type MemoryOperation = "added" | "updated" | "recalled" | "forgotten";
export interface MemoryRecord {
    id: string;
    content: ReactNode;
    scope: MemoryScope;
    operation: MemoryOperation;
    time?: ReactNode;
    source?: ReactNode;
    details?: Array<{
        term: string;
        value: ReactNode;
    }>;
}
export declare function MemoryLedger({ records, label, className, ...props }: OlHTMLAttributes<HTMLOListElement> & RefAttributes<HTMLOListElement> & {
    records: MemoryRecord[];
    label?: string;
}): React.JSX.Element;
export type MessageKind = "request" | "response" | "handoff" | "broadcast" | "error";
export interface AgentMessage {
    id: string;
    from: string;
    to?: string;
    body: ReactNode;
    time?: ReactNode;
    kind?: MessageKind;
    reason?: ReactNode;
    details?: Array<{
        term: string;
        value: ReactNode;
    }>;
}
export declare function InterAgentMessage({ messages, label, className, ...props }: OlHTMLAttributes<HTMLOListElement> & RefAttributes<HTMLOListElement> & {
    messages: AgentMessage[];
    label?: string;
}): React.JSX.Element;
export declare function AutomationCard({ name, description, trigger, action, enabled, onToggle, lastRun, lastResult, details, actions, className, ...props }: HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & {
    name: ReactNode;
    description?: ReactNode;
    trigger: ReactNode;
    action: ReactNode;
    enabled?: boolean;
    onToggle?: (enabled: boolean) => void;
    lastRun?: ReactNode;
    lastResult?: "success" | "failure";
    details?: Array<{
        term: string;
        value: ReactNode;
    }>;
    actions?: ReactNode;
}): React.JSX.Element;
