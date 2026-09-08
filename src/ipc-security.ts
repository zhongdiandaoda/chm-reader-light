export interface IpcSenderIdentity {
  sender: unknown;
  senderFrame: unknown;
}

export interface TrustedWebContentsIdentity {
  mainFrame: unknown;
}

export function isTrustedIpcSender(
  event: IpcSenderIdentity,
  trustedWebContents: TrustedWebContentsIdentity | null,
): boolean {
  return Boolean(
    trustedWebContents
    && event.sender === trustedWebContents
    && event.senderFrame === trustedWebContents.mainFrame,
  );
}
