import { useEffect, useCallback } from 'react';

// 通信チャンネル名（合言葉）
const CHANNEL_NAME = 'smash-record-sync';

// メッセージの型定義
type SyncMessage = 
  | { type: 'UPDATE_DATA' }
  | { type: 'TRIGGER_ANIMATION', result: "勝ち" | "負け" };

export const useObsSync = (
  onUpdateData?: () => void,
  onTriggerAnimation?: (result: "勝ち" | "負け") => void
) => {
  
  // ▼ 受信側 (OBS画面用) の処理
  useEffect(() => {
    // チャンネルを開く
    const channel = new BroadcastChannel(CHANNEL_NAME);
    
    channel.onmessage = (event) => {
      const msg = event.data as SyncMessage;
      
      // データ更新命令が来たら
      if (msg.type === 'UPDATE_DATA' && onUpdateData) {
        onUpdateData();
      }
      // アニメーション命令が来たら
      if (msg.type === 'TRIGGER_ANIMATION' && onTriggerAnimation) {
        onTriggerAnimation(msg.result);
      }
    };

    return () => {
      channel.close();
    };
  }, [onUpdateData, onTriggerAnimation]);

  // ▼ 送信側 (メイン操作画面用) の処理
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