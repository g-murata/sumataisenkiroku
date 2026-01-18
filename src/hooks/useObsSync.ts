import { useEffect, useCallback, useRef } from 'react';

// 通信チャンネル名
const CHANNEL_NAME = 'smash-record-sync';

// メッセージ型定義
type SyncMessage = 
  | { type: 'UPDATE_DATA' }
  | { type: 'TRIGGER_ANIMATION', result: "勝ち" | "負け" };

export const useObsSync = (
  onUpdateData?: () => void,
  onTriggerAnimation?: (result: "勝ち" | "負け") => void
) => {
  // 最新の関数を保持するためのRef (これでuseEffectの再実行を防ぐ)
  const onUpdateDataRef = useRef(onUpdateData);
  const onTriggerAnimationRef = useRef(onTriggerAnimation);

  // 関数が更新されたらRefも更新
  useEffect(() => {
    onUpdateDataRef.current = onUpdateData;
    onTriggerAnimationRef.current = onTriggerAnimation;
  }, [onUpdateData, onTriggerAnimation]);

  // ▼ 受信側 (OBS画面用)
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    
    channel.onmessage = (event) => {
      const msg = event.data as SyncMessage;
      
      // データ更新命令
      if (msg.type === 'UPDATE_DATA' && onUpdateDataRef.current) {
        onUpdateDataRef.current();
      }
      // アニメーション命令
      if (msg.type === 'TRIGGER_ANIMATION' && onTriggerAnimationRef.current) {
        onTriggerAnimationRef.current(msg.result);
      }
    };

    return () => {
      channel.close();
    };
  }, []); // 依存配列を空にして、接続を維持する

  // ▼ 送信側 (メイン操作画面用)
  const notifyUpdate = useCallback(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'UPDATE_DATA' });
    channel.close();
  }, []);

  const notifyAnimation = useCallback((result: "勝ち" | "負け") => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'TRIGGER_ANIMATION', result });
    channel.close();
  }, []);

  return { notifyUpdate, notifyAnimation };
};