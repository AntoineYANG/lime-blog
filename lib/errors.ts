/* eslint-disable @typescript-eslint/no-explicit-any */

export enum ErrorCode {
  // signin
  WRONG_USR_NAME_OR_PWD = 101,
}

abstract class ErrorMessage {
  readonly code: number;
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

export class WrongUsrNameOrPwdErrorMessage extends ErrorMessage {
  override readonly details?: void;
  constructor() {
    super(ErrorCode.WRONG_USR_NAME_OR_PWD, "WRONG_USR_NAME_OR_PWD");
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
