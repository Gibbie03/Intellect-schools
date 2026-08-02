import { NextRequest } from 'next/server';
import { getSupabaseClient } from './supabase';
import { getClientIp } from './rateLimit';
import type { SessionPayload } from './session';

type LogAuditParams = {
  request: NextRequest;
  schoolId: string;
  actor: Pick<SessionPayload, 'userId' | 'role' | 'fullName'>;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

/**
 * Records who did what to which record. Never throws -- a hiccup writing
 * the audit trail should never block or fail the actual operation it's
 * describing, so any error here is swallowed (and logged server-side).
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.from('audit_log').insert({
      school_id: params.schoolId,
      actor_user_id: params.actor.userId,
      actor_name: params.actor.fullName,
      actor_role: params.actor.role,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      before: params.before ?? null,
      after: params.after ?? null,
      ip_address: getClientIp(params.request),
    });
  } catch (err) {
    console.error('Failed to write audit log entry:', err);
  }
}
