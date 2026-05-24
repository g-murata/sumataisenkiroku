import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MatchHistory } from '../types';

// メッセージ型定義
type SyncMessage = 
  | { type: 'UPDATE_DATA'; history: MatchHistory; isFiltered?: boolean }
  | { type: 'TRIGGER_ANIMATION'; result: "勝ち" | "負け" }
  | { type: 'REQUEST_CURRENT_DATA' };

export const useObsSync = (
  syncKey: string | null,
  isObsMode: boolean,
  onUpdateData?: (history: MatchHistory, isFiltered: boolean) => void,
  onTriggerAnimation?: (result: "勝ち" | "負け") => void,
  getCurrentHistory?: () => MatchHistory
) => {
  // 最新の関数を保持するためのRef
  const onUpdateDataRef = useRef(onUpdateData);
  const onTriggerAnimationRef = useRef(onTriggerAnimation);
  const getCurrentHistoryRef = useRef(getCurrentHistory);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    onUpdateDataRef.current = onUpdateData;
    onTriggerAnimationRef.current = onTriggerAnimation;
    getCurrentHistoryRef.current = getCurrentHistory;
  }, [onUpdateData, onTriggerAnimation, getCurrentHistory]);

  useEffect(() => {
    if (!syncKey) return;

    const channelName = `obs-sync-${syncKey}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'sync-message' }, (payload) => {
        const msg = payload.payload as SyncMessage;

        if (msg.type === 'UPDATE_DATA' && onUpdateDataRef.current) {
          const isFiltered = !!msg.isFiltered;
          // ★ 重要: 絞り込みデータの場合、操作画面（!isObsMode）側は自分のデータを壊さないよう無視する
          if (isFiltered && !isObsMode) {
            return;
          }
          onUpdateDataRef.current(msg.history, isFiltered);
        }
        else if (msg.type === 'TRIGGER_ANIMATION' && onTriggerAnimationRef.current) {
          onTriggerAnimationRef.current(msg.result);
        }
        else if (msg.type === 'REQUEST_CURRENT_DATA') {
          if (!isObsMode && getCurrentHistoryRef.current) {
            const currentHistory = getCurrentHistoryRef.current();
            if (currentHistory) {
              channel.send({
                type: 'broadcast',
                event: 'sync-message',
                payload: { type: 'UPDATE_DATA', history: currentHistory, isFiltered: false }
              });
            }
          }
        }
      })
      .subscribe((status) => {
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

  // ▼ 送信側
  const notifyUpdate = useCallback((history: MatchHistory, isFiltered: boolean = false) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
                event: 'sync-message',
        payload: { type: 'UPDATE_DATA', history, isFiltered }
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
