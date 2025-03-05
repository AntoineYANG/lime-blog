/* eslint-disable @typescript-eslint/no-explicit-any */

export enum ErrorCode {
  // auth
  LOGGED_OUT = 1001,
  // signin
  WRONG_USR_NAME_OR_PWD = 2001,
  BAD_USR_STATUS = 2002,
  // api endpoint
  BAD_PAYLOAD = 3001,
}

abstract class ErrorMessage {
  readonly code: ErrorCode;
  readonly label: string;
  readonly details?: any;

  constructor(code: number, label: string, details?: any) {
    this.code = code;
    this.label = label;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export class LoggedOutErrorMessage extends ErrorMessage {
  override readonly details?: void;
  constructor() {
    super(ErrorCode.LOGGED_OUT, "LOGGED_OUT");
  }
}

export class WrongUsrNameOrPwdErrorMessage extends ErrorMessage {
  override readonly details?: void;
  constructor() {
    super(ErrorCode.WRONG_USR_NAME_OR_PWD, "WRONG_USR_NAME_OR_PWD");
  }
}

export class BadUsrStatusErrorMessage extends ErrorMessage {
  override readonly details?: string;
  constructor(details: string) {
    super(ErrorCode.BAD_USR_STATUS, "BAD_USR_STATUS");
    this.details = details;
  }
}

export class BadPayloadErrorMessage extends ErrorMessage {
  override readonly details?: string;
  constructor(details: string) {
    super(ErrorCode.BAD_PAYLOAD, "BAD_PAYLOAD");
    this.details = details;
  }
}

const ErrorMessageCauseFlag: unique symbol = Symbol("ErrorMessageCause");

export class ErrorMessageCause extends Error {
  readonly $$flag = ErrorMessageCauseFlag;
  override readonly cause?: ErrorMessage;
  constructor(errorMessage: ErrorMessage) {
    super(errorMessage.label, {
      cause: errorMessage,
    });
  }
}

export const raiseErrorMessage = (errorMessage: ErrorMessage): Required<ErrorMessageCause> => {
  return new ErrorMessageCause(errorMessage) as Required<ErrorMessageCause>;
};
