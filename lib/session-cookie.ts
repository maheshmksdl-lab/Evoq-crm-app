/** Cookie that marks a signed-in browser session. The value is the user id.
 *  Pre-migration builds used `crm_auth=true`; that value is treated as
 *  signed-in too so existing sessions are not dropped. */
export const SESSION_COOKIE = "crm_session";
export const LEGACY_COOKIE = "crm_auth";
