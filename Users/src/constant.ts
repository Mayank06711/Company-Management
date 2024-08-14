const EMAIL_VERIFY: string = "EMAIL_VERIFY";
const EMAIL_VERIFIED: string = "EMAIL_VERIFIED";
const OK_EMAIL_SENT: string = "OK_EMAIL_SENT";
const EMAIL_FAILED: string = "EMAIL_FAILED";
const EMAIL_RESEND: string = "EMAIL_RESEND";
const NOTIFICATION: string = "NOTIFICATION";
const NOTIFICATION_SUCCESS: string = "NOTIFICATION_SUCCESS";
const OK: string = "OK";
const SEND_EMAIL: string = "SEND_EMAIL";
const FAILED: string = "FAILED";
const CREATE: string = "CREATE";
const CREATED: string = "CREATED";
const UPDATE: string = "UPDATE";
const SOFT_DELETE: string = "SOFT_DELETE";
const PAYMENT: string = "PAYMENT";
const REJECT: string = "REJECT";
const ACCEPT: string = "ACCEPT";
const ACCESS_DENIED: string = "ACCESS_DENIED";
const ADMIN: string = "ADMIN";
const ONLY_ADMIN: string = "ONLY_ADMIN";
const UNKNOWN: string = "UNKNOWN";

// Priority values
const PRIORITY = {
  PAYMENT: 14,
  ADMIN: 13,
  SOFT_DELETE: 12,
  EMAIL_VERIFY: 11,
  EMAIL_VERIFIED: 10,
  OK_EMAIL_SENT: 9,
  EMAIL_RESEND: 8,
  NOTIFICATION: 7,
  NOTIFICATION_SUCCESS: 6,
  OK: 5,
  FAILED: 4,
  CREATE: 3,
  CREATED: 2,
  UPDATE: 1,
  REJECT: 0,
  ACCEPT: 1,
  UNKNOWN: -4,
};

export {
    EMAIL_VERIFY,
    EMAIL_VERIFIED,
    EMAIL_FAILED,
    OK_EMAIL_SENT,
    EMAIL_RESEND,
    NOTIFICATION,
    NOTIFICATION_SUCCESS,
    OK,
    FAILED,
    CREATE,
    CREATED,
    UPDATE,
    SOFT_DELETE,
    PAYMENT,
    REJECT,
    ACCEPT,
    ACCESS_DENIED,
    ADMIN,
    ONLY_ADMIN,
    UNKNOWN,
    SEND_EMAIL,
    PRIORITY
}


