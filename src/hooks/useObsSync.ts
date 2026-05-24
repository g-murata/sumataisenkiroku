import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MatchHistory } from '../types';

// メッセージ型定義
type SyncMessage = 
  | { type: 'UPDATE_DATA'; history: MatchHistory }
  | { type: 'TRIGGER_ANIMATION'; result: "勝ち" | "負け" }
  | { type: 'REQUEST_CURRENT_DATA' };

export const useObsSync = (
  syncKey: string | null,
  isObsMode: boolean,
  onUpdateData?: (history?: MatchHistory) => void,
  onTriggerAnimation?: (result: "勝ち" | "負け") => void,
  getCurrentHistory?: () => MatchHistory
) => {
  // 最新の関数を保持するためのRef (これでuseEffectの再実行を防ぐ)
  const onUpdateDataRef = useRef(onUpdateData);
  const onTriggerAnimationRef = useRef(onTriggerAnimation);
  const getCurrentHistoryRef = useRef(getCurrentHistory);
  const channelRef = useRef<any>(null);

  // 関数が更新されたらRefも更新
  useEffect(() => {
    onUpdateDataRef.current = onUpdateData;
    onTriggerAnimationRef.current = onTriggerAnimation;
    getCurrentHistoryRef.current = getCurrentHistory;
  }, [onUpdateData, onTriggerAnimation, getCurrentHistory]);

  // ▼ Supabase Realtime チャンネルのセットアップ
  useEffect(() => {
    if (!syncKey) return;

    // 混線を避けるために syncKey を含めたチャンネル名を設定
    const channelName = `obs-sync-${syncKey}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }, // 自分自身には送信イベントを戻さない
      },
    });

    channelRef.current = channel;

    // イベントの受信ハンドラを登録
    channel
      .on('broadcast', { event: 'sync-message' }, (payload) => {
        const msg = payload.payload as SyncMessage;

        // ① データ更新命令を受信
        if (msg.type === 'UPDATE_DATA' && onUpdateDataRef.current) {
          onUpdateDataRef.current(msg.history);
        }
        // ② アニメーション命令を受信
        else if (msg.type === 'TRIGGER_ANIMATION' && onTriggerAnimationRef.current) {
          onTriggerAnimationRef.current(msg.result);
        }
        // ③ データ要求を受信 (通常ブラウザ側が、OBS側からのデータ要求を受け取ったとき)
        else if (msg.type === 'REQUEST_CURRENT_DATA') {
          if (!isObsMode && getCurrentHistoryRef.current) {
            const currentHistory = getCurrentHistoryRef.current();
            if (currentHistory) {
              channel.send({
                type: 'broadcast',
                event: 'sync-message',
                payload: { type: 'UPDATE_DATA', history: currentHistory }
              });
            }
          }
        }
      })
      .subscribe((status) => {
        // OBSモードの場合、購読完了時に通常ブラウザ側へ「現在のデータを送って」と要求する
        if (status === 'SUBSCRIBED' && isObsMode) {
          channel.send({
            type: 'broadcast',
            event: 'sync-message',
            payload: { type: 'REQUEST_CURRENT_DATA' }
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncKey, isObsMode]);

  // ▼ 送信側 (メイン操作画面用)
  const notifyUpdate = useCallback((history: MatchHistory) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync-message',
        payload: { type: 'UPDATE_DATA', history }
      });
    }
  }, []);

  const notifyAnimation = useCallback((result: "勝ち" | "負け") => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync-message',
        payload: { type: 'TRIGGER_ANIMATION', result }
      });
    }
  }, []);

  return { notifyUpdate, notifyAnimation };
};