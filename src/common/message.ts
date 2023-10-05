export type MessagePayload<T = undefined> = {
  type: string;
  args: T;
};

// eslint-disable-next-line @typescript-eslint/ban-types
const HandlerMap = new Map<string, Function>();

export const handleMessage = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any, 
  _: chrome.runtime.MessageSender, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendResponse: (response?: any) => void
) => {
  const { type, args } = (typeof message === 'object' && message !== null) ? 
    message : 
    { type: undefined, args: message };
  const handler = HandlerMap.get(type ?? '');
  if (handler) {
    const ret = handler(args);
    if (ret instanceof Promise) {
      ret.then(sendResponse);
      return true; // in case one wants to send response asynchronously
    } else {
      sendResponse(ret);
    }
  } else {
    sendResponse({'error': `Unregistered message type ${type}.`});
  }
  return undefined;
};

export function useMessageHandler <TResult>(
  handler: () => TResult | Promise<TResult>,
  type?: string
): () => Promise<TResult>;
export function useMessageHandler <TPayload, TResult>(
  handler: (payload: TPayload) => TResult | Promise<TResult>,
  type?: string
): (payload: TPayload) => Promise<TResult>;
export function useMessageHandler <TPayload, TResult>(
  handler: (payload: TPayload) => TResult | Promise<TResult>,
  type?: string
) {
  const typeVar = type || handler.name || handler.toString();
  HandlerMap.set(typeVar, handler);
  return (payload: TPayload) => new Promise((res, rej) => {
    chrome.runtime.sendMessage(
      { type: typeVar, args: payload }, 
      (resp) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res(resp);
      }
    );
  });
}


export const tryConnect = useMessageHandler(() => {
  return true;
}, 'tryConnect');
