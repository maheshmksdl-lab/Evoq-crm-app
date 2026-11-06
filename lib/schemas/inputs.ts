import { z } from "zod";
import {
  Account, Call, Comment, Contact, Deal, EmailLog, IsoDate, Lead, Meeting, Note, Report, Role, SavedView, Task, User,
  CustomField, Dashboard, HealthBand,
} from "./index";

/**
 * Create/update payloads. The SAME schemas validate form input (React Hook Form + zodResolver)
 * and service input (lib/services), so client and "server" can never disagree.
 */
const sys = { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true } as const;

export const LeadInput = Lead.omit({ ...sys, statusChangedAt: true, converted: true, healthOverride: true });
export type LeadInput = z.input<typeof LeadInput>;

export const AccountInput = Account.omit(sys);
export type AccountInput = z.input<typeof AccountInput>;

export const ContactInput = Contact.omit(sys);
export type ContactInput = z.input<typeof ContactInput>;

export const DealInput = Deal.omit({ ...sys, refId: true, stageChangedAt: true, stageHistory: true, fromLeadId: true })
  .extend({ probability: z.number().min(0, "0–100").max(100, "0–100").optional() });
export type DealInput = z.input<typeof DealInput>;

export const TaskInput = Task.omit({ ...sys, completedAt: true });
export type TaskInput = z.input<typeof TaskInput>;

export const CallInput = Call.omit({ ...sys, completedAt: true }).superRefine((v, ctx) => {
  if (v.status === "Completed" && !v.outcome) ctx.addIssue({ code: "custom", path: ["outcome"], message: "Record the outcome of a completed call" });
});
export type CallInput = z.input<typeof CallInput>;

export const MeetingInput = Meeting.omit({ ...sys, completedAt: true }).superRefine((v, ctx) => {
  if (Date.parse(v.endAt) <= Date.parse(v.startAt)) ctx.addIssue({ code: "custom", path: ["endAt"], message: "End time must be after the start time" });
});
export type MeetingInput = z.input<typeof MeetingInput>;

export const NoteInput = Note.pick({ related: true, body: true });
export const CommentInput = Comment.pick({ related: true, body: true });
export const EmailLogInput = EmailLog.pick({ related: true, direction: true, to: true, subject: true, body: true, at: true });
export type EmailLogInput = z.input<typeof EmailLogInput>;

export const ConvertLeadInput = z.object({
  account: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("new"), name: z.string().trim().min(1, "Account name is required").max(160) }),
    z.object({ mode: z.literal("existing"), accountId: z.string().min(1, "Choose an account") }),
  ]),
  contact: z.object({ firstName: z.string().trim().max(80), lastName: z.string().trim().min(1, "Contact last name is required").max(80) }),
  deal: z.discriminatedUnion("create", [
    z.object({ create: z.literal(false) }),
    // Pre-existing rule (ConvertToDealDrawer): a deal needs a name and a closing date.
    z.object({
      create: z.literal(true), name: z.string().trim().min(1, "Deal name is required").max(160),
      amount: z.number({ error: "Enter an amount" }).nonnegative("Amount cannot be negative"), closingDate: IsoDate,
      stage: Deal.shape.stage,
    }),
  ]),
  ownerId: z.string().nullable(),
  notifyOwner: z.boolean().default(false),
});
export type ConvertLeadInput = z.input<typeof ConvertLeadInput>;

export const HealthOverrideInput = z.object({ band: HealthBand, reason: z.string().trim().min(3, "Give a reason (min 3 characters)").max(500) });

export const UserInput = User.omit({ id: true, createdAt: true, name: true }).extend({ name: z.string().optional() });
export type UserInput = z.input<typeof UserInput>;
export const RoleInput = Role.omit({ id: true, createdAt: true });
export const SavedViewInput = SavedView.omit({ id: true, ownerId: true, createdAt: true });
export type SavedViewInput = z.input<typeof SavedViewInput>;
export const ReportInput = Report.omit({ id: true, ownerId: true, createdAt: true, updatedAt: true, lastAccessedAt: true });
export type ReportInput = z.input<typeof ReportInput>;
export const DashboardInput = Dashboard.omit({ id: true, ownerId: true, createdAt: true, updatedAt: true });
export type DashboardInput = z.input<typeof DashboardInput>;
export const CustomFieldInput = CustomField.omit({ id: true, createdAt: true });
export type CustomFieldInput = z.input<typeof CustomFieldInput>;

export const SignInInput = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
